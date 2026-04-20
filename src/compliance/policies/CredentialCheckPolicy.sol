// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IIdentityRegistry.sol";
import "../interfaces/ICredentialRegistry.sol";

/// @title CredentialCheckPolicy
/// @notice Validates that both parties hold all required credentials (e.g. KYC, AML).
/// Called directly by PropertyToken during transfers — no PolicyEngine indirection.
contract CredentialCheckPolicy {
	IIdentityRegistry public immutable identityRegistry;
	ICredentialRegistry public immutable credentialRegistry;
	bytes32[] public requiredCredentials;

	constructor(
		address identityRegistry_,
		address credentialRegistry_,
		bytes32[] memory requiredCredentials_
	) {
		require(identityRegistry_ != address(0), "Invalid identity registry");
		require(
			credentialRegistry_ != address(0),
			"Invalid credential registry"
		);
		require(requiredCredentials_.length > 0, "No credentials required");

		identityRegistry = IIdentityRegistry(identityRegistry_);
		credentialRegistry = ICredentialRegistry(credentialRegistry_);
		requiredCredentials = requiredCredentials_;
	}

	/// @notice Check if a transfer is compliant.
	/// @return pass True if the transfer is allowed.
	/// @return bypass Always false (no bypass logic in credential checks).
	function check(
		address,
		bytes4,
		address from,
		address to,
		uint256
	) external view returns (bool pass, bool bypass) {
		// Burns: always allowed
		if (to == address(0)) return (true, false);

		// Validate recipient
		if (!_isCompliant(to)) return (false, false);

		// Validate sender (skip for mints)
		if (from != address(0) && !_isCompliant(from)) return (false, false);

		return (true, false);
	}

	function _isCompliant(address addr) internal view returns (bool) {
		bytes32 ccid = identityRegistry.getIdentity(addr);
		if (ccid == bytes32(0)) return false;

		for (uint256 i = 0; i < requiredCredentials.length; i++) {
			if (
				!credentialRegistry.hasValidCredential(
					ccid,
					requiredCredentials[i]
				)
			) {
				return false;
			}
		}
		return true;
	}

	/// @notice Get the list of required credential types.
	function getRequiredCredentials()
		external
		view
		returns (bytes32[] memory)
	{
		return requiredCredentials;
	}
}
