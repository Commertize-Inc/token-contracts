# Commertize

## Overview

Commertize is a premium real estate investment platform that bridges traditional finance and DeFi by enabling tokenized property investments. The platform consists of a public landing page and a secure investor dashboard with KYC/IDV verification powered by Plaid and Privy authentication.

**Core Purpose**: Democratize access to premium real estate investments through blockchain technology, offering fractional ownership, liquidity, and diversification to investors while providing capital and tokenization solutions for property sponsors.

**Target Audience**:
- **Investors**: Seeking fractional ownership and diversified real estate portfolios
- **Sponsors**: Real estate owners looking for capital and tokenization services
- **Admins**: Platform managers overseeing compliance and operations

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

The project uses **pnpm workspaces** to manage a monorepo with the following structure:

- **apps/landing**: Public-facing marketing website (Next.js 16, React 19)
- **apps/dashboard**: Authenticated investor dashboard (Next.js 16, React 19)
- **packages/ui**: Shared UI component library
- **packages/utils**: Shared utilities (environment variable loading, monorepo helpers)

**Design Rationale**: The monorepo approach enables code sharing between apps while maintaining deployment independence. Shared components in `@commertize/ui` ensure consistent branding across landing and dashboard experiences.

### Frontend Architecture

**Framework**: Next.js 16 with App Router and React 19

**Styling Strategy**:
- CSS Modules for component-level styling with scoped classes
- Tailwind CSS for utility-first responsive layouts
- Design system based on Material 3 principles with custom Commertize Gold palette
- CSS custom properties (CSS variables) for theming consistency

**Component Library**: `@commertize/ui` package provides reusable components:
- **Button**: Multiple variants (primary, secondary, outlined, text)
- **Chip**: Active/inactive state indicators
- **Logo**: Brand logo with theme support
- **Navbar**: Navigation with auth integration

**Design Philosophy**: Premium, trustworthy aesthetic using glassmorphism, subtle animations, and clean data presentation. The color palette centers on Commertize Gold (`#C59B26`) combined with neutral slate tones.

### Authentication & Authorization

**Primary Provider**: Privy (`@privy-io/react-auth` and `@privy-io/server-auth`)

**Login Methods**:
- Email authentication
- Wallet connection (Web3)
- Google OAuth

**Features**:
- Embedded wallet creation on login for users without wallets
- Password protection for wallet creation
- Custom branding (logo, accent color)

**Implementation**:
- Client-side: `PrivyProvider` wraps the dashboard app
- Server-side: `privyClient` verifies auth tokens in API routes
- Auth token stored in `privy-token` cookie
- `AuthGuard` component redirects unauthenticated users to `/auth` page

**Design Choice**: Privy was selected for its dual support of traditional email login and Web3 wallet connectivity, aligning with the platform's goal to bridge TradFi and DeFi.

### Database Layer

**ORM**: MikroORM v6 with PostgreSQL driver

**Database**: PostgreSQL (NeonDB recommended for managed hosting with SSL support)

**Entity Management**:
- Decorator-based entity definitions using `reflect-metadata`
- Automatic migrations via MikroORM CLI
- Connection pooling and SSL configuration for production

