// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./PropertyToken.sol";

/**
 * @title BridgedPropertyToken
 * @dev Destination-chain representation of a PropertyToken for CCIP burn/mint
 * bridging (CCT standard). Deploys with zero supply; a CCIP token pool holding
 * MINTER_ROLE/BURNER_ROLE mints on inbound transfers and burns on outbound.
 *
 * Compliance model: mint-and-freeze. CCIP's OffRamp requires releaseOrMint to
 * increase the *receiver's* balance by exactly the bridged amount
 * (ReleaseOrMintBalanceMismatch otherwise), so the mint cannot be gated or
 * redirected without stranding already-burned tokens. Instead, bridge mints
 * (from == address(0)) deliver unconditionally, and the received tokens are
 * non-transferable until the holder is verified — transfers still require both
 * ends verified/exempt (PropertyToken/ComplianceEnabled). An unverified
 * receiver therefore holds but cannot move tokens until KYC completes.
 */
contract BridgedPropertyToken is PropertyToken, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    constructor(
        string memory _name,
        string memory _symbol,
        address _compliance,
        address _owner
    ) PropertyToken(_name, _symbol, 0, _compliance, _owner) {
        _grantRole(DEFAULT_ADMIN_ROLE, _owner);
    }

    /// @dev Bridge mints deliver unconditionally so CCIP's OffRamp balance
    /// check passes; transfer restrictions still gate what an unverified
    /// holder can do with the tokens.
    function _checkCompliance(
        address from,
        address to
    ) internal view override {
        if (from == address(0)) return;
        super._checkCompliance(from, to);
    }

    // IBurnMintERC20 surface consumed by Chainlink CCIP token pools.

    function mint(address account, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(account, amount);
    }

    /// @notice Burns the caller's own tokens. The only burn path CCIP
    /// BurnMintTokenPool uses (it burns from the pool's own balance).
    function burn(uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(msg.sender, amount);
    }

    /// @notice Allowance-checked burn from `account`. Matches the
    /// IBurnMintERC20 reference where burn(account,amount) aliases burnFrom,
    /// so a BURNER_ROLE holder cannot confiscate balances without approval.
    function burnFrom(address account, uint256 amount) public onlyRole(BURNER_ROLE) {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }

    function burn(address account, uint256 amount) external onlyRole(BURNER_ROLE) {
        burnFrom(account, amount);
    }
}
