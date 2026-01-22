// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CREUSD
 * @dev Commertize USD (CREUSD) Stablecoin
 * Platform stablecoin with Permit support for gasless transactions
 */
contract CREUSD is ERC20, ERC20Permit, Ownable {

    uint8 private constant DECIMALS = 6;
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**DECIMALS; // 1 billion CREUSD

    // Faucet configuration for testing
    uint256 public faucetAmount = 10000 * 10**DECIMALS;
    uint256 public faucetCooldown = 24 hours;
    mapping(address => uint256) public lastFaucetClaim;

    event FaucetClaimed(address indexed user, uint256 amount);

    constructor(address _owner) ERC20("Commertize USD", "CREUSD") ERC20Permit("Commertize USD") Ownable(_owner) {
        _mint(_owner, 100000000 * 10**DECIMALS); // 100M CREUSD to start
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds maximum supply");
        _mint(to, amount);
    }

    function faucet() external {
        require(lastFaucetClaim[msg.sender] + faucetCooldown < block.timestamp, "Faucet cooldown active");
        require(totalSupply() + faucetAmount <= MAX_SUPPLY, "Exceeds maximum supply");

        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, faucetAmount);

        emit FaucetClaimed(msg.sender, faucetAmount);
    }

    /**
     * @notice Update faucet amount (owner only)
     * @param _amount New faucet amount
     */
    function setFaucetAmount(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Invalid amount");
        faucetAmount = _amount;
    }

    /**
     * @notice Update faucet cooldown period (owner only)
     * @param _cooldown New cooldown period in seconds
     */
    function setFaucetCooldown(uint256 _cooldown) external onlyOwner {
        require(_cooldown > 0, "Invalid cooldown");
        faucetCooldown = _cooldown;
    }

    /**
     * @notice Disable faucet by setting amount to zero (owner only)
     */
    function disableFaucet() external onlyOwner {
        faucetAmount = 0;
    }
}
