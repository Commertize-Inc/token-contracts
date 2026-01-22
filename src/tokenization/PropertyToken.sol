// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../compliance/TokenCompliance.sol";

contract PropertyToken is ERC20, ERC20Permit, Ownable {

    TokenCompliance public compliance;

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
        uint256 _supply,
        address _compliance,
        address _owner
    ) ERC20(_name, _symbol) ERC20Permit(_name) Ownable(_owner) {
        compliance = TokenCompliance(_compliance);
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
        require(_compliance != address(0), "Invalid compliance address");
        compliance = TokenCompliance(_compliance);
    }

    // Overrides

    function _update(address from, address to, uint256 value) internal override {
        require(compliance.canTransfer(from, to), "Compliance: Transfer not allowed");

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
            // Native
            require(address(this).balance >= amount, "Insufficient balance");
            (bool success, ) = to.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            // ERC20
            IERC20(token).transfer(to, amount);
        }
    }
}
