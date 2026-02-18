// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title IdentityRegistry
 * @dev Role-based whitelist of verified investor addresses using AccessControl.
 * @dev Uses VERIFIED_ROLE to track verified investors and DEFAULT_ADMIN_ROLE for management.
 */
contract IdentityRegistry is AccessControl {

    // ISO 3166-1 numeric country codes range from 1 to 999
    uint16 public constant MAX_COUNTRY_CODE = 999;

    // Role for verified investors
    bytes32 public constant VERIFIED_ROLE = keccak256("VERIFIED_ROLE");

    struct Identity {
        uint16 country;
        bytes32 identityHash;
    }

    mapping(address => Identity) public identities;

    event IdentityVerified(address indexed user, uint16 country, bytes32 identityHash);
    event IdentityRemoved(address indexed user);

    constructor(address initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
    }

    function registerIdentity(address user, uint16 country, bytes32 _identityHash) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(user != address(0), "Invalid user address");
        require(country > 0 && country <= MAX_COUNTRY_CODE, "Invalid country code");

        identities[user] = Identity({
            country: country,
            identityHash: _identityHash
        });
        _grantRole(VERIFIED_ROLE, user);
        emit IdentityVerified(user, country, _identityHash);
    }

    function removeIdentity(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(user != address(0), "Invalid user address");
        _revokeRole(VERIFIED_ROLE, user);
        delete identities[user];
        emit IdentityRemoved(user);
    }

    function isVerified(address user) external view returns (bool) {
        return hasRole(VERIFIED_ROLE, user);
    }
}
