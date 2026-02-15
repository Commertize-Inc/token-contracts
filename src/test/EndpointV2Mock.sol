// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ILayerZeroEndpointV2, MessagingParams, MessagingFee, MessagingReceipt, Origin } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";
import { IMessageLibManager, SetConfigParam } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/IMessageLibManager.sol";
import { IMessagingComposer } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/IMessagingComposer.sol";
import { IMessagingChannel } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/IMessagingChannel.sol";
import { IMessagingContext } from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/IMessagingContext.sol";

/**
 * @title EndpointV2Mock
 * @dev Minimal mock LayerZero V2 endpoint for local testing of OFT/OFTAdapter contracts.
 *      Supports single-chain simulation: send() stores a packet, then deliverPacket() relays it.
 */
contract EndpointV2Mock is ILayerZeroEndpointV2 {

    uint32 public immutable override eid;
    uint64 private _nonce;

    // Destination endpoint mapping: oapp address => destination endpoint
    mapping(address => address) public destLzEndpoint;

    // Stored packets for delivery
    struct Packet {
        uint32 dstEid;
        bytes32 receiver;
        bytes message;
        bytes options;
        address sender;
        bytes32 guid;
        uint64 nonce;
    }
    Packet[] public packets;

    constructor(uint32 _eid) {
        eid = _eid;
    }

    // ─── Core Functions ────────────────────────────────────

    function setDelegate(address /*_delegate*/) external override {
        // No-op for mock
    }

    function quote(
        MessagingParams calldata /*_params*/,
        address /*_sender*/
    ) external pure override returns (MessagingFee memory) {
        // Return a small fixed fee for testing
        return MessagingFee({ nativeFee: 1, lzTokenFee: 0 });
    }

    function send(
        MessagingParams calldata _params,
        address /*_refundAddress*/
    ) external payable override returns (MessagingReceipt memory) {
        _nonce++;
        bytes32 guid = keccak256(abi.encodePacked(eid, msg.sender, _params.dstEid, _params.receiver, _nonce));

        packets.push(Packet({
            dstEid: _params.dstEid,
            receiver: _params.receiver,
            message: _params.message,
            options: _params.options,
            sender: msg.sender,
            guid: guid,
            nonce: _nonce
        }));

        return MessagingReceipt({
            guid: guid,
            nonce: _nonce,
            fee: MessagingFee({ nativeFee: msg.value, lzTokenFee: 0 })
        });
    }

    // ─── Test Helpers ──────────────────────────────────────

    /**
     * @dev Maps an OApp on the destination to its mock endpoint (for cross-chain simulation).
     */
    function setDestLzEndpoint(address _destOApp, address _destEndpoint) external {
        destLzEndpoint[_destOApp] = _destEndpoint;
    }

    /**
     * @dev Returns the number of stored packets
     */
    function packetCount() external view returns (uint256) {
        return packets.length;
    }

    /**
     * @dev Delivers all stored packets by calling lzReceive on each destination OApp.
     *      Simulates the full LayerZero relay path on a single chain.
     */
    function deliverAllPackets() external {
        while (packets.length > 0) {
            Packet memory pkt = packets[packets.length - 1];
            packets.pop();

            address receiver = address(uint160(uint256(pkt.receiver)));

            Origin memory origin = Origin({
                srcEid: eid,
                sender: bytes32(uint256(uint160(pkt.sender))),
                nonce: pkt.nonce
            });

            // The endpoint is msg.sender when calling lzReceive
            // We need to call lzReceive on the destination OApp
            // If there's a mapped endpoint, use it. Otherwise, call directly.
            address destEndpoint = destLzEndpoint[receiver];
            if (destEndpoint != address(0) && destEndpoint != address(this)) {
                // Cross-endpoint: forward to destination endpoint to deliver
                EndpointV2Mock(destEndpoint).deliverPacketFrom(origin, receiver, pkt.guid, pkt.message);
            } else {
                // Same endpoint or direct: call lzReceive directly as the endpoint
                this.lzReceive(origin, receiver, pkt.guid, pkt.message, "");
            }
        }
    }

    /**
     * @dev Called by source endpoint to deliver a packet to a destination OApp through this endpoint.
     */
    function deliverPacketFrom(Origin memory _origin, address _receiver, bytes32 _guid, bytes memory _message) external {
        this.lzReceive(_origin, _receiver, _guid, _message, "");
    }

    // ─── ILayerZeroEndpointV2 Required Functions ───────────

    function lzReceive(
        Origin calldata _origin,
        address _receiver,
        bytes32 _guid,
        bytes calldata _message,
        bytes calldata _extraData
    ) external payable override {
        // Call lzReceive on the OApp (this contract is msg.sender, matching the endpoint check)
        bytes memory data = abi.encodeWithSignature(
            "lzReceive((uint32,bytes32,uint64),bytes32,bytes,address,bytes)",
            _origin,
            _guid,
            _message,
            address(this), // executor
            _extraData
        );
        (bool success, bytes memory result) = _receiver.call(data);
        if (!success) {
            // Bubble up the revert reason
            if (result.length > 0) {
                assembly { revert(add(result, 32), mload(result)) }
            }
            revert("EndpointV2Mock: lzReceive failed");
        }
    }

    function verify(Origin calldata, address, bytes32) external override {}
    function verifiable(Origin calldata, address) external pure override returns (bool) { return true; }
    function initializable(Origin calldata, address) external pure override returns (bool) { return true; }
    function clear(address, Origin calldata, bytes32, bytes calldata) external override {}
    function setLzToken(address) external override {}
    function lzToken() external pure override returns (address) { return address(0); }
    function nativeToken() external pure override returns (address) { return address(0); }

    // ─── IMessagingChannel stubs ───────────────────────────

    function skip(address, uint32, bytes32, uint64) external override {}
    function nilify(address, uint32, bytes32, uint64, bytes32) external override {}
    function burn(address, uint32, bytes32, uint64, bytes32) external override {}
    function nextGuid(address, uint32, bytes32) external pure override returns (bytes32) { return bytes32(0); }
    function inboundNonce(address, uint32, bytes32) external pure override returns (uint64) { return 0; }
    function outboundNonce(address, uint32, bytes32) external view override returns (uint64) { return _nonce; }
    function inboundPayloadHash(address, uint32, bytes32, uint64) external pure override returns (bytes32) { return bytes32(0); }
    function lazyInboundNonce(address, uint32, bytes32) external pure override returns (uint64) { return 0; }

    // ─── IMessageLibManager stubs ──────────────────────────

    function registerLibrary(address) external override {}
    function isRegisteredLibrary(address) external pure override returns (bool) { return true; }
    function getRegisteredLibraries() external pure override returns (address[] memory) { return new address[](0); }
    function setDefaultSendLibrary(uint32, address) external override {}
    function defaultSendLibrary(uint32) external pure override returns (address) { return address(0); }
    function setDefaultReceiveLibrary(uint32, address, uint256) external override {}
    function defaultReceiveLibrary(uint32) external pure override returns (address) { return address(0); }
    function setDefaultReceiveLibraryTimeout(uint32, address, uint256) external override {}
    function defaultReceiveLibraryTimeout(uint32) external pure override returns (address, uint256) { return (address(0), 0); }
    function isSupportedEid(uint32) external pure override returns (bool) { return true; }
    function isValidReceiveLibrary(address, uint32, address) external pure override returns (bool) { return true; }
    function setSendLibrary(address, uint32, address) external override {}
    function getSendLibrary(address, uint32) external pure override returns (address) { return address(0); }
    function isDefaultSendLibrary(address, uint32) external pure override returns (bool) { return true; }
    function setReceiveLibrary(address, uint32, address, uint256) external override {}
    function getReceiveLibrary(address, uint32) external pure override returns (address, bool) { return (address(0), true); }
    function setReceiveLibraryTimeout(address, uint32, address, uint256) external override {}
    function receiveLibraryTimeout(address, uint32) external pure override returns (address, uint256) { return (address(0), 0); }
    function setConfig(address, address, SetConfigParam[] calldata) external override {}
    function getConfig(address, address, uint32, uint32) external pure override returns (bytes memory) { return ""; }

    // ─── IMessagingComposer stubs ──────────────────────────

    function composeQueue(address, address, bytes32, uint16) external pure override returns (bytes32) { return bytes32(0); }
    function sendCompose(address, bytes32, uint16, bytes calldata) external override {}
    function lzCompose(address, address, bytes32, uint16, bytes calldata, bytes calldata) external payable override {}

    // ─── IMessagingContext stubs ───────────────────────────

    function isSendingMessage() external pure override returns (bool) { return false; }
    function getSendContext() external pure override returns (uint32, address) { return (0, address(0)); }
}
