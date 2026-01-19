// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PropertyToken.sol";
import "../finance/ListingEscrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyFactory is Ownable {

    event PropertyDeployed(address indexed property, string name, string symbol);
    event EscrowDeployed(address indexed escrow, address indexed property, address paymentToken);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function deployProperty(
        string memory name,
        string memory symbol,
        uint256 supply,
        address compliance
    ) external onlyOwner returns (address) {
        PropertyToken token = new PropertyToken(name, symbol, supply, compliance, msg.sender);
        emit PropertyDeployed(address(token), name, symbol);
        return address(token);
    }

    function deployEscrow(
        address propertyToken,
        address paymentToken,
        address sponsor,
        uint256 targetRaise,
        uint256 deadline
    ) external onlyOwner returns (address) {
        ListingEscrow escrow = new ListingEscrow(
            propertyToken,
            paymentToken,
            sponsor,
            targetRaise,
            deadline,
            msg.sender // Admin
        );
        emit EscrowDeployed(address(escrow), propertyToken, paymentToken);
        return address(escrow);
    }
}
