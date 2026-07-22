// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Checkpoints} from "@openzeppelin/contracts/utils/structs/Checkpoints.sol";
import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import "../compliance/ComplianceEnabled.sol";

contract PropertyToken is ERC20, ERC20Permit, Ownable, ComplianceEnabled {
    using SafeERC20 for IERC20;
    using Checkpoints for Checkpoints.Trace208;

    // Snapshot ID counter
    uint256 private _currentSnapshotId;

    // Post-change values checkpointed per snapshot period (OZ Trace208
    // collapses same-key pushes, keeping one checkpoint per period).
    Checkpoints.Trace208 private _totalSupplySnaps;
    mapping(address => Checkpoints.Trace208) private _balanceSnaps;

    // Contracts allowed to take snapshots besides the owner (e.g. DividendVault).
    mapping(address => bool) public isSnapshotter;

    event Snapshot(uint256 id);
    event SnapshotterSet(address indexed account, bool allowed);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _supply,
        address _compliance,
        address _owner
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(_owner) {
        _setCompliance(_compliance);
        _mint(_owner, _supply);
    }

    function snapshot() external returns (uint256) {
        require(
            msg.sender == owner() || isSnapshotter[msg.sender],
            "Not authorized to snapshot"
        );
        _currentSnapshotId += 1;
        uint256 currentId = _currentSnapshotId;
        emit Snapshot(currentId);
        return currentId;
    }

    function setSnapshotter(address account, bool allowed) external onlyOwner {
        isSnapshotter[account] = allowed;
        emit SnapshotterSet(account, allowed);
    }

    function getCurrentSnapshotId() external view returns (uint256) {
        return _currentSnapshotId;
    }

    function setCompliance(address _compliance) external onlyOwner {
        _setCompliance(_compliance);
    }

    /**
     * @notice CCIP token-admin hook (CCT standard). Enables self-serve
     * registration in Chainlink's TokenAdminRegistry via registerAdminViaGetCCIPAdmin.
     */
    function getCCIPAdmin() external view returns (address) {
        return owner();
    }

    // Overrides

    function _update(address from, address to, uint256 value) internal virtual override {
        // Compliance gates every balance-moving update, including zero-value
        // transfers (so unverified parties cannot emit Transfer events on a
        // regulated token). The sole exception is the constructor's zero-token
        // mint for zero-supply (bridged) variants, whose owner may not yet be
        // verified.
        if (!(from == address(0) && value == 0)) {
            _checkCompliance(from, to);
        }

        super._update(from, to, value);

        // Checkpoint the post-change values keyed by the current snapshot
        // period. balanceOfAt(id) then reads upperLookup(id - 1): the last
        // value written before snapshot id was taken — i.e. the balance frozen
        // at snapshot time, immune to later same-period transfers (the
        // DividendVault double-claim/drain root cause in the hand-rolled
        // predecessor of this code).
        uint48 key = SafeCast.toUint48(_currentSnapshotId);
        if (from != address(0)) {
            _balanceSnaps[from].push(key, SafeCast.toUint208(balanceOf(from)));
        }
        if (to != address(0)) {
            _balanceSnaps[to].push(key, SafeCast.toUint208(balanceOf(to)));
        }
        if (from == address(0) || to == address(0)) {
            _totalSupplySnaps.push(key, SafeCast.toUint208(totalSupply()));
        }
    }

    function _valueAt(
        Checkpoints.Trace208 storage snaps,
        uint256 snapshotId,
        uint256 currentValue
    ) private view returns (uint256) {
        require(snapshotId > 0, "Invalid snapshot id");
        // Beyond the latest snapshot there is nothing frozen yet — the live
        // value is the answer (and skips an out-of-range uint48 cast).
        if (snapshotId > _currentSnapshotId) {
            return currentValue;
        }
        return snaps.upperLookup(SafeCast.toUint48(snapshotId - 1));
    }

    function balanceOfAt(address account, uint256 snapshotId) public view returns (uint256) {
        return _valueAt(_balanceSnaps[account], snapshotId, balanceOf(account));
    }

    function totalSupplyAt(uint256 snapshotId) public view returns (uint256) {
        return _valueAt(_totalSupplySnaps, snapshotId, totalSupply());
    }

    // ==========================================
    // Vault Functionality
    // ==========================================

    /**
     * @notice Allow contract to receive native funds (e.g. from Escrow)
     */
    receive() external payable {}

    /**
     * @notice Withdraw funds (Native or ERC20) from the contract.
     * @dev Only owner (Sponsor/Admin) can withdraw.
     * @param token Address of token to withdraw. address(0) for Native.
     * @param to Recipient address.
     * @param amount Amount to withdraw.
     */
    function withdrawFunds(address token, address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");

        if (token == address(0)) {
            Address.sendValue(payable(to), amount);
        } else {
            // ERC20
            IERC20(token).safeTransfer(to, amount);
        }
    }
}
