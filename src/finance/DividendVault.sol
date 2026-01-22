// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../tokenization/PropertyToken.sol";

/**
 * @title DividendVault
 * @notice Distributes property income to token holders based on snapshots
 * @dev Uses snapshot mechanism to prevent front-running and ensures fair distribution
 */
contract DividendVault is Ownable, ReentrancyGuard, Pausable {
    IERC20 public paymentToken; // CREUSD
    address public protocolWallet;
    uint256 public protocolFeeBps; // Changed to mutable

    // Minimum amounts to prevent precision loss and spam
    uint256 public constant MIN_DISTRIBUTION = 1000; // Minimum distribution amount
    uint256 public constant MIN_PROTOCOL_FEE_BPS = 0;
    uint256 public constant MAX_PROTOCOL_FEE_BPS = 1000; // Max 10%

    // Timeout for unclaimed dividends (1 year)
    uint256 public constant CLAIM_TIMEOUT = 365 days;

    struct Distribution {
        uint256 snapshotId;
        uint256 totalAmount;
        uint256 totalSupplyAtSnapshot;
        uint256 timestamp; // Track when distribution was created
        uint256 totalClaimed; // Track how much has been claimed
        mapping(address => bool) claimed;
    }

    // property => distributionId => Distribution
    mapping(address => mapping(uint256 => Distribution)) public distributions;
    mapping(address => uint256) public distributionCounts;

    // Track valid property tokens
    mapping(address => bool) public isValidProperty;

    event DividendDeposited(address indexed property, uint256 indexed distributionId, uint256 amount, uint256 snapshotId);
    event DividendClaimed(address indexed property, uint256 indexed distributionId, address indexed user, uint256 amount);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event UnclaimedRecovered(address indexed property, uint256 indexed distributionId, uint256 amount);
    event PropertyValidated(address indexed property, bool valid);

    constructor(address _paymentToken, address _protocolWallet, address initialOwner) Ownable(initialOwner) {
        require(_paymentToken != address(0), "Invalid payment token");
        require(_protocolWallet != address(0), "Invalid protocol wallet");

        paymentToken = IERC20(_paymentToken);
        protocolWallet = _protocolWallet;
        protocolFeeBps = 100; // 1% default
    }

    /**
     * @notice Update protocol fee (owner only)
     * @param _feeBps New fee in basis points (100 = 1%)
     */
    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps >= MIN_PROTOCOL_FEE_BPS && _feeBps <= MAX_PROTOCOL_FEE_BPS, "Invalid fee");
        emit ProtocolFeeUpdated(protocolFeeBps, _feeBps);
        protocolFeeBps = _feeBps;
    }

    /**
     * @notice Update protocol wallet (owner only)
     * @param _wallet New protocol wallet address
     */
    function setProtocolWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Invalid wallet");
        protocolWallet = _wallet;
    }

    /**
     * @notice Validate or invalidate a property token (owner only)
     * @param property Property token address
     * @param valid Whether the property is valid
     */
    function setPropertyValid(address property, bool valid) external onlyOwner {
        isValidProperty[property] = valid;
        emit PropertyValidated(property, valid);
    }

    /**
     * @notice Deposit dividend for distribution to token holders
     * @param property Property token address
     * @param amount Amount to distribute (before fees)
     * @dev CRITICAL: Takes snapshot BEFORE transfer to prevent front-running
     */
    function depositDividend(address property, uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= MIN_DISTRIBUTION, "Amount too small");
        require(property != address(0), "Invalid property");

        PropertyToken token = PropertyToken(property);

        // Validate it's a legitimate property token
        require(token.totalSupply() > 0, "Invalid property token");

        // CRITICAL FIX: Take snapshot FIRST before any transfers
        // This prevents front-running where users buy tokens after seeing the deposit
        uint256 snapshotId = token.snapshot();
        uint256 supply = token.totalSupplyAt(snapshotId);
        require(supply > 0, "No tokens to distribute to");

        // Now transfer funds from sponsor to this contract
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // Calculate and take protocol fee
        uint256 fee = (amount * protocolFeeBps) / 10000;
        uint256 distributable = amount - fee;
        require(distributable > 0, "Amount too small after fees");

        // Transfer fee to protocol wallet
        if (fee > 0) {
            require(paymentToken.transfer(protocolWallet, fee), "Fee transfer failed");
        }

        // Record distribution
        uint256 id = distributionCounts[property];
        distributionCounts[property]++;

        Distribution storage d = distributions[property][id];
        d.snapshotId = snapshotId;
        d.totalAmount = distributable;
        d.totalSupplyAtSnapshot = supply;
        d.timestamp = block.timestamp;
        d.totalClaimed = 0;

        emit DividendDeposited(property, id, distributable, snapshotId);
    }

    /**
     * @notice Claim dividend for a specific distribution
     * @param property Property token address
     * @param distributionId Distribution ID to claim from
     */
    function claim(address property, uint256 distributionId) external nonReentrant whenNotPaused {
        Distribution storage d = distributions[property][distributionId];
        require(!d.claimed[msg.sender], "Already claimed");
        require(d.totalAmount > 0, "Invalid distribution");

        PropertyToken token = PropertyToken(property);
        uint256 balance = token.balanceOfAt(msg.sender, d.snapshotId);

        require(balance > 0, "No balance at snapshot");

        // Calculate share with proper precision
        uint256 share = (d.totalAmount * balance) / d.totalSupplyAtSnapshot;
        require(share > 0, "Share too small");

        d.claimed[msg.sender] = true;
        d.totalClaimed += share;

        require(paymentToken.transfer(msg.sender, share), "Transfer failed");

        emit DividendClaimed(property, distributionId, msg.sender, share);
    }

    /**
     * @notice Batch claim multiple distributions for a property
     * @param property Property token address
     * @param distributionIds Array of distribution IDs to claim
     */
    function batchClaim(address property, uint256[] calldata distributionIds) external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < distributionIds.length; i++) {
            uint256 distributionId = distributionIds[i];
            Distribution storage d = distributions[property][distributionId];

            if (d.claimed[msg.sender] || d.totalAmount == 0) {
                continue; // Skip if already claimed or invalid
            }

            PropertyToken token = PropertyToken(property);
            uint256 balance = token.balanceOfAt(msg.sender, d.snapshotId);

            if (balance == 0) {
                continue; // Skip if no balance
            }

            uint256 share = (d.totalAmount * balance) / d.totalSupplyAtSnapshot;

            if (share == 0) {
                continue; // Skip if share too small
            }

            d.claimed[msg.sender] = true;
            d.totalClaimed += share;

            require(paymentToken.transfer(msg.sender, share), "Transfer failed");
            emit DividendClaimed(property, distributionId, msg.sender, share);
        }
    }

    /**
     * @notice Recover unclaimed dividends after timeout (owner only)
     * @param property Property token address
     * @param distributionId Distribution ID
     */
    function recoverUnclaimed(address property, uint256 distributionId) external onlyOwner nonReentrant {
        Distribution storage d = distributions[property][distributionId];
        require(d.totalAmount > 0, "Invalid distribution");
        require(block.timestamp >= d.timestamp + CLAIM_TIMEOUT, "Timeout not reached");

        uint256 unclaimed = d.totalAmount - d.totalClaimed;
        require(unclaimed > 0, "Nothing to recover");

        // Mark as fully claimed to prevent further claims
        d.totalClaimed = d.totalAmount;

        require(paymentToken.transfer(owner(), unclaimed), "Transfer failed");
        emit UnclaimedRecovered(property, distributionId, unclaimed);
    }

    /**
     * @notice Get distribution details
     * @param property Property token address
     * @param distributionId Distribution ID
     */
    function getDistribution(address property, uint256 distributionId)
        external
        view
        returns (
            uint256 snapshotId,
            uint256 totalAmount,
            uint256 totalSupplyAtSnapshot,
            uint256 timestamp,
            uint256 totalClaimed
        )
    {
        Distribution storage d = distributions[property][distributionId];
        return (
            d.snapshotId,
            d.totalAmount,
            d.totalSupplyAtSnapshot,
            d.timestamp,
            d.totalClaimed
        );
    }

    /**
     * @notice Check if user has claimed a distribution
     * @param property Property token address
     * @param distributionId Distribution ID
     * @param user User address to check
     */
    function hasClaimed(address property, uint256 distributionId, address user) external view returns (bool) {
        return distributions[property][distributionId].claimed[user];
    }

    /**
     * @notice Calculate claimable amount for a user
     * @param property Property token address
     * @param distributionId Distribution ID
     * @param user User address
     */
    function getClaimableAmount(address property, uint256 distributionId, address user) external view returns (uint256) {
        Distribution storage d = distributions[property][distributionId];

        if (d.claimed[user] || d.totalAmount == 0) {
            return 0;
        }

        PropertyToken token = PropertyToken(property);
        uint256 balance = token.balanceOfAt(user, d.snapshotId);

        if (balance == 0) {
            return 0;
        }

        return (d.totalAmount * balance) / d.totalSupplyAtSnapshot;
    }

    /**
     * @notice Pause contract (owner only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract (owner only)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
