# Commertize Monorepo

This is a monorepo setup for the Commertize platform using pnpm workspaces.

## Structure

```
commertize.com/
├── apps/
│   ├── landing/          # Landing page (Next.js)
│   └── dashboard/        # Dashboard app with Privy auth (Next.js)
├── packages/             # Shared packages (future)
│   ├── ui/              # Shared UI components
│   └── database/        # Database utilities
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL (NeonDB recommended)
- Privy account (for authentication)

### Installation

1. Install dependencies:

```bash
pnpm install
```

### Configuration

#### Dashboard Environment Variables

Create `/apps/dashboard/.env.local`:

```env
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
PRIVY_APP_SECRET=your_privy_app_secret

# NeonDB Configuration
DATABASE_URL=postgresql://user:password@your-neon-host/commertize?sslmode=require
DATABASE_NAME=commertize
```

### Database Setup

1. Create your NeonDB database
2. Update the `DATABASE_URL` in `/apps/dashboard/.env.local`
3. Run migrations:

```bash
cd apps/dashboard
pnpm mikro-orm migration:create
pnpm mikro-orm migration:up
```

### Running the Apps

#### Development Mode

Run all apps:
```bash
pnpm dev
```

Run landing page only:
```bash
pnpm dev:landing
```

Run dashboard only:
```bash
pnpm dev:dashboard
```

#### Ports

- Landing page: http://localhost:3000
- Dashboard: http://localhost:3001

## Architecture

### Landing Page

- Next.js 16 with App Router
- Static landing page with property listings
- Sign In button redirects to dashboard

### Dashboard

- Next.js 16 with App Router
- Privy authentication (email + wallet)
- MikroORM for database management
- NeonDB PostgreSQL database
- KYC verification flow

### Authentication Flow

1. User clicks "Sign In" on landing page
2. Redirects to dashboard (port 3001)
3. Privy authentication modal appears
4. User signs in with email or wallet
5. System checks KYC status from NeonDB
6. If not KYC'd, user is redirected to KYC flow
7. After KYC completion, user can access dashboard

### Database Schema

#### User Entity

```typescript
{
  id: string (uuid)
  privyId: string
  email?: string
  walletAddress?: string
  isKycd: boolean
  kycCompletedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## API Routes

### Dashboard API

- `GET /api/kyc/status` - Check user's KYC status
- `POST /api/kyc/submit` - Submit KYC verification (demo)

## Development

### Adding New Packages

```bash
# Add to specific workspace
pnpm --filter @commertize/dashboard add package-name

# Add to root (dev dependencies)
pnpm add -D -w package-name
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @commertize/landing build
```

## Future Enhancements

- [ ] Implement real KYC provider (Persona, Onfido, Jumio)
- [ ] Add portfolio management
- [ ] Add property marketplace
- [ ] Implement secondary market trading
- [ ] Add DeFi integrations (Hedera, Ethereum)
- [ ] Create shared UI component library
- [ ] Add templates package
- [ ] Add automation scripts

## Notes

- The dashboard runs on port 3001 to avoid conflicts with the landing page
- KYC flow is currently simplified for demo purposes
- Privy handles wallet creation and authentication
- MikroORM manages database schema and migrations
