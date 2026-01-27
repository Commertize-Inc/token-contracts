// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { OFT } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import "../compliance/TokenCompliance.sol";

/**
 * @title PropertyTokenOFT
 * @dev OFT implementation for destination chains with snapshot support for dividends
 * @dev NOTE: Snapshot timing - snapshots capture state BEFORE the snapshot() call.
 *      When claiming dividends, the balance at the snapshot is used, not current balance.
 *      This prevents front-running of dividend distributions.
 */
contract PropertyTokenOFT is Ownable, ERC20Permit, OFT, Pausable {

    TokenCompliance public compliance;
    bool public complianceEnabled; // Explicit flag to enable/disable compliance

    struct Snap {
        uint256 id;
        uint256 value;
    }

    // Snapshot ID counter
    uint256 private _currentSnapshotId;

    // Snapshot storage
    Snap[] private _totalSupplySnaps;
    mapping(address => Snap[]) private _balanceSnaps;

    event Snapshot(uint256 id);

    constructor(
        string memory _name,
        string memory _symbol,
        address _lzEndpoint,
        address _delegate,
        uint256 _supply,
        address _compliance,
        address _owner
    ) OFT(_name, _symbol, _lzEndpoint, _delegate) ERC20Permit(_name) Ownable(_owner) {
        require(_compliance != address(0), "Invalid compliance");
        compliance = TokenCompliance(_compliance);
        complianceEnabled = true; // Enable by default
        _mint(_owner, _supply);
    }

    function snapshot() external onlyOwner returns (uint256) {
        _currentSnapshotId += 1;
        uint256 currentId = _currentSnapshotId;
        emit Snapshot(currentId);
        return currentId;
    }

    function getCurrentSnapshotId() external view returns (uint256) {
        return _currentSnapshotId;
    }

    function setCompliance(address _compliance) external onlyOwner {
        require(_compliance != address(0), "Invalid compliance");
        compliance = TokenCompliance(_compliance);
    }

    /**
     * @notice Enable or disable compliance checks
     * @param _enabled Whether compliance should be enforced
     * @dev Use with caution - disabling compliance removes transfer restrictions
     */
    function setComplianceEnabled(bool _enabled) external onlyOwner {
        complianceEnabled = _enabled;
    }

    /**
     * @notice Pause all transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Overrides

    /**
     * @dev Override _update to enforce compliance and snapshot tracking
     * @dev CRITICAL: Compliance check prevents bypass - both compliance address AND flag must be set
     */
    function _update(address from, address to, uint256 value) internal override(ERC20) whenNotPaused {
        // CRITICAL FIX: Check both complianceEnabled flag AND compliance address
        if (complianceEnabled && address(compliance) != address(0)) {
            require(compliance.canTransfer(from, to), "Compliance: Transfer not allowed");
        }

        // Capture old values for snapshot if needed
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

    // Snapshot Logic: Store (id, oldValue) when a change happens in a NEW id period.
    function _updateSnap(Snap[] storage snaps, uint256 currentId, uint256 currentValue) private {
        // If currentId > 0 check if storage of the *pre-change* value is required
        if (currentId > 0) {
            uint256 lastId = snaps.length > 0 ? snaps[snaps.length - 1].id : 0;
            // If the last stored snapshot ID is older than the current ID,
            // Records the value that existed *before* this transaction.
            if (lastId < currentId) {
                snaps.push(Snap(currentId, currentValue));
            }
        }
    }

    function _valueAt(Snap[] storage snaps, uint256 snapshotId, uint256 currentValue) private view returns (uint256) {
        // Finds the first checkpoint where `checkpoint.id > snapshotId`.
        // The value stored there is the value that was preserved just before the first change AFTER snapshotId.
        // If no such checkpoint exists, it means no changes happened after snapshotId, so current value is valid.

        uint256 low = 0;
        uint256 high = snaps.length;

        // Binary search for first element > snapshotId
        while(low < high) {
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

    function balanceOfAt(address account, uint256 snapshotId) public view returns (uint256) {
        return _valueAt(_balanceSnaps[account], snapshotId, balanceOf(account));
    }

    function totalSupplyAt(uint256 snapshotId) public view returns (uint256) {
        return _valueAt(_totalSupplySnaps, snapshotId, totalSupply());
    }
}
