// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PropertyToken.sol";
import "../finance/ListingEscrow.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyFactory is Ownable {

    // Deployment registry for tracking
    address[] public deployedProperties;
    address[] public deployedEscrows;
    mapping(address => bool) public isPropertyToken;
    mapping(address => bool) public isEscrow;

    event PropertyDeployed(address indexed property, string name, string symbol, uint256 indexed index);
    event EscrowDeployed(address indexed escrow, address indexed property, address paymentToken, uint256 indexed index);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function deployProperty(
        string memory name,
        string memory symbol,
        uint256 supply,
        address compliance
    ) external onlyOwner returns (address) {
        require(bytes(name).length > 0 && bytes(name).length <= 100, "Invalid name");
        require(bytes(symbol).length > 0 && bytes(symbol).length <= 20, "Invalid symbol");
        require(supply > 0, "Zero supply");
        require(compliance != address(0), "Invalid compliance");

        PropertyToken token = new PropertyToken(name, symbol, supply, compliance, msg.sender);
        address tokenAddress = address(token);

        deployedProperties.push(tokenAddress);
        isPropertyToken[tokenAddress] = true;

        emit PropertyDeployed(tokenAddress, name, symbol, deployedProperties.length - 1);
        return tokenAddress;
    }

    function deployEscrow(
        address propertyToken,
        address paymentToken,
        address sponsor,
        uint256 targetRaise,
        uint256 deadline
    ) external onlyOwner returns (address) {
        require(propertyToken != address(0), "Invalid property token");
        require(sponsor != address(0), "Invalid sponsor");
        require(targetRaise > 0, "Invalid target raise");
        require(deadline > block.timestamp, "Invalid deadline");
        // Note: paymentToken can be address(0) for native token

        ListingEscrow escrow = new ListingEscrow(
            propertyToken,
            paymentToken,
            sponsor,
            targetRaise,
            deadline,
            msg.sender // Admin
        );
        address escrowAddress = address(escrow);

        deployedEscrows.push(escrowAddress);
        isEscrow[escrowAddress] = true;

        emit EscrowDeployed(escrowAddress, propertyToken, paymentToken, deployedEscrows.length - 1);
        return escrowAddress;
    }

    /**
     * @notice Get all deployed property tokens
     */
    function getDeployedProperties() external view returns (address[] memory) {
        return deployedProperties;
    }

    /**
     * @notice Get all deployed escrows
     */
    function getDeployedEscrows() external view returns (address[] memory) {
        return deployedEscrows;
    }
}
