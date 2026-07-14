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
}
