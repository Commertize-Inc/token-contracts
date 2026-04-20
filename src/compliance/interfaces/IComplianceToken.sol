// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IComplianceToken
/// @notice ERC-3643 compliance controls: freeze, partial freeze, forced transfer, pause.
interface IComplianceToken {
	event AddressFrozen(address indexed addr, bool frozen);
	event TokensFrozen(address indexed addr, uint256 amount);
	event TokensUnfrozen(address indexed addr, uint256 amount);
	event TokensRecovered(
		address indexed from,
		address indexed to,
		uint256 amount
	);

	/// @notice Freeze or unfreeze an address entirely.
	function setAddressFrozen(address addr, bool frozen) external;

	/// @notice Lock a portion of an address's token balance.
	function freezePartialTokens(address addr, uint256 amount) external;

	/// @notice Unlock a portion of previously frozen tokens.
	function unfreezePartialTokens(address addr, uint256 amount) external;

	/// @notice Admin recovery: transfer tokens bypassing policy enforcement.
	function forcedTransfer(
		address from,
		address to,
		uint256 amount
	) external;

	/// @notice Transfer to multiple recipients in one transaction.
	function batchTransfer(
		address[] calldata to,
		uint256[] calldata amounts
	) external;

	/// @notice Batch admin recovery transfers.
	function batchForcedTransfer(
		address[] calldata from,
		address[] calldata to,
		uint256[] calldata amounts
	) external;

	/// @notice Check if an address is fully frozen.
	function isFrozen(address addr) external view returns (bool);

	/// @notice Get the amount of frozen tokens for an address.
	function getFrozenTokens(address addr) external view returns (uint256);

	/// @notice Get the policy engine address.
	function policyEngine() external view returns (address);
}
