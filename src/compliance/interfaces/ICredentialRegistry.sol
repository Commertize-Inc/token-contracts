// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ICredentialRegistry
/// @notice Typed credential storage with on-chain expiry, keyed by CCID.
interface ICredentialRegistry {
	struct Credential {
		bytes32 credentialType;
		uint40 issuedAt;
		uint40 expiresAt;
		bytes data;
	}

	event CredentialRegistered(
		bytes32 indexed ccid,
		bytes32 indexed credentialType,
		uint40 expiresAt
	);
	event CredentialRenewed(
		bytes32 indexed ccid,
		bytes32 indexed credentialType,
		uint40 newExpiresAt
	);
	event CredentialRevoked(
		bytes32 indexed ccid,
		bytes32 indexed credentialType
	);

	/// @notice Attach a credential to an identity. Overwrites if type already exists.
	function registerCredential(
		bytes32 ccid,
		bytes32 credentialType,
		uint40 expiresAt,
		bytes calldata data
	) external;

	/// @notice Extend the expiry of an existing credential.
	function renewCredential(
		bytes32 ccid,
		bytes32 credentialType,
		uint40 newExpiresAt
	) external;

	/// @notice Revoke and delete a credential.
	function revokeCredential(bytes32 ccid, bytes32 credentialType) external;

	/// @notice Check if a credential exists and has not expired.
	function hasValidCredential(
		bytes32 ccid,
		bytes32 credentialType
	) external view returns (bool);

	/// @notice Check if a credential has expired (returns true if expired or missing).
	function isCredentialExpired(
		bytes32 ccid,
		bytes32 credentialType
	) external view returns (bool);

	/// @notice Get full credential data.
	function getCredential(
		bytes32 ccid,
		bytes32 credentialType
	) external view returns (Credential memory);
}
