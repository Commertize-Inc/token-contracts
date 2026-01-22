// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ListingEscrow
 * @notice Holds Property Tokens and Investor Funds until a funding goal is met.
 */
contract ListingEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Configuration
    IERC20 public propertyToken;
    IERC20 public paymentToken; // If address(0), uses Native HBAR/ETH
    address public sponsor;
    uint256 public targetRaise;
    uint256 public deadline;

    // State
    uint256 public totalRaised;
    mapping(address => uint256) public deposits;
    bool public finalized;
    bool public refunded;

    event Deposited(address indexed investor, uint256 amount);
    event Finalized(uint256 totalRaised, uint256 timestamp);
    event Refunded(address indexed investor, uint256 amount);
    event AdminFinalized(uint256 totalRaised, uint256 timestamp, address indexed admin);
    event AdminTokensDistributed(address indexed investor, uint256 amount, address indexed admin);

    constructor(
        address _propertyToken,
        address _paymentToken,
        address _sponsor,
        uint256 _targetRaise,
        uint256 _deadline,
        address _admin
    ) Ownable(_admin) {
        propertyToken = IERC20(_propertyToken);
        paymentToken = IERC20(_paymentToken);
        sponsor = _sponsor;
        targetRaise = _targetRaise;
        deadline = _deadline;
    }

    /**
     * @notice Invest in the listing.
     * @param amount Amount of payment tokens (ignored if Native).
     */
    function deposit(uint256 amount) public payable nonReentrant {
        require(!finalized && !refunded, "Escrow closed");
        require(block.timestamp < deadline, "Deadline passed");

        uint256 depositAmount = amount;

        if (address(paymentToken) == address(0)) {
            // Native HBAR
            depositAmount = msg.value;
            require(depositAmount > 0, "Zero value");
        } else {
            // ERC20
            require(amount > 0, "Zero amount");
            paymentToken.safeTransferFrom(msg.sender, address(this), amount);
        }

        deposits[msg.sender] += depositAmount;
        totalRaised += depositAmount;

        emit Deposited(msg.sender, depositAmount);
    }

    /**
     * @notice Allow admin/backend to deposit on behalf of a user (using transferFrom).
     * @param investor Address of the investor.
     * @param amount Amount to pull from the investor.
     */
    function depositFor(address investor, uint256 amount) external nonReentrant {
        require(!finalized && !refunded, "Escrow closed");
        require(block.timestamp < deadline, "Deadline passed");
        require(amount > 0, "Zero amount");
        require(address(paymentToken) != address(0), "Cannot call depositFor with Native Asset");

        // Pull funds from Investor (Investor must have approved Escrow)
        paymentToken.safeTransferFrom(investor, address(this), amount);

        deposits[investor] += amount;
        totalRaised += amount;

        emit Deposited(investor, amount);
    }

    /**
     * @notice Finalize the raise if target is met.
     * Moves funds to Sponsor and enables Token Claims (or air-drops them).
     * For MVP, we will simpler: Sponsor gets funds, Admin distributes tokens.
     * TRUSTLESS VERSION: Sponsor gets funds, Investors claim tokens.
     */
    function finalize() external nonReentrant {
        require(!finalized && !refunded, "Already closed");
        require(totalRaised >= targetRaise, "Target not met");

        finalized = true;

        // 1. Send Funds to Sponsor
        if (address(paymentToken) == address(0)) {
            (bool success, ) = sponsor.call{value: totalRaised}("");
             require(success, "Transfer failed");
        } else {
            paymentToken.safeTransfer(sponsor, totalRaised);
        }

        emit Finalized(totalRaised, block.timestamp);
    }

    /**
     * @notice Admin-only finalize that allows releasing funds to sponsor even if not fully funded.
     * @dev This provides flexibility for admin to manually handle partial funding scenarios.
     */
    function adminFinalize() external onlyOwner nonReentrant {
        require(!finalized && !refunded, "Already closed");

        finalized = true;

        // Send whatever was raised to the Sponsor
        if (address(paymentToken) == address(0)) {
            (bool success, ) = sponsor.call{value: totalRaised}("");
            require(success, "Transfer failed");
        } else {
            paymentToken.safeTransfer(sponsor, totalRaised);
        }

        emit AdminFinalized(totalRaised, block.timestamp, msg.sender);
    }

    /**
     * @notice Admin-only function to distribute property tokens to investors.
     * @param investors Array of investor addresses to receive tokens.
     * @param amounts Array of token amounts corresponding to each investor.
     * @dev This allows admin to manually distribute tokens based on investment records.
     */
    function adminDistributeTokens(
        address[] calldata investors,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(investors.length == amounts.length, "Array length mismatch");
        require(finalized, "Must finalize first");

        for (uint256 i = 0; i < investors.length; i++) {
            require(investors[i] != address(0), "Invalid investor address");
            require(amounts[i] > 0, "Invalid amount");

            propertyToken.safeTransfer(investors[i], amounts[i]);
            emit AdminTokensDistributed(investors[i], amounts[i], msg.sender);
        }
    }

    /**
     * @notice Claim refund if raise failed/expired.
     */
    function refund() external nonReentrant {
        require(!finalized, "Raise successful");
        require(block.timestamp >= deadline || refunded, "Deadline not passed");

        // Mark as refunded state if not already (first refund call triggers it effectively)
        refunded = true;

        uint256 userDeposit = deposits[msg.sender];
        require(userDeposit > 0, "No deposit");

        deposits[msg.sender] = 0; // Prevent re-entrancy

        if (address(paymentToken) == address(0)) {
            (bool success, ) = msg.sender.call{value: userDeposit}("");
            require(success, "Transfer failed");
        } else {
            paymentToken.safeTransfer(msg.sender, userDeposit);
        }

        emit Refunded(msg.sender, userDeposit);
    }

    /**
     * @notice Admin-only function to batch refund investors.
     * @param investors Array of investor addresses to refund.
     * @dev This allows admin to process refunds on behalf of investors.
     *      Can only be called if not finalized and after deadline or refunded flag is set.
     */
    function adminBatchRefund(address[] calldata investors) external onlyOwner nonReentrant {
        require(!finalized, "Raise successful");
        require(block.timestamp >= deadline || refunded, "Deadline not passed");

        // Mark as refunded state
        refunded = true;

        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 userDeposit = deposits[investor];

            if (userDeposit == 0) {
                continue; // Skip if no deposit
            }

            deposits[investor] = 0; // Clear deposit to prevent re-entrancy

            if (address(paymentToken) == address(0)) {
                (bool success, ) = investor.call{value: userDeposit}("");
                require(success, "Transfer failed");
            } else {
                paymentToken.safeTransfer(investor, userDeposit);
            }

            emit Refunded(investor, userDeposit);
        }
    }

    /**
     * @notice Allow admin to withdraw unsold tokens if failed.
     */
    function recoverTokens() external onlyOwner {
        require(refunded || (block.timestamp >= deadline && totalRaised < targetRaise), "Cannot recover yet");
        uint256 bal = propertyToken.balanceOf(address(this));
        propertyToken.safeTransfer(owner(), bal);
    }

    // Allow receiving native HBAR
    receive() external payable {
        deposit(msg.value);
    }
}
