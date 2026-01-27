// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakingPool is Ownable {
    IERC20 public stakingToken; // COMM
    IERC20 public rewardToken;  // CREUSD

    // Simplified Staking: Pro-rata shares of rewards based on staked amount
    // For MVP, just a holder

    constructor(address _stakingToken, address _rewardToken, address initialOwner) Ownable(initialOwner) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    // ... Staking Logic Placeholder ...
}
