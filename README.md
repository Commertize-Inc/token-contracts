# @commertize/token-contracts

Smart contracts for Commertize — compliance-gated tokenization of commercial
real estate, with Chainlink CCIP cross-chain bridging and a Chainlink CRE oracle
for on-chain property valuation.

## Installation

```bash
pnpm add @commertize/token-contracts
```

## Quick start

Addresses, ABIs, and network metadata are resolved at import time from the
active deployment (see [Networks](#networks)):

```typescript
import { ethers } from "ethers";
import {
	CONTRACTS,
	ABIS,
	RPC_URL,
	getIdentityRegistryContract,
} from "@commertize/token-contracts";

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Option A: build from the exported address map + ABI
const registry = new ethers.Contract(
	CONTRACTS.IdentityRegistry,
	ABIS.IdentityRegistry,
	provider,
);

// Option B: use a typed helper (reads the address from the active deployment)
const registry2 = getIdentityRegistryContract(provider);
```

## Architecture

The system is four layers on an EVM chain (Arc by default), tied together by the
compliance check that every token transfer routes through.

```mermaid
flowchart TD
    subgraph Compliance
      IR[IdentityRegistry] --> TC[TokenCompliance]
      CE[ComplianceEnabled] -.-|_checkCompliance in _update| TC
    end
    subgraph Tokenization
      PF[PropertyFactory] --> PT[PropertyToken]
      PT --> BPT[BridgedPropertyToken]
    end
    subgraph Finance
      LE[ListingEscrow]
      DV[DividendVault]
    end
    subgraph CrossChain["Cross-chain / Oracle"]
      POOL[CompliantPropertyTokenPool]
      SS[IdentitySyncSender] --> SR[IdentitySyncReceiver]
      NAV[PropertyNavConsumer]
    end
    TC --> PT
    PF --> LE
    PT --> DV
    PT --> POOL
    SR --> IR
    NAV -.NAV feed.-> DV
```

### Compliance (`src/compliance/`)

- **IdentityRegistry** — role-based registry of KYC-verified investors
  (`VERIFIED_ROLE`), with per-address country code and identity hash. Admin
  registers/removes; a separate least-privilege `SYNC_ROLE` lets a cross-chain
  receiver mirror KYC state (see [Cross-chain](#cross-chain-chainlink-ccip--cct)).
- **TokenCompliance** — points at an `IdentityRegistry` and holds an exemption
  list for infrastructure addresses (pools, escrows, vaults).
- **ComplianceEnabled** — abstract base whose `_checkCompliance(from, to)` is
  called from the token's `_update` hook. Standard transfers require **both**
  ends verified-or-exempt; mints require the receiver verified-or-exempt; burns
  are unrestricted.

### Tokenization (`src/tokenization/`)

- **PropertyToken** — ERC-20 (+ ERC-2612 Permit) representing fractional
  ownership of a property. Compliance-gated on every balance change, with a
  snapshot mechanism used for dividend distribution and a `getCCIPAdmin()` hook
  for Chainlink CCT registration.
- **BridgedPropertyToken** — destination-chain variant deployed with zero
  supply. Implements the `IBurnMintERC20` surface for CCIP pools and uses
  **mint-and-freeze**: a bridge mint always delivers (so CCIP's OffRamp sees the
  exact receiver balance delta), but the tokens are non-transferable until the
  holder is KYC-verified.
- **PropertyFactory** — deploys `PropertyToken` + `ListingEscrow` pairs and
  tracks them.

### Finance (`src/finance/`)

- **ListingEscrow** — holds property tokens and investor funds during a
  time-bound raise; finalizes to the sponsor when the target is met and
  distributes tokens, or refunds on a failed raise. `ReentrancyGuard`, `Pausable`,
  minimum-deposit and hard-cap protection, bounded investor tracking.
- **DividendVault** — distributes property income (USDC) to holders pro-rata by
  snapshot balance, with a configurable protocol fee, batch claims, and recovery
  of unclaimed funds after a timeout. `ReentrancyGuard`, `Pausable`.

### Cross-chain (Chainlink CCIP / CCT) (`src/ccip/`)

- **CompliantPropertyTokenPool** — a CCIP `BurnMintTokenPool` that gates the
  **destination receiver** against the local `IdentityRegistry` in `lockOrBurn`,
  *before* burning. Because identity is mirrored to every chain, an
  unverified receiver can never be the target of a cross-chain transfer.
- **IdentitySyncSender** / **IdentitySyncReceiver** — broadcast KYC
  register/remove events from the home chain to every configured destination
  over CCIP, applied under `SYNC_ROLE`, so "verified anywhere ⇒ verified
  everywhere." This is what makes source-side gating sound.

### Oracle (Chainlink CRE) (`src/oracle/`, `cre/`)

- **PropertyNavConsumer** — a Chainlink CRE report sink (built on the keystone
  `ReceiverTemplate`). A `KeystoneForwarder` calls `onReport` with a signed
  property-NAV report; the consumer accepts strictly-newer reports and exposes
  `latestNav(propertyId)` for the rest of the ecosystem to read.
- **`cre/nav-workflow/`** — the CRE workflow scaffold that produces those
  reports: cron trigger → per-node NAV/appraisal fetch → median consensus →
  on-chain write. See [`cre/README.md`](./cre/README.md). This is a scaffold —
  no production real-estate oracle is wired to a live data source yet.

## Chainlink integration

| Product | Where | What it does |
|---|---|---|
| **CCT** (Cross-Chain Token) | `BridgedPropertyToken`, `PropertyToken.getCCIPAdmin()` | Self-serve `TokenAdminRegistry` registration; `IBurnMintERC20` surface |
| **CCIP** | `CompliantPropertyTokenPool`, `IdentitySync{Sender,Receiver}` | Burn/mint bridging with source-side compliance gating + cross-chain KYC identity sync |
| **CRE** | `src/oracle/`, `cre/` | Property-NAV oracle: consensus-aggregated valuation written on-chain |

CCIP addresses (router, chain selector, RMN proxy, LINK, TokenAdminRegistry) are
configured per network in [`networks.ts`](./networks.ts).

## Security model

- **Single compliance chokepoint.** Every balance change flows through
  `PropertyToken._update → _checkCompliance`. There is no separate transfer path;
  approvals/permit set allowance only and never move balances.
- **Mint-and-freeze on bridged tokens.** Delivery can't be blocked without
  stranding burned tokens, so an unverified bridge recipient holds frozen tokens
  until KYC completes rather than being rejected.
- **Source-side bridge gating.** The pool checks the destination receiver before
  burning, backed by cross-chain identity mirroring.
- **Least privilege.** KYC mirroring runs under a dedicated `SYNC_ROLE` that can
  only register/remove identities — not grant roles or move tokens.
- **Reentrancy & pausability.** `ListingEscrow` and `DividendVault` use
  OpenZeppelin `ReentrancyGuard` and `Pausable`.
- **Snapshot-based dividends** capture holder balances at distribution time.

The compliance and cross-chain contracts have undergone an internal security
review.

## Networks

Configured in [`networks.ts`](./networks.ts). The active network is selected by
the `EVM_NETWORK` env var (also `VITE_EVM_NETWORK` / `NEXT_PUBLIC_EVM_NETWORK`),
defaulting to `arc-testnet`.

| Network | Chain ID | Native | Notes |
|---|---|---|---|
| `arc-testnet` | 5042002 | USDC | Default; CCIP-configured |
| `ethereum-sepolia` | 11155111 | ETH | CCIP destination / oracle target |
| `localhost` | 5042002 | USDC | Local Hardhat node |
| `mainnet` | 295 | — | Placeholder; confirm before production |

USDC is **not** deployed by this package — it is assumed to already exist on the
target chain and is read from the deployment config or `USDC_ADDRESS`.

Deployment loading precedence:

1. `DEPLOYMENT_JSON` env var (raw JSON or object) — for CI/CD.
2. Bundled `deployment.<network>.json` (underscored, e.g. `deployment.arc_testnet.json`).
3. Fallback to the `networks.ts` entry for the selected network.

## Development

```bash
pnpm install
pnpm compile           # hardhat build
pnpm test              # hardhat test
pnpm node              # local hardhat node
pnpm deploy:localhost  # deploy to the local node
pnpm deploy:arc-testnet
```

Mainnet is deployed via a tagged release (`scripts/release.ts` / CI), not by
hand.

> Note: `test/TestnetValidation.ts` self-skips (via `process.exit(0)`) when no
> `deployment.default.json` is present, which ends the whole `hardhat test` run
> early. Run the unit suites explicitly, e.g.
> `hardhat test test/SmokeTest.ts test/CCIPCompliantPool.ts test/IdentitySync.ts test/PropertyNavOracle.ts test/PropertyTokenSnapshot.ts test/ListingEscrowRefund.ts`.

## Exports

**Config (resolved at import):** `NETWORK`, `CHAIN_ID`, `CURRENCY`, `RPC_URL`,
`BLOCK_EXPLORER_URL`, `CONTRACTS`, `Deployment`, `USDC_ADDRESS`.

**ABIs:** `ABIS` (`IdentityRegistry`, `Compliance`, `USDC`, `DividendVault`,
`PropertyFactory`, `PropertyToken`, `ListingEscrow`, `IdentitySyncSender`,
`PropertyNavConsumer`), plus `ListingEscrowAbi` and `ErrorStringAbi`.

**Contract helpers.** Singletons read their address from the active deployment
and take just a runner: `getIdentityRegistryContract`, `getComplianceContract`,
`getUSDCContract`, `getDividendVaultContract`, `getPropertyFactoryContract`.
Per-listing / per-chain contracts take an explicit address:
`getPropertyTokenContract(address, runner)` (alias `getTokenContract`),
`getEscrowContract(address, runner)`,
`getIdentitySyncSenderContract(address, runner)`,
`getPropertyNavConsumerContract(address, runner)`.

Full artifacts (ABI + bytecode) for backend deployment are exported as
`IdentityRegistryArtifact`, `TokenComplianceArtifact`, `IdentitySyncSenderArtifact`,
and `PropertyNavConsumerArtifact`.

## License

MIT, except `src/ccip/CompliantPropertyTokenPool.sol` (BUSL-1.1). Vendored
Chainlink keystone interfaces under `src/oracle/keystone/` are MIT.
