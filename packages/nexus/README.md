# Commertize Smart Contracts (MVP)

This package contains the minimal viable set of smart contracts for the Commertize Real Estate Tokenization Platform.

## Architecture

The project is simplified into four core modules:

### 1. Core (`src/core/`)

Foundational assets for the ecosystem.

- **`CREUSD.sol`**: The platform stablecoin (Pegged to USD). Implements `ERC20Permit` for gasless transactions.
- **`CommertizeToken.sol`**: The platform governance and staking token (COMM). Captures yield from the protocol.

### 2. Compliance (`src/compliance/`)

Regulatory enforcement layer.

- **`IdentityRegistry.sol`**: A whitelist of verified wallet addresses and their country codes.
- **`TokenCompliance.sol`**: A transfer validation module used by Property Tokens to ensure only verified users can send/receive tokens.

### 3. Tokenization (`src/tokenization/`)

Real estate asset representation.

- **`PropertyToken.sol`**: An ERC-20 token representing fractional ownership of a property.
  - Enforces `Compliance` on every transfer.
  - Includes **Snapshots** to track balances for accurate dividend distribution.
- **`PropertyFactory.sol`**: A factory contract to deploy new Property Tokens efficiently.

### 4. Finance (`src/finance/`)

Economic flows and yield distribution.

- **`DividendVault.sol`**: The engine for distributing rental income.
  - Sponsors deposit rental income (in CREUSD).
  - The Vault takes a protocol fee (sent to Staking Pool).
  - The remaining amount is distributed pro-rata to Property Token holders based on a snapshot.
- **`StakingPool.sol`**: Manages the staking of COMM tokens to earn protocol fees.

---

## Usage

### Installation

```bash
pnpm install
```

### Compilation

```bash
pnpm compile
```

### Interactive Deployment

We provide an interactive CLI to deploy specific parts of the system or the entire stack.

```bash
pnpm deploy:testnet
# OR
npx hardhat run scripts/deploy.js --network hedera-testnet
```

Follow the on-screen prompts to select which contracts to deploy. The script will automatically handle dependencies (e.g., deploying IdentityRegistry before TokenCompliance).

### Address Configuration

Deployed addresses are automatically saved to `deployment.json`. This file is used by the frontend and backend to locate the contracts.

---

## Contract Interaction Flow

1.  **Onboarding**: User passes KYC off-chain -> Backend calls `IdentityRegistry.registerIdentity(user)`.
2.  **Listing**: Sponsor creates a listing -> Backend calls `PropertyFactory.deployProperty(...)`.
3.  **Investment**: User pays USDC -> Backend mints `PropertyToken` to User.
4.  **Dividends**:
    - Sponsor deposits CREUSD to `DividendVault`.
    - `PropertyToken` takes a snapshot.
    - Vault records the distribution.
    - Token Holders call `claim()` to receive their share.

## Licensing

Proprietary - Commertize Inc.
