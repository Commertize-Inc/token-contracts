# Quick Start

## Prerequisites

You need:

- **Privy App ID and Secret** from https://dashboard.privy.io/
- **NeonDB connection string** from https://console.neon.tech/

## Setup in 3 Steps

### 1. Install

```bash
pnpm install
```

### 2. Configure Dashboard

Create `apps/dashboard/.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_app_id_here
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id_here
PRIVY_APP_SECRET=your_secret_here
DATABASE_URL=postgresql://user:pass@host/commertize?sslmode=require
DATABASE_NAME=commertize
```

### 3. Initialize Database

```bash
cd apps/dashboard
npx mikro-orm migration:create --initial
npx mikro-orm migration:up
cd ../..
```

## Run

```bash
# Terminal 1 - Landing page (http://localhost:3000)
pnpm dev:landing

# Terminal 2 - Dashboard (http://localhost:3001)
pnpm dev:dashboard
```

## Test

1. Visit http://localhost:3000
2. Click "Sign In"
3. Authenticate with Privy
4. Complete KYC
5. Access dashboard

## What You've Built

✅ Monorepo with pnpm workspaces
✅ Landing page at port 3000
✅ Dashboard at port 3001
✅ Privy authentication (email + wallet)
✅ NeonDB with MikroORM
✅ KYC verification flow
✅ User management

## Next Steps

See `SETUP_GUIDE.md` for detailed documentation.
See `MONOREPO_SETUP.md` for architecture details.
