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
 * CCIPReceiver base). The payload is abi.encode(bool isRemoval, address user,
 * uint16 country, bytes32 identityHash, uint64 seq).
 *
 * SETUP: this contract must be granted SYNC_ROLE on the registry, and
 * setTrustedSender(sourceSelector, homeSender) must be called, or every sync
 * message reverts. See scripts/setup-identity-sync.ts.
 *
 * ORDERING: CCIP does not guarantee cross-message ordering, and out-of-order
 * delivery of a stale `register` after a newer `remove` would re-verify a
 * de-authorized (possibly sanctioned) user — a safety hole, not merely an
 * availability gap. The sender therefore embeds a per-user monotonic sequence
 * number; anything at or below the last applied seq is discarded (not
 * reverted, so it cannot be replayed via manual re-execution).
 */
contract IdentitySyncReceiver is CCIPReceiver, Ownable {
    IdentityRegistry public immutable registry;

    // sourceChainSelector => trusted IdentitySyncSender address on that chain
    mapping(uint64 => address) public trustedSender;

    // The single source selector currently allowed a nonzero trustedSender.
    // lastSeq is keyed per user only, so two concurrently-trusted senders with
    // independent counters would collide in one sequence space (the slower
    // source's messages silently discarded). Home-chain migration = clear the
    // old source, then set the new one.
    uint64 public activeSourceSelector;

    // Highest sequence number applied per user (from the sender's userSeq).
    mapping(address => uint64) public lastSeq;

    event TrustedSenderSet(uint64 indexed sourceChainSelector, address sender);
    event IdentitySynced(
        address indexed user,
        bool removal,
        uint64 indexed sourceChainSelector
    );
    event StaleSyncDiscarded(
        address indexed user,
        uint64 seq,
        uint64 lastAppliedSeq
    );

    error UntrustedSource(uint64 sourceChainSelector, address sender);
    error SourceAlreadyActive(uint64 activeSourceSelector);

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
        if (sender != address(0)) {
            if (
                activeSourceSelector != 0 &&
                activeSourceSelector != sourceChainSelector
            ) {
                revert SourceAlreadyActive(activeSourceSelector);
            }
            activeSourceSelector = sourceChainSelector;
        } else if (activeSourceSelector == sourceChainSelector) {
            activeSourceSelector = 0;
        }
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

        (
            bool isRemoval,
            address user,
            uint16 country,
            bytes32 identityHash,
            uint64 seq
        ) = abi.decode(message.data, (bool, address, uint16, bytes32, uint64));

        // Discard (do not revert on) stale/reordered messages: a revert could
        // be manually re-executed later, which is exactly the reordering
        // attack this guard exists to stop.
        if (seq <= lastSeq[user]) {
            emit StaleSyncDiscarded(user, seq, lastSeq[user]);
            return;
        }
        lastSeq[user] = seq;

        if (isRemoval) {
            registry.syncRemoveIdentity(user);
        } else {
            registry.syncRegisterIdentity(user, country, identityHash);
        }
        emit IdentitySynced(user, isRemoval, message.sourceChainSelector);
    }

    // CCIPReceiver defines supportsInterface; nothing else to expose.
}