**User Entity Schema**:
```typescript
User {
  id: UUID (primary key)
  privyId: string (unique identifier from Privy)
  email?: string
  walletAddress?: string
  plaidAccessToken?: string
  plaidItemId?: string
  plaidIdvSessionId?: string
  isKycd: boolean (KYC completion status)
  kycCompletedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

**Request Context Pattern**: Uses `RequestContext.create()` and `em.fork()` to ensure proper EntityManager isolation per request, preventing state leakage in serverless environments.

**Design Rationale**: MikroORM provides TypeScript-first development with strong type safety, automatic migrations, and excellent PostgreSQL support. The User entity is designed to integrate Privy authentication with Plaid KYC data.

### KYC/Identity Verification

**Provider**: Plaid Identity Verification

**Flow**:
1. User logs in via Privy
2. Dashboard checks KYC status via `/api/kyc/status`
3. If not KYC'd, redirects to `/kyc` page
4. Creates Plaid Link token with IDV template
5. User completes identity verification through Plaid Link
6. On success, updates `User.isKycd = true` in database
7. Grants access to full dashboard features

**Integration Points**:
- `/api/plaid/create_link_token`: Generates Link token for IDV flow
- `/api/plaid/check_idv_status`: Verifies completion status
- `/api/kyc/submit`: Marks user as KYC-verified

**Environment-Based Configuration**: Supports sandbox, development, and production Plaid environments via `PLAID_ENV` variable.

**Design Choice**: Plaid IDV provides institutional-grade identity verification required for financial services compliance, with minimal user friction through their pre-built Link UI.

### Environment Variable Management

**Development Strategy**: Root-level `.env.development` file (tracked in git) provides centralized configuration for all apps during local development.

**Production Strategy**: App-specific `.env.production` files (gitignored) enable isolated deployments with minimal attack surface.

**Loading Mechanism**: `@commertize/utils` package exports `loadEnv()` function that:
- Locates monorepo root by finding `pnpm-workspace.yaml`
- Loads environment file with `dotenv`
- Expands interpolated variables with `dotenv-expand`

**Design Rationale**: This dual-environment approach balances developer experience (single source of truth in dev) with security best practices (isolated secrets in production).

### Role-Based Dashboard Architecture

**User Roles**:
- **Investor**: View portfolio, browse marketplace, manage investments
- **Sponsor**: List properties, manage fundraising, review applications
- **Admin**: Platform management, user approvals, compliance oversight

**Routing Structure**:
```
/dashboard → Role-based redirect
/dashboard/investor/* → Investor views
/dashboard/sponsor/* → Sponsor views
/dashboard/admin/* → Admin views
```

**Shared Components**:
- Sidebar navigation (role-based menu items)
- Header with wallet connect and notifications
- Glassmorphic cards for data display
- Sortable/filterable data tables

**State Management**: Currently using React hooks and client-side state. Future consideration for global state library if complexity increases.

## External Dependencies

### Third-Party Services

**Privy** (Authentication & Wallet Management)
- App ID and Secret required
- Dashboard: https://dashboard.privy.io/
- Provides email auth, Web3 wallet connection, and embedded wallet creation

**Plaid** (Identity Verification & KYC)
- Client ID, Secret, and IDV Template ID required
- Dashboard: https://dashboard.plaid.com/
- Environment selection: sandbox, development, production
- Used for regulatory compliance and investor accreditation verification

**NeonDB** (PostgreSQL Database)
- Managed PostgreSQL with serverless scaling
- Console: https://console.neon.tech/
- SSL connection required (`sslmode=require`)
- Connection string format: `postgresql://user:password@host/database?sslmode=require`

### NPM Packages

**Core Framework**:
- `next@16.0.3`: React framework with App Router
- `react@19.2.0`: UI library
- `typescript@^5`: Type safety

**Authentication**:
- `@privy-io/react-auth@^1.94.3`: Client-side auth
- `@privy-io/server-auth@^1.17.0`: Server-side verification

**Database**:
- `@mikro-orm/core@^6.6.0`: ORM core
- `@mikro-orm/postgresql@^6.6.0`: PostgreSQL driver
- `@mikro-orm/migrations@^6.4.3`: Migration management
- `pg@^8.16.3`: PostgreSQL client

**KYC Integration**:
- `plaid@^39.1.0`: Plaid API client
- `react-plaid-link@^4.1.1`: Plaid Link component

**UI & Styling**:
- `tailwindcss@^3.4.17`: Utility-first CSS
- `lucide-react@^0.554.0`: Icon library
- `clsx@^2.1.1` + `tailwind-merge@^3.4.0`: Class name utilities

**Utilities**:
- `dotenv@^17.2.3` + `dotenv-expand@^12.0.3`: Environment variables
- `uuid@^11.0.3`: ID generation
- `reflect-metadata@^0.2.2`: Decorator support

### Configuration Requirements

**Required Environment Variables (Dashboard)**:
```
NEXT_PUBLIC_PRIVY_APP_ID=<from Privy dashboard>
NEXT_PUBLIC_PRIVY_CLIENT_ID=<from Privy dashboard>
PRIVY_APP_SECRET=<from Privy dashboard>
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
PLAID_CLIENT_ID=<from Plaid dashboard>
PLAID_SECRET=<from Plaid dashboard>
PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID=<from Plaid IDV setup>
PLAID_ENV=sandbox|development|production
```

**Database Migrations**:
Initial setup requires running `npx mikro-orm migration:up` from `apps/dashboard` to create the User table and indexes.