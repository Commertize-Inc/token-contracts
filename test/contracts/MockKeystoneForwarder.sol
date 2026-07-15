// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IReceiver} from "../../src/oracle/keystone/IReceiver.sol";

/**
 * @dev Test-only stand-in for Chainlink's KeystoneForwarder. Relays a report to
 * a receiver's onReport so tests can exercise the forwarder-gated path. Lives
 * under test/contracts so its artifact is never published.
 */
contract MockKeystoneForwarder {
    function relay(
        address receiver,
        bytes calldata metadata,
        bytes calldata report
    ) external {
        IReceiver(receiver).onReport(metadata, report);
    }
}
