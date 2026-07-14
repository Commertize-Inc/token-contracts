// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./TokenCompliance.sol";
import "./IdentityRegistry.sol";

/**
 * @title ComplianceEnabled
 * @dev Abstract contract that provides compliance checking via _checkCompliance.
 * @dev Token contracts should inherit from this and call _checkCompliance in
 * their transfer hook (see PropertyToken._update) to enforce compliance.
 */
abstract contract ComplianceEnabled {
    TokenCompliance public compliance;

    /**
     * @dev Internal function to check compliance on a balance-moving update.
     * @param from Sender address
     * @param to Receiver address
     */
    function _checkCompliance(address from, address to) internal view virtual {
        IdentityRegistry registry = compliance.identityRegistry();

        // Minting (from 0x0)
        if (from == address(0)) {
            require(
                registry.isVerified(to) || compliance.isExempt(to),
                "Compliance: Transfer not allowed"
            );
        }
        // Burning (to 0x0) - always allowed
        else if (to == address(0)) {
            // No check needed for burning
        }
        // Standard Transfer - both must be Verified OR Exempt
        else {
            bool fromOk = registry.isVerified(from) || compliance.isExempt(from);
            bool toOk = registry.isVerified(to) || compliance.isExempt(to);
            require(fromOk && toOk, "Compliance: Transfer not allowed");
        }
    }

    /**
     * @dev Internal function to set the compliance contract.
     * @param _compliance Address of the TokenCompliance contract
     */
    function _setCompliance(address _compliance) internal {
        require(_compliance != address(0), "Invalid compliance address");
        compliance = TokenCompliance(_compliance);
    }
}
