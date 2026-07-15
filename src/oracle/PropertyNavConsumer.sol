// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ReceiverTemplate} from "./keystone/ReceiverTemplate.sol";

/**
 * @title PropertyNavConsumer
 * @notice On-chain sink for property net-asset-value (NAV) reports produced by
 * the Chainlink CRE `nav-workflow` (see ../../cre). A DON fetches NAV/appraisal
 * data off-chain, reaches consensus, and the KeystoneForwarder calls
 * {onReport} on this contract with a signed report. Downstream contracts
 * (PropertyToken dividend logic, escrow pricing, dashboards) read the latest
 * NAV via {latestNav}.
 *
 * Trust model (inherited from ReceiverTemplate):
 *  - onReport is callable only by the configured KeystoneForwarder.
 *  - In production, also pin the workflow via setExpectedAuthor(owner) and
 *    setExpectedWorkflowId(id) so a different workflow from the same forwarder
 *    cannot write NAVs here.
 *
 * NAV is reported scaled to 18 decimals (parseUnits(nav, 18) in the workflow).
 */
contract PropertyNavConsumer is ReceiverTemplate {
    struct NavRecord {
        uint256 nav; // NAV per token, 18 decimals
        uint32 timestamp; // report's as-of time (unix seconds)
    }

    // keccak-style property id (bytes32) => latest NAV
    mapping(bytes32 => NavRecord) private _navByProperty;

    event NavUpdated(bytes32 indexed propertyId, uint256 nav, uint32 timestamp);
    event StaleReportDiscarded(
        bytes32 indexed propertyId,
        uint32 reportTimestamp,
        uint32 storedTimestamp
    );

    error EmptyPropertyId();

    /// @param forwarder KeystoneForwarder for the target chain. Sepolia and
    /// Base Sepolia both use 0xF8344CFd5c43616a4366C34E3EEE75af79a74482; confirm
    /// with `cre workflow supported-chains` before deploying.
    constructor(address forwarder) ReceiverTemplate(forwarder) {}

    /// @dev Report layout must match the workflow's encodeAbiParameters call:
    /// (bytes32 propertyId, uint256 nav, uint32 timestamp).
    function _processReport(bytes calldata report) internal override {
        (bytes32 propertyId, uint256 nav, uint32 timestamp) = abi.decode(
            report,
            (bytes32, uint256, uint32)
        );
        if (propertyId == bytes32(0)) revert EmptyPropertyId();

        uint32 stored = _navByProperty[propertyId].timestamp;
        // Discard (do not revert on) stale/replayed reports: a revert would be
        // retried by the forwarder forever. IReceiver makes the receiver
        // responsible for dropping stale reports. Strictly-newer wins.
        if (timestamp <= stored) {
            emit StaleReportDiscarded(propertyId, timestamp, stored);
            return;
        }

        _navByProperty[propertyId] = NavRecord(nav, timestamp);
        emit NavUpdated(propertyId, nav, timestamp);
    }

    /// @notice Latest NAV for a property. Returns (0, 0) if never reported.
    function latestNav(
        bytes32 propertyId
    ) external view returns (uint256 nav, uint32 timestamp) {
        NavRecord memory r = _navByProperty[propertyId];
        return (r.nav, r.timestamp);
    }
}
