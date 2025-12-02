# Commertize

A premium real estate investment platform bridging traditional finance and DeFi.

## Overview

Commertize is a monorepo built with Next.js 16, featuring a public landing page and a secure investor dashboard with KYC verification.

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Authentication**: Privy (Email + Wallet)
- **Database**: PostgreSQL (NeonDB) with MikroORM
- **Styling**: Tailwind CSS, CSS Modules
- **Monorepo**: pnpm workspaces
- **Shared UI**: `@commertize/ui` package

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database (NeonDB recommended)
- Privy account ([Get one here](https://dashboard.privy.io/))

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables (cascading configuration)
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
cd apps/dashboard && pnpm mikro-orm migration:up && cd ../..

# Start development servers
pnpm dev
```

Visit:
- Landing page: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3001](http://localhost:3001)

## Configuration

### Environment Variables (Cascading Setup)

Commertize uses a **cascading environment variable system**:
1. **Root `.env`** - Shared configuration for all apps
2. **App-specific `.env`** (optional) - Override specific values per app

#### Quick Setup

```bash
# 1. Copy root template
cp .env.example .env

# 2. Edit with your values
nano .env

# 3. (Optional) Create app-specific overrides
cd apps/dashboard
cp .env.example .env
# Edit with dashboard-specific values
```

#### Root `.env` (Shared)

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# API Keys (shared)
OPENAI_API_KEY=sk-your-key-here

# App URLs
DASHBOARD_URL=http://localhost:3001
LANDING_URL=http://localhost:3000
```

#### `apps/dashboard/.env` (Optional Overrides)

```env
# Privy Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Plaid Integration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
```

**📚 Detailed Documentation:**
- [Quick Reference](ENV_QUICK_REFERENCE.md) - Common scenarios and troubleshooting
- [Complete Guide](ENV_SETUP.md) - Full documentation with examples
- [Implementation Summary](ENV_IMPLEMENTATION_SUMMARY.md) - What was implemented and how it works

## Project Structure

```
commertize.com/
├── apps/
│   ├── landing/          # Public landing page (Next.js)
│   └── dashboard/        # Investor dashboard with auth (Next.js)
├── packages/
│   └── ui/              # Shared UI components (Button, Chip, Logo)
├── docs/                # Additional documentation
│   └── branding/        # Brand guidelines and assets
└── pnpm-workspace.yaml
```

## Features

### Landing Page (`apps/landing`)
- Premium real estate showcase
- Property listings with investment details
- SEO-optimized static pages
- Responsive design with brand-consistent UI

### Dashboard (`apps/dashboard`)
- **Authentication**: Privy-powered email/wallet login
- **Auth Guard**: Automatic redirect to `/auth` when not authenticated
- **KYC Verification**: Required before accessing investment features
- **User Management**: PostgreSQL database with MikroORM
- **Session Management**: Secure logout with session invalidation
- **Shared Components**: Uses `@commertize/ui` for consistent branding

### Shared UI Package (`packages/ui`)
- **Button**: Multiple variants (primary, secondary, outlined, text)
- **Chip**: Active/inactive states
- **Logo**: Light/dark theme support
- Reusable across all apps with consistent styling

## Development

### Running Apps

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm dev:landing    # Landing page only
pnpm dev:dashboard  # Dashboard only
```

### Working with Shared UI

Import components from `@commertize/ui`:

```tsx
import { Logo, Button, Chip } from "@commertize/ui";

<Logo theme="dark" />
<Button variant="primary">Invest Now</Button>
<Chip active>New</Chip>
```

### Database Migrations

```bash
cd apps/dashboard

# Create migration
pnpm mikro-orm migration:create

# Run migrations
pnpm mikro-orm migration:up

# Rollback migration
pnpm mikro-orm migration:down
```

### Package Management

```bash
# Add dependency to specific app
pnpm --filter @commertize/dashboard add package-name

# Add dev dependency to root
pnpm add -D -w package-name

# Update all dependencies
pnpm update -r
```

## Architecture

### Authentication Flow

1. User visits landing page → clicks "Sign In"
2. Redirects to dashboard `/auth` page
3. Privy authentication modal (email/wallet)
4. `AuthGuard` checks authentication status
5. System verifies KYC status from database
6. Non-KYC'd users redirected to `/kyc` flow
7. Authenticated + KYC'd users access dashboard

### Database Schema

#### User Entity
```typescript
{
  id: string (UUID)
  privyId: string
  email?: string
  walletAddress?: string
  isKycd: boolean
  kycCompletedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### API Routes

- `GET /api/kyc/status` - Check KYC status
- `POST /api/kyc/submit` - Submit KYC (demo implementation)

## Documentation

- [Quick Start Guide](QUICK_START.md) - Get up and running in 5 minutes
- [Environment Setup](ENV_SETUP.md) - Detailed configuration guide
- [Monorepo Architecture](MONOREPO_SETUP.md) - Deep dive into project structure
- [Brand Identity](docs/branding/brand_identity.md) - Colors, typography, design philosophy
- [Style Guide](docs/branding/style_guide.md) - UI component guidelines

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved
