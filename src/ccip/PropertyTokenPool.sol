// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {IBurnMintERC20} from "@chainlink/contracts/src/v0.8/shared/token/ERC20/IBurnMintERC20.sol";
import {BurnMintTokenPool} from "@chainlink/contracts-ccip/contracts/pools/BurnMintTokenPool.sol";

/**
 * @title PropertyTokenPool
 * @dev CCIP burn/mint token pool for BridgedPropertyToken. This is a stock
 * BurnMintTokenPool with no release/mint override by design.
 *
 * Compliance is NOT enforced in the pool: CCIP's OffRamp requires
 * releaseOrMint to increase the receiver's balance by exactly the bridged
 * amount (OffRamp.ReleaseOrMintBalanceMismatch), so a pool cannot gate or
 * redirect the mint without reverting the message and stranding the tokens
 * already burned on the source chain. Compliance is enforced one layer down in
 * BridgedPropertyToken's mint-and-freeze model: the mint always delivers, but
 * the received tokens are non-transferable until the holder is verified.
 *
 * Named subclass (rather than deploying the base directly) so there is a
 * compilable, deployable artifact and a documented home for this rationale.
 */
contract PropertyTokenPool is BurnMintTokenPool {
    constructor(
        IBurnMintERC20 token,
        uint8 localTokenDecimals,
        address[] memory allowlist,
        address rmnProxy,
        address router
    )
        BurnMintTokenPool(token, localTokenDecimals, allowlist, rmnProxy, router)
    {}
}
