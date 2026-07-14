// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

/**
 * @title MockCCIPRouter
 * @dev Test-only router: records the last ccipSend and returns a fixed fee.
 * Used to exercise IdentitySyncSender without a live CCIP deployment.
 */
contract MockCCIPRouter is IRouterClient {
    uint256 public fee;
    uint256 public sendCount;
    uint64 public lastDestChain;
    bytes public lastReceiver;
    bytes public lastData;
    address public lastFeeToken;
    uint256 public lastNativeValue;

    constructor(uint256 _fee) {
        fee = _fee;
    }

    function setFee(uint256 _fee) external {
        fee = _fee;
    }

    function isChainSupported(uint64) external pure returns (bool) {
        return true;
    }

    function getFee(
        uint64,
        Client.EVM2AnyMessage memory
    ) external view returns (uint256) {
        return fee;
    }

    function ccipSend(
        uint64 destinationChainSelector,
        Client.EVM2AnyMessage calldata message
    ) external payable returns (bytes32) {
        sendCount += 1;
        lastDestChain = destinationChainSelector;
        lastReceiver = message.receiver;
        lastData = message.data;
        lastFeeToken = message.feeToken;
        lastNativeValue = msg.value;
        return keccak256(abi.encode(sendCount, destinationChainSelector));
    }
}
