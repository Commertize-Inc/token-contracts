// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityRegistry
 * @dev Simple whitelist of verified investor addresses.
 */
contract IdentityRegistry is Ownable {

    // ISO 3166-1 numeric country codes range from 1 to 999
    uint16 public constant MAX_COUNTRY_CODE = 999;

    struct Identity {
        uint16 country;
        bool isVerified;
        bytes32 identityHash;
    }

    mapping(address => Identity) public identities;

    event IdentityVerified(address indexed user, uint16 country, bytes32 identityHash);
    event IdentityRemoved(address indexed user);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerIdentity(address user, uint16 country, bytes32 _identityHash) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(country > 0 && country <= MAX_COUNTRY_CODE, "Invalid country code");

        identities[user] = Identity({
            country: country,
            isVerified: true,
            identityHash: _identityHash
        });
        emit IdentityVerified(user, country, _identityHash);
    }

    function removeIdentity(address user) external onlyOwner {
        require(user != address(0), "Invalid user address");
        delete identities[user];
        emit IdentityRemoved(user);
    }

    function isVerified(address user) external view returns (bool) {
        return identities[user].isVerified;
    }
}
