// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IIdentityRegistry
/// @notice CCID-anchored identity registry supporting multiple wallets per identity.
interface IIdentityRegistry {
	event IdentityRegistered(bytes32 indexed ccid, address indexed wallet);
	event IdentityRemoved(bytes32 indexed ccid);
	event WalletLinked(bytes32 indexed ccid, address indexed wallet);
	event WalletUnlinked(bytes32 indexed ccid, address indexed wallet);

	/// @notice Register a new identity with its first wallet.
	function registerIdentity(bytes32 ccid, address wallet) external;

	/// @notice Remove an identity and unlink all its wallets.
	function removeIdentity(bytes32 ccid) external;

	/// @notice Link an additional wallet to an existing identity.
	function linkWallet(bytes32 ccid, address wallet) external;

	/// @notice Unlink a wallet from an identity.
	function unlinkWallet(bytes32 ccid, address wallet) external;

	/// @notice Get the CCID for a wallet address. Returns bytes32(0) if unregistered.
	function getIdentity(address wallet) external view returns (bytes32);

	/// @notice Get all wallets linked to a CCID.
	function getWallets(bytes32 ccid) external view returns (address[] memory);

	/// @notice Check if a wallet is linked to any identity.
	function isRegistered(address wallet) external view returns (bool);
}
