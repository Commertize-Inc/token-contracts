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

    constructor(address _identityRegistry, address initialOwner) Ownable(initialOwner) {
        require(_identityRegistry != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistry(_identityRegistry);
    }

    function updateIdentityRegistry(address _newRegistry) external onlyOwner {
        require(_newRegistry != address(0), "Invalid registry address");
        identityRegistry = IdentityRegistry(_newRegistry);
    }

    /**
     * @dev Checks if a transfer is allowed.
     * @param from Sender address
     * @param to Receiver address
     */
    function canTransfer(address from, address to) external view returns (bool) {
        // Minting (from 0x0) - usually allowed if 'to' is verified,
        // but often minter role handles strictly. Checks 'to' address state.
        if (from == address(0)) {
            return identityRegistry.isVerified(to);
        }

        // Burning (to 0x0) - allowed
        if (to == address(0)) {
            return true;
        }

        // Standard Transfer - both must be verified
        return identityRegistry.isVerified(from) && identityRegistry.isVerified(to);
    }
}
