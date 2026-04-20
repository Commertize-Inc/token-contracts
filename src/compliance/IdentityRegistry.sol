// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IIdentityRegistry.sol";

/// @title IdentityRegistry
/// @notice CCID-anchored identity registry. Each investor gets a bytes32 identity
/// that can be linked to multiple wallet addresses.
contract IdentityRegistry is IIdentityRegistry, AccessControl {
	bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
	uint8 public constant MAX_WALLETS_PER_IDENTITY = 10;

	// MARK: Storage

	mapping(bytes32 => address[]) private _wallets;
	mapping(address => bytes32) private _identityOf;
	mapping(bytes32 => bool) private _exists;

	// MARK: Constructor

	constructor(address admin) {
		_grantRole(DEFAULT_ADMIN_ROLE, admin);
		_grantRole(REGISTRAR_ROLE, admin);
	}

	// MARK: Identity Management

	/// @inheritdoc IIdentityRegistry
	function registerIdentity(
		bytes32 ccid,
		address wallet
	) external onlyRole(REGISTRAR_ROLE) {
		require(ccid != bytes32(0), "Invalid CCID");
		require(wallet != address(0), "Invalid wallet");
		require(!_exists[ccid], "Identity already exists");
		require(_identityOf[wallet] == bytes32(0), "Wallet already linked");

		_exists[ccid] = true;
		_identityOf[wallet] = ccid;
		_wallets[ccid].push(wallet);

		emit IdentityRegistered(ccid, wallet);
	}

	/// @inheritdoc IIdentityRegistry
	function removeIdentity(
		bytes32 ccid
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		require(_exists[ccid], "Identity does not exist");

		address[] storage wallets = _wallets[ccid];
		for (uint256 i = 0; i < wallets.length; i++) {
			delete _identityOf[wallets[i]];
			emit WalletUnlinked(ccid, wallets[i]);
		}
		delete _wallets[ccid];
		delete _exists[ccid];

		emit IdentityRemoved(ccid);
	}

	/// @inheritdoc IIdentityRegistry
	function linkWallet(
		bytes32 ccid,
		address wallet
	) external onlyRole(REGISTRAR_ROLE) {
		require(_exists[ccid], "Identity does not exist");
		require(wallet != address(0), "Invalid wallet");
		require(_identityOf[wallet] == bytes32(0), "Wallet already linked");
		require(
			_wallets[ccid].length < MAX_WALLETS_PER_IDENTITY,
			"Max wallets reached"
		);

		_identityOf[wallet] = ccid;
		_wallets[ccid].push(wallet);

		emit WalletLinked(ccid, wallet);
	}

	/// @inheritdoc IIdentityRegistry
	function unlinkWallet(
		bytes32 ccid,
		address wallet
	) external onlyRole(REGISTRAR_ROLE) {
		require(_exists[ccid], "Identity does not exist");
		require(_identityOf[wallet] == ccid, "Wallet not linked to this identity");
		require(_wallets[ccid].length > 1, "Cannot unlink last wallet");

		delete _identityOf[wallet];

		// Swap-and-pop removal
		address[] storage wallets = _wallets[ccid];
		for (uint256 i = 0; i < wallets.length; i++) {
			if (wallets[i] == wallet) {
				wallets[i] = wallets[wallets.length - 1];
				wallets.pop();
				break;
			}
		}

		emit WalletUnlinked(ccid, wallet);
	}

	// MARK: Queries

	/// @inheritdoc IIdentityRegistry
	function getIdentity(address wallet) external view returns (bytes32) {
		return _identityOf[wallet];
	}

	/// @inheritdoc IIdentityRegistry
	function getWallets(
		bytes32 ccid
	) external view returns (address[] memory) {
		return _wallets[ccid];
	}

	/// @inheritdoc IIdentityRegistry
	function isRegistered(address wallet) external view returns (bool) {
		return _identityOf[wallet] != bytes32(0);
	}
}
