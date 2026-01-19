// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IdentityRegistry
 * @dev Simple whitelist of verified investor addresses.
 */
contract IdentityRegistry is Ownable {

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
        identities[user] = Identity({
            country: country,
            isVerified: true,
            identityHash: _identityHash
        });
        emit IdentityVerified(user, country, _identityHash);
    }

    function removeIdentity(address user) external onlyOwner {
        delete identities[user];
        emit IdentityRemoved(user);
    }

    function isVerified(address user) external view returns (bool) {
        return identities[user].isVerified;
    }
}
