// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/ICredentialRegistry.sol";
import "./interfaces/IIdentityRegistry.sol";

/// @title CredentialRegistry
/// @notice Stores typed credentials (KYC, AML, accreditation, residency) with on-chain expiry.
contract CredentialRegistry is ICredentialRegistry, AccessControl {
	bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

	IIdentityRegistry public identityRegistry;

	// MARK: Storage

	/// @dev ccid => credentialType => Credential
	mapping(bytes32 => mapping(bytes32 => Credential)) private _credentials;

	/// @dev ccid => credentialType => exists
	mapping(bytes32 => mapping(bytes32 => bool)) private _hasCredential;

	/// @dev ccid => list of active credential type IDs
	mapping(bytes32 => bytes32[]) private _credentialTypes;

	/// @dev ccid => credentialType => index in _credentialTypes (for O(1) removal)
	mapping(bytes32 => mapping(bytes32 => uint256)) private _credentialIndex;

	// MARK: Constructor

	constructor(address identityRegistry_, address admin) {
		require(identityRegistry_ != address(0), "Invalid identity registry");
		identityRegistry = IIdentityRegistry(identityRegistry_);

		_grantRole(DEFAULT_ADMIN_ROLE, admin);
		_grantRole(ISSUER_ROLE, admin);
	}

	// MARK: Write

	/// @inheritdoc ICredentialRegistry
	function registerCredential(
		bytes32 ccid,
		bytes32 credentialType,
		uint40 expiresAt,
		bytes calldata data
	) external onlyRole(ISSUER_ROLE) {
		require(
			identityRegistry.getWallets(ccid).length > 0,
			"CCID not registered"
		);
		require(credentialType != bytes32(0), "Invalid credential type");
		require(expiresAt > uint40(block.timestamp), "Expiry must be in the future");

		Credential storage cred = _credentials[ccid][credentialType];
		cred.credentialType = credentialType;
		cred.issuedAt = uint40(block.timestamp);
		cred.expiresAt = expiresAt;
		cred.data = data;

		if (!_hasCredential[ccid][credentialType]) {
			_hasCredential[ccid][credentialType] = true;
			_credentialIndex[ccid][credentialType] = _credentialTypes[ccid].length;
			_credentialTypes[ccid].push(credentialType);
		}

		emit CredentialRegistered(ccid, credentialType, expiresAt);
	}

	/// @inheritdoc ICredentialRegistry
	function renewCredential(
		bytes32 ccid,
		bytes32 credentialType,
		uint40 newExpiresAt
	) external onlyRole(ISSUER_ROLE) {
		require(_hasCredential[ccid][credentialType], "Credential does not exist");
		require(
			newExpiresAt > uint40(block.timestamp),
			"Expiry must be in the future"
		);

		_credentials[ccid][credentialType].expiresAt = newExpiresAt;

		emit CredentialRenewed(ccid, credentialType, newExpiresAt);
	}

	/// @inheritdoc ICredentialRegistry
	function revokeCredential(
		bytes32 ccid,
		bytes32 credentialType
	) external onlyRole(ISSUER_ROLE) {
		require(_hasCredential[ccid][credentialType], "Credential does not exist");

		delete _credentials[ccid][credentialType];
		_hasCredential[ccid][credentialType] = false;

		// Swap-and-pop from _credentialTypes
		uint256 idx = _credentialIndex[ccid][credentialType];
		uint256 lastIdx = _credentialTypes[ccid].length - 1;
		if (idx != lastIdx) {
			bytes32 lastType = _credentialTypes[ccid][lastIdx];
			_credentialTypes[ccid][idx] = lastType;
			_credentialIndex[ccid][lastType] = idx;
		}
		_credentialTypes[ccid].pop();
		delete _credentialIndex[ccid][credentialType];

		emit CredentialRevoked(ccid, credentialType);
	}

	// MARK: Read

	/// @inheritdoc ICredentialRegistry
	function hasValidCredential(
		bytes32 ccid,
		bytes32 credentialType
	) external view returns (bool) {
		return
			_hasCredential[ccid][credentialType] &&
			uint40(block.timestamp) <= _credentials[ccid][credentialType].expiresAt;
	}

	/// @inheritdoc ICredentialRegistry
	function isCredentialExpired(
		bytes32 ccid,
		bytes32 credentialType
	) external view returns (bool) {
		if (!_hasCredential[ccid][credentialType]) return true;
		return uint40(block.timestamp) > _credentials[ccid][credentialType].expiresAt;
	}

	/// @inheritdoc ICredentialRegistry
	function getCredential(
		bytes32 ccid,
		bytes32 credentialType
	) external view returns (Credential memory) {
		require(_hasCredential[ccid][credentialType], "Credential does not exist");
		return _credentials[ccid][credentialType];
	}

	/// @notice Get all active credential type IDs for a CCID.
	function getCredentialTypes(
		bytes32 ccid
	) external view returns (bytes32[] memory) {
		return _credentialTypes[ccid];
	}
}
