// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IdentitySyncSender
 * @dev Home-chain endpoint that broadcasts identity registrations/removals to
 * every configured destination chain via CCIP, so each chain's IdentityRegistry
 * (through its IdentitySyncReceiver + SYNC_ROLE) mirrors global KYC state. This
 * is what makes source-side bridge gating sound: a receiver verified anywhere is
 * verified everywhere.
 *
 * Fees are paid in `feeToken` (address(0) = native). For native, the caller
 * sends msg.value covering the sum of per-destination fees (exact amounts are
 * forwarded; any surplus is refunded). For an ERC20 fee token, the caller must
 * approve this contract for the total first.
 */
contract IdentitySyncSender is Ownable {
    using SafeERC20 for IERC20;

    IRouterClient public immutable router;
    address public immutable feeToken; // address(0) => native

    // destinationChainSelector => IdentitySyncReceiver address
    mapping(uint64 => address) public destReceiver;
    uint64[] public destChains;

    uint256 public gasLimit = 200_000;

    /// @notice Upper bound on the fee accepted per destination message; caps
    /// how much a single misconfigured/malicious lane router can pull (0 = no
    /// cap). Symmetric across native and ERC20 fee paths.
    uint256 public maxFeePerMessage;

    event DestinationSet(uint64 indexed chainSelector, address receiver);
    event GasLimitSet(uint256 gasLimit);
    event MaxFeePerMessageSet(uint256 maxFee);
    event IdentityBroadcast(
        address indexed user,
        bool removal,
        uint64 indexed chainSelector,
        bytes32 messageId
    );

    error NoDestinations();
    error InsufficientNativeFee(uint256 required, uint256 provided);
    error FeeExceedsMax(uint64 chainSelector, uint256 fee, uint256 maxFee);
    error RefundFailed();

    constructor(
        address _router,
        address _feeToken,
        address _owner
    ) Ownable(_owner) {
        router = IRouterClient(_router);
        feeToken = _feeToken;
    }

    function setDestination(
        uint64 chainSelector,
        address receiver
    ) external onlyOwner {
        if (destReceiver[chainSelector] == address(0) && receiver != address(0)) {
            destChains.push(chainSelector);
        }
        destReceiver[chainSelector] = receiver;
        emit DestinationSet(chainSelector, receiver);
    }

    function setGasLimit(uint256 _gasLimit) external onlyOwner {
        gasLimit = _gasLimit;
        emit GasLimitSet(_gasLimit);
    }

    function setMaxFeePerMessage(uint256 _maxFee) external onlyOwner {
        maxFeePerMessage = _maxFee;
        emit MaxFeePerMessageSet(_maxFee);
    }

    function destinationCount() external view returns (uint256) {
        return destChains.length;
    }

    function broadcastRegister(
        address user,
        uint16 country,
        bytes32 identityHash
    ) external payable onlyOwner {
        _broadcast(abi.encode(false, user, country, identityHash), user, false);
    }

    function broadcastRemove(address user) external payable onlyOwner {
        _broadcast(abi.encode(true, user, uint16(0), bytes32(0)), user, true);
    }

    function _broadcast(
        bytes memory data,
        address user,
        bool removal
    ) internal {
        uint256 len = destChains.length;
        if (len == 0) revert NoDestinations();

        uint256 nativeSpent = 0;
        for (uint256 i = 0; i < len; i++) {
            uint64 sel = destChains[i];
            address receiver = destReceiver[sel];
            if (receiver == address(0)) continue; // destination was cleared

            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(receiver),
                data: data,
                tokenAmounts: new Client.EVMTokenAmount[](0),
                feeToken: feeToken,
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: gasLimit})
                )
            });

            uint256 fee = router.getFee(sel, message);
            if (maxFeePerMessage != 0 && fee > maxFeePerMessage) {
                revert FeeExceedsMax(sel, fee, maxFeePerMessage);
            }
            bytes32 messageId;
            if (feeToken == address(0)) {
                nativeSpent += fee;
                if (msg.value < nativeSpent) {
                    revert InsufficientNativeFee(nativeSpent, msg.value);
                }
                messageId = router.ccipSend{value: fee}(sel, message);
            } else {
                IERC20(feeToken).safeTransferFrom(msg.sender, address(this), fee);
                IERC20(feeToken).forceApprove(address(router), fee);
                messageId = router.ccipSend(sel, message);
            }
            emit IdentityBroadcast(user, removal, sel, messageId);
        }

        // Refund any native surplus.
        if (feeToken == address(0) && msg.value > nativeSpent) {
            (bool ok, ) = msg.sender.call{value: msg.value - nativeSpent}("");
            if (!ok) revert RefundFailed();
        }
    }
}
