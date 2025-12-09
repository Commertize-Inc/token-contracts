# Environment Setup Guide

Commertize uses a **cascading environment variable system** to manage configuration across different stages (dev, preview, prod) and applications.

## How it Works

Environment variables are loaded in this order (last one wins):

1.  `.env` (Root - shared defaults)
2.  `.env.production` / `.env.development` (Root - stage specific)
3.  `apps/*/env` (App specific - if configured)
4.  `apps/*/.env.local` (App specific - local overrides, **gitignored**)

## Setup for Development

### 1. Root Configuration

Create a `.env` in the root directory for shared keys like public URLs.

```env
# Root .env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Dashboard Configuration

The dashboard requires sensitive keys (Database, Auth, Payments).

Create `apps/dashboard/.env.local`:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/commertize

# Auth (Privy)
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_PRIVY_CLIENT_ID=
PRIVY_APP_SECRET=

# Payments (Stripe/Plaid)
STRIPE_SECRET_KEY=
PLAID_CLIENT_ID=
PLAID_SECRET=
```

### 3. Landing Configuration

Create `apps/landing/.env.local` if you need specific overrides, though usually the root `.env` suffices for the static site.

## Best Practices

-   **Never commit `.env.local`**, `.env.development.local`, etc.
-   **Naming**: Prefix client-side variables with `NEXT_PUBLIC_`.
-   **Type Safety**: Use our strict env parser in `packages/utils/env.ts` (if available) to ensure variables exist at runtime.
