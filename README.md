# @commertize/nexus

Commertize smart contracts for real estate tokenization, debt instruments, and mortgage lending.

## Installation

```bash
pnpm add @commertize/nexus
```

## Usage

### Default: Shared Hedera Testnet

By default, all developers use the shared Hedera testnet deployment. No setup required!

```typescript
import { getContractAddress, getContracts, ABIS } from "@commertize/nexus";

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
import { getContractAddress } from "@commertize/nexus";

const identityRegistry = getContractAddress("IdentityRegistry", "mainnet");
```

### Available Networks

- **`testnet`** (default) - Shared Hedera testnet for all developers
- **`mainnet`** - Hedera mainnet for production
- **`localhost`** - Local development network

## Environment Variables

### Network Selection

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

### Optional Configuration

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
import { ABIS } from "@commertize/nexus";

// Available ABIs:
// - ABIS.IdentityRegistry
// - ABIS.Compliance
// - ABIS.USDC
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

## License

MIT
