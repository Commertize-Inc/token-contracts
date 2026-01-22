// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IdentityRegistry.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenCompliance
 * @dev Logic to restrict token transfers to verified users only.
 */
contract TokenCompliance is Ownable {

    IdentityRegistry public identityRegistry;

    mapping(address => bool) public isExempt;

    event ExemptionUpdated(address indexed target, bool status);

    constructor(address _identityRegistry, address initialOwner) Ownable(initialOwner) {
        require(_identityRegistry != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    function updateIdentityRegistry(address _newRegistry) external onlyOwner {
        require(_newRegistry != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistry(_newRegistry);
    }

    function setExempt(address target, bool status) external onlyOwner {
        isExempt[target] = status;
        emit ExemptionUpdated(target, status);
    }

    /**
     * @dev Checks if a transfer is allowed.
     * @param from Sender address
     * @param to Receiver address
     */
    function canTransfer(address from, address to) external view returns (bool) {
        // Minting (from 0x0)
        if (from == address(0)) {
            return identityRegistry.isVerified(to) || isExempt[to];
        }

        // Burning (to 0x0) - always allowed
        if (to == address(0)) {
            return true;
        }

        // Standard Transfer - both must be Verified OR Exempt
        bool fromOk = identityRegistry.isVerified(from) || isExempt[from];
        bool toOk = identityRegistry.isVerified(to) || isExempt[to];

        return fromOk && toOk;
    }
}
