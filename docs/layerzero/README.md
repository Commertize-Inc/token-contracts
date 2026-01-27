# LayerZero Integration & Deployment Guide

This guide details how to deploy the Commertize Property Token using the LayerZero V2 OFT (Omnichain Fungible Token) Adapter pattern.

## Architecture

We use the **Lock-and-Mint** pattern via the `OFTAdapter`.

- **Home Chain (Hedera)**:
  - **Contracts**: `PropertyToken` (ERC20), `PropertyTokenAdapter`, `TokenCompliance`.
  - **Mechanism**: The `PropertyTokenAdapter` locks the original tokens on Hedera.
- **Destination Chains (e.g., Ethereum, Polygon, Arbitrum)**:
  - **Contracts**: `PropertyTokenOFT`.
  - **Mechanism**: `PropertyTokenOFT` is an OFT that mints and burns tokens representing the locked collateral on Hedera.

## Prerequisites

1.  **Wallets**: Admin wallet with funds (HBAR for Hedera, Native Gas for destination chains).
2.  **Endpoints**: Ensure LayerZero V2 endpoints are live on Hedera and destination chains.
    - **Hedera Mainnet Endpoint**: Check [LayerZero Docs](https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints).
    - **Hedera Testnet Endpoint**: `0x6EDCE65403992e310A62460808c4b910D972f10f` (Eid: 30316).

## Deployment Steps

### Phase 1: Home Chain (Hedera)

1.  **Deploy `PropertyToken`** (if not already deployed).
2.  **Deploy `TokenCompliance`** (if not already deployed).
3.  **Deploy `PropertyTokenAdapter`**:
    - **Constructor Arguments**:
      - `_token`: Address of the `PropertyToken`.
      - `_lzEndpoint`: LayerZero V2 Endpoint address on Hedera.
      - `_delegate`: Admin/Owner address.
      - `_compliance`: Address of the `TokenCompliance` contract.
4.  **Configure Adapter**:
    - **Set Peer**: `adapter.setPeer(dstEid, bytes32(addressToBytes32(remoteOFTAddress)))`.
    - **Approve**: The Admin (or Token Owner) must approve the Adapter to spend `PropertyToken`.
      - Often, you transfer the initial supply to the Adapter, OR you rely on users approving the adapter to bridge.
      - **Crucial**: If the goal is to make the token _available_ only via bridging initially, you might lock the supply. If users hold tokens, they approve the adapter individually.

### Phase 2: Destination Chains

1.  **Deploy `PropertyTokenOFT`**:
    - **Constructor Arguments**:
      - `_name`: Token Name (e.g., "Commertize Property").
      - `_symbol`: Token Symbol (e.g., "CPT").
      - `_lzEndpoint`: LayerZero V2 Endpoint on this chain.
      - `_delegate`: Admin address.
      - `_supply`: `0` (Supply is minted via bridging).
      - `_compliance`: Address of a local compliance mirror (or `address(0)` if not strictly enforcing on-chain compliance on destination).
      - `_owner`: Admin address.
2.  **Configure OFT**:
    - **Set Peer**: `oft.setPeer(srcEid, bytes32(addressToBytes32(adapterAddressOnHedera)))`.

### Phase 3: Wiring It Up

1.  **Set Enforced Options (Gas)**:
    - Configure `minDstGas` for both directions using `setEnforcedOptions`.
2.  **Verify Connection**:
    - Use `lz-verify` or send a small test amount.
3.  **Compliance Check**:
    - The `PropertyTokenAdapter` will automatically check `TokenCompliance.isVerified(msg.sender)` on Hedera before allowing a bridge transaction.

## Operational management

- **Pause/Unpause**: Use `setCompliance` to change or disable compliance checks if needed.
- **Fees**: Configure LayerZero library defaults for fee collection.

## References

- [LayerZero V2 OFT Quickstart](https://docs.layerzero.network/v2/developers/evm/oft/quickstart)
- [Hedera LayerZero Integration](https://docs.hedera.com/hedera/open-source-solutions/interoperability-and-bridging/layerzero)
