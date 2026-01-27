# @commertize/token-contracts

Commertize smart contracts for real estate tokenization, debt instruments, and mortgage lending.

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Onchain Architecture](#onchain-architecture)
  - [System Overview](#system-overview)
  - [Contract Categories](#contract-categories)
  - [Data Flow](#data-flow)
  - [Security Model](#security-model)
- [Usage](#usage)
- [Development](#development)
- [API Reference](#api-reference)

## Installation

```bash
pnpm add @commertize/token-contracts
```

## Quick Start

### Default: Shared Hedera Testnet

By default, all developers use the shared Hedera testnet deployment. No setup required!

```typescript
import { getContractAddress, getContracts, ABIS } from "@commertize/token-contracts";

// Get a specific contract address
const identityRegistry = getContractAddress("IdentityRegistry");

// Get all contract addresses
const contracts = getContracts();

// Use with ethers.js
import { ethers } from "ethers";
const contract = new ethers.Contract(
	contracts.IdentityRegistry,
	ABIS.IdentityRegistry,
	provider
);
```

### Local Development (Optional)

Want to test against your own local deployment? Easy!

1. **Start a local Hardhat node:**
   ```bash
   pnpm node
   ```

2. **Deploy contracts locally:**
   ```bash
   pnpm deploy:localhost
   ```

3. **Use local deployment:**
   This creates `deployment.localhost.json` which automatically takes precedence over the shared testnet.

4. **Revert to testnet:**
   ```bash
   rm deployment.localhost.json
   ```

### Production: Hedera Mainnet

For production applications:

```typescript
import { getContractAddress } from "@commertize/token-contracts";

const identityRegistry = getContractAddress("IdentityRegistry", "mainnet");
```

### Available Networks

- **`testnet`** (default) - Shared Hedera testnet for all developers
- **`mainnet`** - Hedera mainnet for production
- **`localhost`** - Local development network

## Onchain Architecture

### System Overview

The Commertize onchain system is built on Hedera EVM and consists of three main layers:

1. **Compliance Layer** - Identity verification and transfer controls
2. **Tokenization Layer** - Property token creation and management
3. **Finance Layer** - Escrow, dividends, and staking

```
┌─────────────────────────────────────────────────────────┐
│                    COMPLIANCE LAYER                       │
│  IdentityRegistry → TokenCompliance → PropertyToken     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  TOKENIZATION LAYER                      │
│  PropertyFactory → PropertyToken → ListingEscrow        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     FINANCE LAYER                         │
│  DividendVault → StakingPool → CREUSD                    │
└─────────────────────────────────────────────────────────┘
```

### Contract Categories

#### 1. Compliance Contracts

**IdentityRegistry** (`src/compliance/IdentityRegistry.sol`)
- **Purpose**: Maintains a whitelist of verified investor addresses
- **Key Features**:
  - Stores identity data (country code, verification status, identity hash)
  - Owner-controlled registration/removal
  - ISO 3166-1 country code support
- **Usage**: All token transfers require both sender and receiver to be verified

**TokenCompliance** (`src/compliance/TokenCompliance.sol`)
- **Purpose**: Enforces transfer restrictions based on identity verification
- **Key Features**:
  - Checks `IdentityRegistry` before allowing transfers
  - Supports exemption list for special addresses (contracts, etc.)
  - Integrated with `PropertyToken` via `_update` hook
- **Usage**: Prevents unverified users from receiving tokens

#### 2. Core Token Contracts

**PropertyToken** (`src/tokenization/PropertyToken.sol`)
- **Purpose**: ERC-20 token representing fractional ownership of a property
- **Key Features**:
  - ERC-20 with Permit (gasless approvals)
  - Snapshot mechanism for dividend distribution
  - Compliance integration (transfers blocked if not verified)
  - Owner-controlled snapshots
- **Standards**: ERC-20, ERC-2612 (Permit)

**CommertizeToken (CTZ)** (`src/core/CommertizeToken.sol`)
- **Purpose**: Platform governance and utility token
- **Key Features**:
  - ERC-20Votes for governance
  - ERC-2612 Permit support
  - 100M initial supply
- **Standards**: ERC-20, ERC-2612, ERC-5805 (Votes)

**CREUSD** (`src/core/CREUSD.sol`)
- **Purpose**: Platform stablecoin for payments and dividends
- **Key Features**:
  - ERC-20 with Permit
  - Faucet for testnet (24h cooldown)
  - 1B max supply, 6 decimals
  - Owner-controlled minting
- **Standards**: ERC-20, ERC-2612

#### 3. Tokenization Contracts

**PropertyFactory** (`src/tokenization/PropertyFactory.sol`)
- **Purpose**: Factory for deploying new property tokens and escrows
- **Key Features**:
  - Deploys `PropertyToken` instances
  - Deploys `ListingEscrow` for fundraising
  - Registry of all deployed properties
- **Usage**: Single entry point for creating new property listings

**ListingEscrow** (`src/finance/ListingEscrow.sol`)
- **Purpose**: Holds property tokens and investor funds until funding goal is met
- **Key Features**:
  - Time-bound fundraising (deadline)
  - Target raise amount
  - Automatic finalization when goal met
  - Refund mechanism if goal not met
  - Admin-controlled token distribution
- **Security**: ReentrancyGuard, Pausable, minimum deposit protection

#### 4. Finance Contracts

**DividendVault** (`src/finance/DividendVault.sol`)
- **Purpose**: Distributes property income to token holders based on snapshots
- **Key Features**:
  - Snapshot-based distribution (prevents front-running)
  - Protocol fee (default 1%, configurable)
  - Batch claiming support
  - Unclaimed dividend recovery after 1 year
  - Pausable for emergencies
- **Security**: ReentrancyGuard, snapshot-first design

**StakingPool** (`src/finance/StakingPool.sol`)
- **Purpose**: Staking mechanism for CTZ tokens (MVP placeholder)
- **Status**: Simplified implementation, ready for expansion

### Data Flow

#### Property Listing Flow

```
1. Sponsor creates listing (off-chain)
   ↓
2. PropertyFactory.deployProperty()
   → Creates PropertyToken
   → Links to TokenCompliance
   ↓
3. PropertyFactory.deployEscrow()
   → Creates ListingEscrow
   → Holds PropertyToken
   → Sets target raise & deadline
   ↓
4. Investors deposit funds
   → ListingEscrow.deposit()
   → Funds locked until goal met
   ↓
5. Goal reached or deadline passed
   → ListingEscrow.finalize()
   → PropertyTokens distributed to investors
   → Funds sent to sponsor
```

#### Dividend Distribution Flow

```
1. Property generates income (off-chain)
   ↓
2. Sponsor deposits CREUSD
   → DividendVault.depositDividend(property, amount)
   ↓
3. Snapshot taken FIRST (prevents front-running)
   → PropertyToken.snapshot()
   → Records balances at this moment
   ↓
4. Protocol fee deducted
   → Fee sent to protocol wallet
   ↓
5. Distribution recorded
   → Linked to snapshot ID
   → Available for claiming
   ↓
6. Token holders claim dividends
   → DividendVault.claim(property, distributionId)
   → Pro-rata share based on snapshot balance
```

#### Identity Verification Flow

```
1. User completes KYC (off-chain)
   ↓
2. Backend verifies identity
   ↓
3. Backend calls IdentityRegistry
   → IdentityRegistry.registerIdentity(user, country, hash)
   ↓
4. User can now receive PropertyTokens
   → TokenCompliance checks IdentityRegistry
   → Transfer allowed if verified
```

### Security Model

#### Access Control

- **Owner Pattern**: Most contracts use OpenZeppelin's `Ownable`
- **Admin Pattern**: `ListingEscrow` has separate admin role for operations
- **Exemptions**: `TokenCompliance` supports exemption list for contracts

#### Transfer Restrictions

1. **Identity Verification**: Both sender and receiver must be verified
2. **Compliance Check**: `TokenCompliance.canTransfer()` called on every transfer
3. **Exemptions**: Special addresses (contracts, vaults) can be exempted

#### Reentrancy Protection

- `ListingEscrow`: Uses `ReentrancyGuard` on deposit/finalize
- `DividendVault`: Uses `ReentrancyGuard` on claim operations

#### Front-Running Prevention

- **DividendVault**: Takes snapshot BEFORE accepting funds
- **ListingEscrow**: Uses deadline-based finalization

#### Pausability

- `ListingEscrow`: Can be paused by owner
- `DividendVault`: Can be paused by owner
- Emergency stop mechanism for critical issues

## Usage

### Environment Variables

#### Network Selection

Control which blockchain network your app connects to:

```bash
# For backend (apps/backend/.env)
EVM_NETWORK=testnet

# For dashboard (apps/dashboard/.env)
VITE_EVM_NETWORK=testnet
```

**Available Networks:**

- `localhost` - Local Hardhat node (for development)
- `testnet` - Hedera testnet (default, shared across all developers)
- `mainnet` - Hedera mainnet (production)

The network setting automatically determines:

- ✅ Which contract addresses to use
- ✅ Which RPC endpoint to connect to
- ✅ Which deployed version of the smart contracts

#### Optional Configuration

```bash
# Override default network
DEPLOYMENT_NETWORK=mainnet

# Override RPC URL
RPC_URL=https://mainnet.hashio.io/api

# Provide deployment as JSON (for CI/CD)
DEPLOYMENT_JSON='{"contracts":{"IdentityRegistry":"0x..."},...}'
```

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Setup

```bash
pnpm install
pnpm hardhat compile
```

### Deploy to Testnet

```bash
pnpm deploy:testnet
```

This creates `deployment.testnet.json` with the deployed contract addresses.

### Deploy to Mainnet

Only deploy to mainnet via tagged releases:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The GitHub Actions workflow will automatically:

1. Deploy contracts to Hedera mainnet
2. Create `deployment.mainnet.json`
3. Commit the deployment file to the repository
4. Create a GitHub release with attached artifacts

## Contract ABIs

All contract ABIs are available via the `ABIS` export:

```typescript
import { ABIS } from "@commertize/token-contracts";

// Available ABIs:
// - ABIS.IdentityRegistry
// - ABIS.Compliance (TokenCompliance)
// - ABIS.USDC (CREUSD)
// - ABIS.CommertizeToken
// - ABIS.DividendVault
// - ABIS.StakingPool
// - ABIS.PropertyFactory
// - ABIS.PropertyToken
// - ABIS.ListingEscrow
```

## API Reference

### `getDeployment(network?: string): DeploymentData | null`

Load deployment configuration for a specific network.

```typescript
const deployment = getDeployment("testnet");
console.log(deployment.network.chainId); // 296
```

### `getContractAddress(contractName: string, network?: string): string | null`

Get a specific contract address.

```typescript
const address = getContractAddress("IdentityRegistry", "mainnet");
```

### `getContracts(network?: string): Record<string, string>`

Get all contract addresses.

```typescript
const contracts = getContracts("testnet");
```

### `getNetwork(network?: string)`

Get network information.

```typescript
const network = getNetwork("testnet");
// { name: 'testnet', chainId: 296, rpc: '...', currency: 'HBAR' }
```

### Helper Functions

The package also exports helper functions for creating contract instances:

```typescript
import { 
  getIdentityRegistryContract,
  getComplianceContract,
  getUSDCContract,
  getCommertizeTokenContract,
  getDividendVaultContract,
  getPropertyFactoryContract,
  getPropertyTokenContract,
  getEscrowContract
} from "@commertize/token-contracts";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const identityRegistry = getIdentityRegistryContract(provider);
```

## How It Works

The package uses a priority-based deployment loading system:

1. **Environment variable** (`DEPLOYMENT_JSON`) - for CI/CD
2. **`deployment.localhost.json`** - for local development
3. **`deployment.{network}.json`** - for specified network
4. **`deployment.testnet.json`** - default fallback

This means:

- ✅ New developers get shared testnet contracts immediately
- ✅ Optional local deployments don't interfere with others
- ✅ Production builds use committed mainnet addresses
- ✅ No configuration required for most use cases

## Contract Addresses

Current deployments are stored in:
- `deployment.testnet.json` - Hedera testnet (shared)
- `deployment.mainnet.json` - Hedera mainnet (production)

See these files for the latest contract addresses on each network.

## License

MIT
