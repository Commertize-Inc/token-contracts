# Chainlink Integration Debrief

## Summary

We evaluated Chainlink's Automated Compliance Engine (ACE) for the Commertize tokenized real estate platform. After investigation, we adopted ACE's identity and credential architecture patterns but implemented them from scratch — Chainlink has zero infrastructure on Arc (our home chain), and ACE's composable PolicyEngine is over-engineered for a single-chain RWA deployment.

This document records what was evaluated, what was adopted, what was rejected, and why.

## Timeline

1. **Initial evaluation** — Chainlink rep proposed ACE (IdentityRegistry, CredentialRegistry, PolicyEngine, ComplianceTokenERC3643) + CCIP to replace our custom compliance stack and LayerZero bridge.
2. **TDD written** — Full migration spec at `docs/tdd/ace_migration.md` covering contract-by-contract replacement, backend changes, dashboard changes.
3. **Arc blocker discovered** — Chainlink has no LINK token, no oracle network, no CCIP lanes, no Automation, no Data Feeds on Arc. ACE contracts are BUSL-1.1 licensed (production deployment requires Chainlink's grant).
4. **Pattern adoption** — Implemented ACE's identity/credential patterns from scratch. Initially built a full PolicyEngine with 4 policy contracts.
5. **Consolidation audit** — Audited the 18-contract stack against ERC-3643 production standards. Found 3 policy contracts duplicated state already on PropertyToken. Removed PolicyEngine indirection, inlined exempt/freeze/pause checks, kept only CredentialCheckPolicy as an external call.

## What We Evaluated

### ACE Core Components

| Component | Purpose | Verdict |
|---|---|---|
| **IdentityRegistry** | CCID-anchored identity, multi-wallet | **Adopted** — pattern implemented from scratch |
| **CredentialRegistry** | Typed credentials (KYC/AML/accreditation) with on-chain expiry | **Adopted** — pattern implemented from scratch |
| **PolicyEngine** | Composable N-policy orchestrator per function selector | **Rejected** — over-engineered for single-chain; 53% gas overhead vs inline checks |
| **ComplianceTokenERC3643** | Freeze, partial freeze, forced transfer, pause, batch ops | **Adopted** — features added directly to PropertyToken |
| **BypassPolicy** | Exempt address bypass via external contract | **Rejected** — a simple mapping belongs on the token, not in a separate contract |
| **PausePolicy** | Per-token global pause via external contract | **Rejected** — duplicates OpenZeppelin Pausable already inherited by PropertyToken |
| **FreezePolicy** | Reads freeze state back from token via external calls | **Rejected** — the token owns the freeze state; reading it back externally is wasteful |
| **CredentialCheckPolicy** | Validates KYC/AML credentials for transfer participants | **Adopted** — legitimate external complexity across IdentityRegistry + CredentialRegistry |

### Other Chainlink Products

| Product | Relevance to Commertize | Verdict |
|---|---|---|
| **CCIP** | Cross-chain token bridging | **Not viable** — no CCIP lanes on Arc; single-chain deployment |
| **Proof of Reserve** | On-chain attestation that property backing exists | **Interesting but unavailable** — no oracle network on Arc |
| **Automation (Keepers)** | Decentralized cron for credential expiry, escrow deadlines | **Not viable** — no Automation on Arc |
| **Data Feeds** | Price oracles for property NAV | **Not viable** — no feeds on Arc |
| **Functions** | Serverless compute for on-chain Plaid verification | **Not viable** — no CRE runtime on Arc |

## What We Adopted

### CCID Identity Model

From ACE's Cross-Chain Identity framework. Each investor gets a deterministic `bytes32` anchor derived from their Privy ID: `keccak256(abi.encodePacked("commertize", privyId))`. One CCID maps to up to 10 wallet addresses.

**Why:** Decouples identity from wallet address. Enables wallet recovery and multi-wallet portfolios without re-verification.

**Contract:** `src/compliance/IdentityRegistry.sol`

### Typed Credentials with Expiry

From ACE's CredentialRegistry. Four credential types (KYC, AML, accreditation, residency) with on-chain `expiresAt` timestamps. Backend registers credentials after off-chain verification via Plaid IDV.

**Why:** The old `isVerified(address) → bool` had no granularity — no credential types, no expiry, no revocation. Real estate compliance requires time-bounded KYC that can lapse independently of identity registration.

**Contract:** `src/compliance/CredentialRegistry.sol`

### ERC-3643 Token Controls

From ACE's ComplianceTokenERC3643. Freeze (full and partial), forced transfer, pause, batch operations — all standard regulatory controls for securities tokens.

**Why:** Required for regulatory compliance. Freeze enables sanctions enforcement. Forced transfer enables court-ordered asset recovery. Pause provides an emergency circuit breaker.

**Contract:** `src/tokenization/PropertyToken.sol`

## What We Rejected

### Composable PolicyEngine

ACE's PolicyEngine attaches up to 8 policies per (token, function selector) pair, each invoked via external `STATICCALL`. We initially implemented this pattern, then removed it after an audit revealed:

1. **BypassPolicy** stored a `mapping(address => mapping(address => bool))` that PropertyToken could hold as a simple `_exempt` mapping. External call cost: ~5,200 gas/transfer. Inline cost: ~100 gas.
2. **PausePolicy** stored a `mapping(address => bool)` that duplicated OZ Pausable already on PropertyToken. Pure redundancy.
3. **FreezePolicy** was stateless — it read `isFrozen()` and `getFrozenTokens()` back from PropertyToken via external calls, then checked the values. The token already owns this state; the external round-trip added ~5,200 gas for zero value.
4. After removing 3 of 4 policies, the PolicyEngine was orchestrating a single CredentialCheckPolicy — an unnecessary hop.

**Result:** Removed 6 contracts (PolicyEngine, BypassPolicy, PausePolicy, FreezePolicy, IPolicy, IPolicyEngine). PropertyToken calls CredentialCheckPolicy directly. Gas overhead reduced 53%.

### Chainlink Infrastructure on Arc (UPDATED 2026-04-14)

Arc is a Circle L1 with USDC-native gas. **Chainlink has since deployed infrastructure on Arc testnet:**

| Service | Status |
|---|---|
| **CCIP** | Live — Arc ↔ Ethereum Sepolia lane. Router: `0xdE4E7FED43FAC37EB21aA0643d9852f75332eab8` |
| **LINK Token** | Deployed at `0x3F1f176e347235858DD6Db905DDBA09Eaf25478a`. Faucet: `faucets.chain.link/arc-testnet` |
| **WUSDC** | `0xbf4B839A7939a52acbF8fC52D5Bd5BFE69a064EA` (wrapped USDC for CCIP fees) |
| **Data Streams** | Available (added April 12, 2026). Pull-based crypto price feeds. |
| **CRE** | Available (CLI v1.0.7+, Go SDK v1.1.4+, TS SDK v1.3.1+) |
| Data Feeds (push) | Not available |
| Automation | Not available |
| Functions | Not available |
| VRF | Not available |

This reopens the CCIP cross-chain path and potentially native ACE deployment (CRE is the runtime prerequisite). See `docs/ccip-bridge.md` for the PropertyToken bridging design.

### BUSL-1.1 License

ACE contracts are licensed under Business Source License 1.1. The CCIP and Registry modules convert to MIT on May 23, 2027; Workflows and Registry modules on April 25, 2029. Production deployment during the restriction period requires Chainlink's explicit grant.

## Current Architecture

```
PropertyToken._update(from, to, value)
  │
  ├─ Burns: skip all checks
  │
  ├─ Exempt? (inline SLOAD, ~100 gas)
  │   └─ yes → skip remaining checks
  │
  ├─ Frozen? (inline SLOAD, ~200 gas)
  │   ├─ full freeze → revert
  │   └─ partial freeze → check transferable balance
  │
  └─ Credentials valid? (single external call, ~10,400 gas)
      └─ CredentialCheckPolicy.check()
          ├─ IdentityRegistry.getIdentity() → CCID
          └─ CredentialRegistry.hasValidCredential(CCID, KYC/AML)
```

### Contract Inventory

| Contract | LOC | Purpose |
|---|---|---|
| `IdentityRegistry` | 124 | CCID → wallet mapping, multi-wallet, REGISTRAR_ROLE |
| `CredentialRegistry` | 147 | Typed credentials with expiry, ISSUER_ROLE |
| `CredentialCheckPolicy` | 78 | Validates KYC + AML for transfer participants |
| `PropertyToken` | 293 | ERC20 + Permit + Snapshot + Vault + inline compliance + ERC-3643 controls |
| `PropertyFactory` | 83 | Deploys PropertyToken + ListingEscrow pairs |
| `ListingEscrow` | 416 | Escrow with KYC pre-check, proportional token distribution |
| `DividendVault` | 290 | Snapshot-based dividend distribution |
| `StakingPool` | 20 | Placeholder |
| `CommertizeToken` | 40 | Governance token (ERC20 + Votes) |

## Future: If Chainlink Adds Arc Support

Migration to native ACE would be a deployment-level change, not architectural:

1. Deploy ACE's IdentityRegistry — migrate CCIDs (same `bytes32` format)
2. Deploy ACE's CredentialRegistry — migrate credentials (same type IDs)
3. Optionally deploy ACE's PolicyEngine for composable rules
4. Swap PropertyToken base class to ComplianceTokenERC3643 (retain snapshot + vault extensions)

Our `IIdentityRegistry` and `ICredentialRegistry` interfaces mirror ACE's closely enough that the CredentialCheckPolicy would work with either backend.

## References

- [Chainlink ACE](https://github.com/smartcontractkit/chainlink-ace) — source repo
- [ACE Technical Overview](https://blog.chain.link/automated-compliance-engine-technical-overview/)
- [ERC-3643 Standard](https://www.erc3643.org/) — T-REX permissioned token framework
- `docs/tdd/ace_migration.md` — full migration TDD (DEFERRED status)
