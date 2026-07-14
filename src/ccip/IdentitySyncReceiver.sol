// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {CCIPReceiver} from "@chainlink/contracts-ccip/contracts/applications/CCIPReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IdentityRegistry} from "../compliance/IdentityRegistry.sol";

/**
 * @title IdentitySyncReceiver
 * @dev Destination-chain endpoint that mirrors identity registrations sent from
 * the home chain via CCIP, keeping this chain's IdentityRegistry consistent
 * with global KYC state. Requires SYNC_ROLE on the registry.
 *
 * Only messages from a configured trusted sender on a trusted source chain are
 * accepted; the CCIP router is the only permitted caller (enforced by the
 * CCIPReceiver base). The payload is
 * abi.encode(bool isRemoval, address user, uint16 country, bytes32 identityHash).
 *
 * SETUP: this contract must be granted SYNC_ROLE on the registry, and
 * setTrustedSender(sourceSelector, homeSender) must be called, or every sync
 * message reverts. See scripts/setup-identity-sync.ts.
 *
 * ORDERING: register/remove are applied in delivery order and are individually
 * idempotent, but CCIP does not guarantee cross-message ordering. A stuck-then-
 * retried remove landing after a fresh register can transiently leave this chain
 * out of sync (a verified user shown unverified here). This never delivers
 * unfrozen tokens to an unverified receiver (the safety invariant), only a
 * temporary availability gap resolved by re-broadcasting. A monotonic per-user
 * sequence number is the follow-up fix if strict ordering is required.
 */
contract IdentitySyncReceiver is CCIPReceiver, Ownable {
    IdentityRegistry public immutable registry;

    // sourceChainSelector => trusted IdentitySyncSender address on that chain
    mapping(uint64 => address) public trustedSender;

    event TrustedSenderSet(uint64 indexed sourceChainSelector, address sender);
    event IdentitySynced(
        address indexed user,
        bool removal,
        uint64 indexed sourceChainSelector
    );

    error UntrustedSource(uint64 sourceChainSelector, address sender);

    constructor(
        address router,
        address _registry,
        address _owner
    ) CCIPReceiver(router) Ownable(_owner) {
        registry = IdentityRegistry(_registry);
    }

    function setTrustedSender(
        uint64 sourceChainSelector,
        address sender
    ) external onlyOwner {
        trustedSender[sourceChainSelector] = sender;
        emit TrustedSenderSet(sourceChainSelector, sender);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        address sender = abi.decode(message.sender, (address));
        address expected = trustedSender[message.sourceChainSelector];
        if (expected == address(0) || sender != expected) {
            revert UntrustedSource(message.sourceChainSelector, sender);
        }

        (bool isRemoval, address user, uint16 country, bytes32 identityHash) = abi
            .decode(message.data, (bool, address, uint16, bytes32));

        if (isRemoval) {
            registry.syncRemoveIdentity(user);
        } else {
            registry.syncRegisterIdentity(user, country, identityHash);
        }
        emit IdentitySynced(user, isRemoval, message.sourceChainSelector);
    }

    // CCIPReceiver defines supportsInterface; nothing else to expose.
}
