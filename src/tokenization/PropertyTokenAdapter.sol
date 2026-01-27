// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { OFTAdapter } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFTAdapter.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import "../compliance/TokenCompliance.sol";
import "../compliance/IdentityRegistry.sol";

/**
 * @title PropertyTokenAdapter
 * @dev Wraps an existing ERC20 PropertyToken on the home chain (Hedera) to enable cross-chain transfers via LayerZero.
 *      Acts as a Lock-and-Mint mechanism where tokens are locked here and minted as OFTs on destination chains.
 * @dev IMPORTANT: Cross-chain compliance - sender is verified on source chain, but receiver compliance must be
 *      enforced on destination chain via PropertyTokenOFT contract.
 */
contract PropertyTokenAdapter is OFTAdapter, Pausable {

    TokenCompliance public compliance;

    constructor(
        address _token,       // The existing PropertyToken address
        address _lzEndpoint,  // LayerZero Endpoint V2 on Hedera
        address _delegate,    // Owner/Delegate address
        address _compliance   // Compliance contract address
    ) OFTAdapter(_token, _lzEndpoint, _delegate) Ownable(_delegate) {
        require(_compliance != address(0), "Invalid compliance");
        compliance = TokenCompliance(_compliance);
    }

    /**
     * @dev Sets the compliance contract address.
     * @param _compliance The new compliance contract address.
     */
    function setCompliance(address _compliance) external onlyOwner {
        require(_compliance != address(0), "Invalid compliance");
        compliance = TokenCompliance(_compliance);
    }

    /**
     * @notice Pause cross-chain transfers (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause cross-chain transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Overrides _debit to enforce local compliance checks before allowing tokens to be bridged out.
     *      This ensures that only compliant users/transactions can initiate a cross-chain transfer.
     * @dev NOTE: This only validates the SENDER. Receiver compliance must be enforced on the destination chain.
     */
    function _debit(
        address _from,
        uint256 _amountLD,
        uint256 _minAmountLD,
        uint32 _dstEid
    ) internal override whenNotPaused returns (uint256 amountSent, uint256 amountReceived) {
        // Enforce compliance check on the sender (who is bridging out)
        // Since we are on the home chain, we query the local compliance contract directly.
        if (address(compliance) != address(0)) {
            IdentityRegistry registry = compliance.identityRegistry();
            require(registry.isVerified(_from), "Compliance: Sender not verified");
        }

        return super._debit(_from, _amountLD, _minAmountLD, _dstEid);
    }
}
