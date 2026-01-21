// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../tokenization/PropertyToken.sol";

contract DividendVault is Ownable {
    IERC20 public paymentToken; // CREUSD
    address public protocolWallet;
    uint256 public protocolFeeBps = 100; // 1%

    struct Distribution {
        uint256 snapshotId;
        uint256 totalAmount;
        uint256 totalSupplyAtSnapshot;
        mapping(address => bool) claimed;
    }

    // property => distributionId => Distribution
    mapping(address => mapping(uint256 => Distribution)) public distributions;
    mapping(address => uint256) public distributionCounts;

    event DividendDeposited(address indexed property, uint256 indexed distributionId, uint256 amount, uint256 snapshotId);
    event DividendClaimed(address indexed property, uint256 indexed distributionId, address indexed user, uint256 amount);

    constructor(address _paymentToken, address _protocolWallet, address initialOwner) Ownable(initialOwner) {
        paymentToken = IERC20(_paymentToken);
        protocolWallet = _protocolWallet;
    }

    function depositDividend(address property, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        // 1. Transfer funds from sponsor (sender) to here
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // 2. Take Protocol Fee
        uint256 fee = (amount * protocolFeeBps) / 10000;
        uint256 distributable = amount - fee;
        if (fee > 0) {
            require(paymentToken.transfer(protocolWallet, fee), "Fee transfer failed");
        }

        // 3. Take Snapshot
        PropertyToken token = PropertyToken(property);
        uint256 snapshotId = token.snapshot();
        uint256 supply = token.totalSupplyAt(snapshotId);

        require(supply > 0, "No tokens to distribute to");

        // 4. Record
        uint256 id = distributionCounts[property]++;
        Distribution storage d = distributions[property][id];
        d.snapshotId = snapshotId;
        d.totalAmount = distributable;
        d.totalSupplyAtSnapshot = supply;

        emit DividendDeposited(property, id, distributable, snapshotId);
    }

    function claim(address property, uint256 distributionId) external {
        Distribution storage d = distributions[property][distributionId];
        require(!d.claimed[msg.sender], "Already claimed");
        require(d.totalAmount > 0, "Invalid distribution");

        PropertyToken token = PropertyToken(property);
        uint256 balance = token.balanceOfAt(msg.sender, d.snapshotId);

        require(balance > 0, "No balance at snapshot");

        uint256 share = (d.totalAmount * balance) / d.totalSupplyAtSnapshot;

        d.claimed[msg.sender] = true;
        require(paymentToken.transfer(msg.sender, share), "Transfer failed");

        emit DividendClaimed(property, distributionId, msg.sender, share);
    }
}
