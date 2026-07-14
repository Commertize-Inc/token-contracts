// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {IBurnMintERC20} from "@chainlink/contracts/src/v0.8/shared/token/ERC20/IBurnMintERC20.sol";
import {BurnMintTokenPool} from "@chainlink/contracts-ccip/contracts/pools/BurnMintTokenPool.sol";
import {Pool} from "@chainlink/contracts-ccip/contracts/libraries/Pool.sol";

import {ComplianceEnabled} from "../compliance/ComplianceEnabled.sol";
import {TokenCompliance} from "../compliance/TokenCompliance.sol";

/**
 * @title CompliantPropertyTokenPool
 * @dev CCIP burn/mint pool with SOURCE-SIDE compliance gating.
 *
 * The destination chain cannot reject a mint without stranding already-burned
 * tokens (CCIP's OffRamp requires releaseOrMint to credit the receiver exactly,
 * so a rejected receiver either strands funds or forces the mint-and-freeze
 * fallback). To guarantee that tokens can NEVER be bridged to an unverified
 * receiver, this pool checks the destination receiver against the local
 * IdentityRegistry BEFORE burning, in lockOrBurn. Because identity is global
 * and mirrored to every chain (IdentityRegistry.SYNC_ROLE), a receiver verified
 * on the destination is verified here too, so the local check is a sound proxy.
 *
 * The destination pool remains a mint-and-freeze pool: if a receiver's
 * verification is revoked in the brief window between burn and mint, the tokens
 * are still delivered but frozen (non-transferable) rather than stranded.
 * Source gating removes the common case; mint-and-freeze covers the race.
 *
 * Receiver is read from lockOrBurnIn.receiver, which is abi.encode(address) for
 * EVM destinations. Non-EVM (non-32-byte) receivers are rejected.
 */
contract CompliantPropertyTokenPool is BurnMintTokenPool {
    error ReceiverNotVerified(address receiver);
    error NonEvmReceiver();

    event OutboundGated(
        uint64 indexed remoteChainSelector,
        address indexed receiver,
        uint256 amount
    );

    constructor(
        IBurnMintERC20 token,
        uint8 localTokenDecimals,
        address[] memory allowlist,
        address rmnProxy,
        address router
    )
        BurnMintTokenPool(token, localTokenDecimals, allowlist, rmnProxy, router)
    {}

    /// @dev Gates the destination receiver before delegating to the base
    /// lock/burn. Runs alongside the base's own validation (allowlist, RMN,
    /// rate limits), which execute inside super.lockOrBurn.
    function lockOrBurn(
        Pool.LockOrBurnInV1 calldata lockOrBurnIn
    ) public override returns (Pool.LockOrBurnOutV1 memory) {
        if (lockOrBurnIn.receiver.length != 32) revert NonEvmReceiver();
        address receiver = abi.decode(lockOrBurnIn.receiver, (address));

        TokenCompliance c = ComplianceEnabled(address(i_token)).compliance();
        if (
            !c.identityRegistry().isVerified(receiver) && !c.isExempt(receiver)
        ) {
            revert ReceiverNotVerified(receiver);
        }

        emit OutboundGated(
            lockOrBurnIn.remoteChainSelector,
            receiver,
            lockOrBurnIn.amount
        );
        return super.lockOrBurn(lockOrBurnIn);
    }
}
