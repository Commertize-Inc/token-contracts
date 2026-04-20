// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "../compliance/interfaces/IComplianceToken.sol";
import "../compliance/policies/CredentialCheckPolicy.sol";

/// @title PropertyToken
/// @notice ERC20 security token with ERC-3643 compliance controls, snapshot-based
/// dividends, and vault functionality. Compliance checks are inline (exempt, freeze,
/// pause) with a single external call to CredentialCheckPolicy for credential validation.
contract PropertyToken is ERC20, ERC20Permit, Ownable, Pausable, IComplianceToken {

	// MARK: Snapshot

	struct Snap {
		uint256 id;
		uint256 value;
	}

	uint256 private _currentSnapshotId;
	Snap[] private _totalSupplySnaps;
	mapping(address => Snap[]) private _balanceSnaps;
	mapping(address => bool) private _snapshotter;

	event Snapshot(uint256 id);

	// MARK: Compliance

	CredentialCheckPolicy private _compliancePolicy;
	mapping(address => bool) private _exempt;

	event ExemptionSet(address indexed addr, bool exempt);

	// MARK: Freeze State

	mapping(address => bool) private _frozen;
	mapping(address => uint256) private _frozenTokens;

	// MARK: Constructor

	constructor(
		string memory name_,
		string memory symbol_,
		uint256 supply_,
		address compliancePolicy_,
		address owner_
	) ERC20(name_, symbol_) ERC20Permit(name_) Ownable(owner_) {
		if (compliancePolicy_ != address(0)) {
			_compliancePolicy = CredentialCheckPolicy(compliancePolicy_);
		}
		_mint(owner_, supply_);
	}

	// MARK: Compliance Policy

	function compliancePolicy() external view returns (address) {
		return address(_compliancePolicy);
	}

	/// @inheritdoc IComplianceToken
	function policyEngine() external view returns (address) {
		return address(_compliancePolicy);
	}

	function setCompliancePolicy(address policy) external onlyOwner {
		_compliancePolicy = CredentialCheckPolicy(policy);
	}

	// MARK: Exemptions

	function setExempt(address addr, bool exempt) external onlyOwner {
		_exempt[addr] = exempt;
		emit ExemptionSet(addr, exempt);
	}

	function isExempt(address addr) external view returns (bool) {
		return _exempt[addr];
	}

	// MARK: Snapshot

	function snapshot() external returns (uint256) {
		require(
			msg.sender == owner() || _snapshotter[msg.sender],
			"Not authorized"
		);
		_currentSnapshotId += 1;
		uint256 currentId = _currentSnapshotId;
		emit Snapshot(currentId);
		return currentId;
	}

	function getCurrentSnapshotId() external view returns (uint256) {
		return _currentSnapshotId;
	}

	function setSnapshotter(address addr, bool allowed) external onlyOwner {
		_snapshotter[addr] = allowed;
	}

	function balanceOfAt(
		address account,
		uint256 snapshotId
	) public view returns (uint256) {
		return _valueAt(_balanceSnaps[account], snapshotId, balanceOf(account));
	}

	function totalSupplyAt(uint256 snapshotId) public view returns (uint256) {
		return _valueAt(_totalSupplySnaps, snapshotId, totalSupply());
	}

	function _updateSnap(
		Snap[] storage snaps,
		uint256 currentId,
		uint256 currentValue
	) private {
		if (currentId > 0) {
			uint256 lastId = snaps.length > 0
				? snaps[snaps.length - 1].id
				: 0;
			if (lastId < currentId) {
				snaps.push(Snap(currentId, currentValue));
			}
		}
	}

	function _valueAt(
		Snap[] storage snaps,
		uint256 snapshotId,
		uint256 currentValue
	) private view returns (uint256) {
		uint256 low = 0;
		uint256 high = snaps.length;

		while (low < high) {
			uint256 mid = (low + high) / 2;
			if (snaps[mid].id > snapshotId) {
				high = mid;
			} else {
				low = mid + 1;
			}
		}

		if (high == snaps.length) {
			return currentValue;
		}
		return snaps[high].value;
	}

	// MARK: ERC-3643 Controls

	/// @inheritdoc IComplianceToken
	function setAddressFrozen(address addr, bool frozen) external onlyOwner {
		_frozen[addr] = frozen;
		emit AddressFrozen(addr, frozen);
	}

	/// @inheritdoc IComplianceToken
	function freezePartialTokens(
		address addr,
		uint256 amount
	) external onlyOwner {
		require(
			balanceOf(addr) >= _frozenTokens[addr] + amount,
			"Insufficient balance"
		);
		_frozenTokens[addr] += amount;
		emit TokensFrozen(addr, amount);
	}

	/// @inheritdoc IComplianceToken
	function unfreezePartialTokens(
		address addr,
		uint256 amount
	) external onlyOwner {
		require(_frozenTokens[addr] >= amount, "Not enough frozen tokens");
		_frozenTokens[addr] -= amount;
		emit TokensUnfrozen(addr, amount);
	}

	/// @inheritdoc IComplianceToken
	function isFrozen(address addr) external view returns (bool) {
		return _frozen[addr];
	}

	/// @inheritdoc IComplianceToken
	function getFrozenTokens(address addr) external view returns (uint256) {
		return _frozenTokens[addr];
	}

	// MARK: Forced Transfer (Admin Recovery)

	/// @inheritdoc IComplianceToken
	function forcedTransfer(
		address from,
		address to,
		uint256 amount
	) external onlyOwner {
		_forcedUpdate(from, to, amount);
		emit TokensRecovered(from, to, amount);
	}

	/// @inheritdoc IComplianceToken
	function batchTransfer(
		address[] calldata to,
		uint256[] calldata amounts
	) external {
		require(to.length == amounts.length, "Length mismatch");
		for (uint256 i = 0; i < to.length; i++) {
			transfer(to[i], amounts[i]);
		}
	}

	/// @inheritdoc IComplianceToken
	function batchForcedTransfer(
		address[] calldata from,
		address[] calldata to,
		uint256[] calldata amounts
	) external onlyOwner {
		require(
			from.length == to.length && to.length == amounts.length,
			"Length mismatch"
		);
		for (uint256 i = 0; i < from.length; i++) {
			_forcedUpdate(from[i], to[i], amounts[i]);
			emit TokensRecovered(from[i], to[i], amounts[i]);
		}
	}

	// MARK: Pause

	function pause() external onlyOwner {
		_pause();
	}

	function unpause() external onlyOwner {
		_unpause();
	}

	// MARK: Vault

	receive() external payable {}

	function withdrawFunds(
		address token,
		address to,
		uint256 amount
	) external onlyOwner {
		require(to != address(0), "Invalid recipient");

		if (token == address(0)) {
			require(address(this).balance >= amount, "Insufficient balance");
			(bool success, ) = to.call{value: amount}("");
			require(success, "Transfer failed");
		} else {
			IERC20(token).transfer(to, amount);
		}
	}

	// MARK: Transfer Hook

	function _update(
		address from,
		address to,
		uint256 value
	) internal override {
		// Compliance enforcement for transfers and mints (not burns)
		if (to != address(0)) {
			// Exempt addresses skip all compliance checks
			if (!_exempt[from] && !_exempt[to]) {
				// Freeze checks (inline — no external call)
				if (from != address(0)) {
					require(!_frozen[from], "Address frozen");
					if (_frozenTokens[from] > 0) {
						require(
							balanceOf(from) - _frozenTokens[from] >= value,
							"Exceeds transferable balance"
						);
					}
				}
				require(!_frozen[to], "Address frozen");

				// Credential check (single external call)
				if (address(_compliancePolicy) != address(0)) {
					(bool pass, ) = _compliancePolicy.check(
						address(this),
						msg.sig,
						from,
						to,
						value
					);
					require(pass, "Compliance: transfer not allowed");
				}
			}
		}

		// Snapshot tracking
		uint256 currentId = _currentSnapshotId;
		if (from != address(0)) {
			_updateSnap(_balanceSnaps[from], currentId, balanceOf(from));
		}
		if (to != address(0)) {
			_updateSnap(_balanceSnaps[to], currentId, balanceOf(to));
		}
		if (from == address(0) || to == address(0)) {
			_updateSnap(_totalSupplySnaps, currentId, totalSupply());
		}

		super._update(from, to, value);
	}

	/// @dev Forced update bypasses compliance but still tracks snapshots.
	function _forcedUpdate(
		address from,
		address to,
		uint256 value
	) internal {
		uint256 currentId = _currentSnapshotId;
		if (from != address(0)) {
			_updateSnap(_balanceSnaps[from], currentId, balanceOf(from));
		}
		if (to != address(0)) {
			_updateSnap(_balanceSnaps[to], currentId, balanceOf(to));
		}
		if (from == address(0) || to == address(0)) {
			_updateSnap(_totalSupplySnaps, currentId, totalSupply());
		}

		super._update(from, to, value);
	}
}
