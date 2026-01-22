// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../tokenization/PropertyToken.sol";
import "../compliance/TokenCompliance.sol";
import "../compliance/IdentityRegistry.sol";

/**
 * @title ListingEscrow
 * @notice Holds Property Tokens and Investor Funds until a funding goal is met.
 * @dev Implements proper investor tracking to prevent unbounded array growth and DoS
 */
contract ListingEscrow is Ownable, ReentrancyGuard, Pausable {
	using SafeERC20 for IERC20;

	// Minimum deposit to prevent dust spam
	uint256 public constant MIN_DEPOSIT = 1000;

	// Configuration
	IERC20 public propertyToken;
	IERC20 public paymentToken; // If address(0), uses Native Token
	address public sponsor;
	uint256 public targetRaise;
	uint256 public deadline;
	address public admin; // Admin address (separate from owner)

	// Improved investor tracking to prevent unbounded array issues
	mapping(address => uint256) public deposits; // How much each user deposited
	mapping(address => bool) private isInvestor; // Quick lookup for investor status
	address[] public investors; // List of all investors (bounded by adding deduplication)
	uint256 public totalRaised;

	// State
	bool public finalized;
	bool public refunded;

	// Events
	event Deposited(address indexed investor, uint256 amount);
	event Finalized(uint256 totalRaised, uint256 timestamp);
	event Refunded(address indexed investor, uint256 amount);
	event AdminFinalized(
		uint256 totalRaised,
		uint256 timestamp,
		address indexed admin
	);
	event AdminTokensDistributed(
		address indexed investor,
		uint256 amount,
		address indexed admin
	);
	event TokensBurned(uint256 amount);
	event AdminUpdated(address indexed oldAdmin, address indexed newAdmin);

	constructor(
		address _propertyToken,
		address _paymentToken,
		address _sponsor,
		uint256 _targetRaise,
		uint256 _deadline,
		address _admin
	) Ownable(_admin) {
		require(_propertyToken != address(0), "Invalid property token");
		require(_sponsor != address(0), "Invalid sponsor");
		require(_targetRaise > 0, "Invalid target raise");
		require(_deadline > block.timestamp, "Invalid deadline");
		require(_admin != address(0), "Invalid admin");
		// Note: _paymentToken can be address(0) for native token

		propertyToken = IERC20(_propertyToken);
		paymentToken = IERC20(_paymentToken);
		sponsor = _sponsor;
		targetRaise = _targetRaise;
		deadline = _deadline;
		admin = _admin; // Set admin (can be same as owner or different)
	}

	/**
	 * @dev Modifier to check if caller is admin or owner
	 */
	modifier onlyAdminOrOwner() {
		require(msg.sender == admin || msg.sender == owner(), "Not admin or owner");
		_;
	}

	/**
	 * @dev Internal function to track investors efficiently
	 * @param investor Address to add to investor list
	 */
	function _addInvestor(address investor) private {
		if (!isInvestor[investor]) {
			isInvestor[investor] = true;
			investors.push(investor);
		}
	}

	/**
	 * @dev Verify investor is allowed to hold tokens.
	 */
	function _checkCompliance(address investor) internal view {
		TokenCompliance compliance = PropertyToken(payable(address(propertyToken))).compliance();
		IdentityRegistry registry = compliance.identityRegistry();
		require(registry.isVerified(investor), "Investor not verified");
	}

	/**
	 * @notice Invest in the listing.
	 * @param amount Amount of payment tokens (ignored if Native).
	 */
	function deposit(uint256 amount) public payable nonReentrant whenNotPaused {
		require(!finalized && !refunded, "Escrow closed");
		require(block.timestamp < deadline, "Deadline passed");

		// Compliance Check
		_checkCompliance(msg.sender);

		uint256 depositAmount;

		if (address(paymentToken) == address(0)) {
			// Native HBAR
			require(msg.value >= MIN_DEPOSIT, "Below minimum deposit");
			depositAmount = msg.value;
		} else {
			// ERC20
			require(amount >= MIN_DEPOSIT, "Below minimum deposit");
			depositAmount = amount;
			paymentToken.safeTransferFrom(msg.sender, address(this), amount);
		}

		// Track investor efficiently (CRITICAL FIX: prevents unbounded growth)
		_addInvestor(msg.sender);

		deposits[msg.sender] += depositAmount;
		totalRaised += depositAmount;

		emit Deposited(msg.sender, depositAmount);
	}

	/**
	 * @notice Allow admin/backend to deposit on behalf of a user (using transferFrom).
	 * @param investor Address of the investor.
	 * @param amount Amount to pull from the investor.
	 */
	function depositFor(
		address investor,
		uint256 amount
	) external nonReentrant whenNotPaused {
		require(!finalized && !refunded, "Escrow closed");
		require(block.timestamp < deadline, "Deadline passed");
		require(amount >= MIN_DEPOSIT, "Below minimum deposit");
		require(
			address(paymentToken) != address(0),
			"Cannot call depositFor with Native Asset"
		);
		require(investor != address(0), "Invalid investor");

		// Compliance Check
		_checkCompliance(investor);

		// Pull funds from Investor (Investor must have approved Escrow)
		paymentToken.safeTransferFrom(investor, address(this), amount);

		// CRITICAL FIX: Track investor properly (was missing in original)
		_addInvestor(investor);

		deposits[investor] += amount;
		totalRaised += amount;

		emit Deposited(investor, amount);
	}

	/**
	 * @notice Finalize the raise if target is met.
	 * Moves funds to Sponsor and enables Token Claims (or air-drops them).
	 */
	function finalize() external nonReentrant whenNotPaused {
		require(!finalized && !refunded, "Already closed");
		require(totalRaised >= targetRaise, "Target not met");
		require(block.timestamp >= deadline, "Deadline not passed");

		finalized = true;

		// Send Funds to PropertyToken (Vault)
		// Funds are now held by the Property entity, and Sponsor/Admin can withdraw.
		if (address(paymentToken) == address(0)) {
			(bool success, ) = address(propertyToken).call{ value: totalRaised }("");
			require(success, "Transfer failed");
		} else {
			paymentToken.safeTransfer(address(propertyToken), totalRaised);
		}

		// Distribute tokens to investors automatically
		uint256 totalTokenSupply = propertyToken.balanceOf(address(this));

		for (uint256 i = 0; i < investors.length; i++) {
			address investor = investors[i];
			uint256 investorDeposit = deposits[investor];

			if (investorDeposit > 0) {
				// Calculate proportional token amount
				// tokenShare = (investorDeposit / totalRaised) * totalTokenSupply
				uint256 tokenShare = (investorDeposit * totalTokenSupply) / totalRaised;

				if (tokenShare > 0) {
					propertyToken.safeTransfer(investor, tokenShare);
					emit AdminTokensDistributed(investor, tokenShare, address(this));
				}
			}
		}

		emit Finalized(totalRaised, block.timestamp);
	}

	/**
	 * @notice Admin can finalize the raise (even before target) and send funds to sponsor.
	 * @dev Burns remaining unsold tokens if target not reached.
	 */
	function adminFinalize() external onlyAdminOrOwner nonReentrant {
		require(!finalized, "Already finalized");
		require(!refunded, "Refund mode active");

		finalized = true;

		uint256 totalTokenSupply = propertyToken.balanceOf(address(this));

		// Calculate tokens to burn if target not reached
		if (totalRaised < targetRaise && totalTokenSupply > 0) {
			uint256 soldTokens = (totalRaised * totalTokenSupply) / targetRaise;
			uint256 unsoldTokens = totalTokenSupply - soldTokens;

			if (unsoldTokens > 0) {
				// CRITICAL FIX: Proper burn to address(0) instead of 0xdead
				propertyToken.safeTransfer(address(0), unsoldTokens);
				emit TokensBurned(unsoldTokens);
			}
		}

		// Transfer payment to PropertyToken (Vault)
		if (address(paymentToken) == address(0)) {
			(bool success, ) = address(propertyToken).call{ value: totalRaised }("");
			require(success, "Transfer failed");
		} else {
			paymentToken.safeTransfer(address(propertyToken), totalRaised);
		}

		emit AdminFinalized(totalRaised, block.timestamp, msg.sender);
	}

	/**
	 * @notice Admin-only function to distribute property tokens to investors.
	 * @param investorList Array of investor addresses to receive tokens.
	 * @param amounts Array of token amounts corresponding to each investor.
	 * @dev This allows admin to manually distribute tokens based on investment records.
	 */
	function adminDistributeTokens(
		address[] calldata investorList,
		uint256[] calldata amounts
	) external onlyAdminOrOwner nonReentrant {
		require(investorList.length == amounts.length, "Array length mismatch");
		require(finalized, "Must finalize first");

		for (uint256 i = 0; i < investorList.length; i++) {
			require(investorList[i] != address(0), "Invalid investor address");
			require(amounts[i] > 0, "Invalid amount");

			propertyToken.safeTransfer(investorList[i], amounts[i]);
			emit AdminTokensDistributed(investorList[i], amounts[i], msg.sender);
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
			(bool success, ) = msg.sender.call{ value: userDeposit }("");
			require(success, "Transfer failed");
		} else {
			paymentToken.safeTransfer(msg.sender, userDeposit);
		}

		emit Refunded(msg.sender, userDeposit);
	}

	/**
	 * @notice Admin-only function to batch refund investors.
	 * @param investorList Array of investor addresses to refund.
	 * @dev This allows admin to process refunds on behalf of investors.
	 *      Can only be called if not finalized and after deadline or refunded flag is set.
	 */
	function adminBatchRefund(
		address[] calldata investorList
	) external onlyAdminOrOwner nonReentrant {
		require(!finalized, "Raise successful");
		require(block.timestamp >= deadline || refunded, "Deadline not passed");

		// Mark as refunded state
		refunded = true;

		for (uint256 i = 0; i < investorList.length; i++) {
			address investor = investorList[i];
			uint256 userDeposit = deposits[investor];

			if (userDeposit == 0) {
				continue; // Skip if no deposit
			}

			deposits[investor] = 0; // Clear deposit to prevent re-entrancy

			if (address(paymentToken) == address(0)) {
				(bool success, ) = investor.call{ value: userDeposit }("");
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
	function recoverTokens() external onlyAdminOrOwner {
		require(
			refunded || (block.timestamp >= deadline && totalRaised < targetRaise),
			"Cannot recover yet"
		);
		uint256 bal = propertyToken.balanceOf(address(this));
		propertyToken.safeTransfer(owner(), bal);
	}

	/**
	 * @notice Update admin address (owner only)
	 * @param _newAdmin New admin address
	 */
	function setAdmin(address _newAdmin) external onlyOwner {
		require(_newAdmin != address(0), "Invalid admin address");
		address oldAdmin = admin;
		admin = _newAdmin;
		emit AdminUpdated(oldAdmin, _newAdmin);
	}

	/**
	 * @notice Get total number of investors
	 */
	function getInvestorCount() external view returns (uint256) {
		return investors.length;
	}

	/**
	 * @notice Get investor address by index
	 * @param index Index in the investors array
	 */
	function getInvestor(uint256 index) external view returns (address) {
		require(index < investors.length, "Index out of bounds");
		return investors[index];
	}

	/**
	 * @notice Get all investors (use with caution for large arrays)
	 */
	function getAllInvestors() external view returns (address[] memory) {
		return investors;
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

	// CRITICAL FIX: Removed receive() function to make deposits explicit
	// Users must explicitly call deposit() with proper validation
}
