# Deployment Guide

This repository contains a monorepo structure with three main deployable applications:

1.  `apps/landing-vite` (Vite SPA)
2.  `apps/dashboard-vite` (Vite SPA)
3.  `apps/backend` (Hono API)

## Database Migration

Before deploying, ensure database migrations are applied.

```bash
# Run migrations from root
pnpm migration:up
```

## Vercel Deployment

### Backend (`apps/backend`)

The backend is configured to run as a Vercel Serverless Function using the Hono adapter.

1.  **Framework Preset**: Select "Other".
2.  **Root Directory**: `apps/backend`.
3.  **Build Command**: `pnpm build` (or leave empty if just using API routes).
    - _Note_: Ensure `tsconfig.json` and `package.json` are correctly configured to transpile if needed, but Vercel handles TS files in `api/` automatically for standard functions.
    - For Hono, we use `api/index.ts` as the entry point.
4.  **Environment Variables**:
    - `DATABASE_URL`: Connection string to Neon/Postgres.
    - `PRIVY_APP_ID`, `PRIVY_APP_SECRET`: Auth credentials.
    - `OPENAI_API_KEY`: For news generation.
    - `STRIPE_SECRET_KEY`: For payment processing.
    - `PLAID_CLIENT_ID`, `PLAID_SECRET`: For banking integration.
    - `VITE_LANDING_URL`, `VITE_DASHBOARD_URL`: For CORS configuration.

### Frontend Apps

Both `landing-vite` and `dashboard-vite` are static sites (SPA).

1.  **Framework Preset**: Vite.
2.  **Root Directory**: `apps/landing-vite` or `apps/dashboard-vite`.
3.  **Build Command**: `pnpm build`.
4.  **Output Directory**: `dist`.
5.  **Environment Variables**:
    - `VITE_API_URL`: URL of the deployed `apps/backend` (e.g., `https://backend.yourdomain.com`).
    - `VITE_PRIVY_APP_ID`: Public Privy ID.

## Monorepo Caveats

- Ensure `ignore build step` is configured in Vercel settings (`git diff --quiet HEAD^ HEAD ./`) to avoid rebuilding apps that haven't changed.
- If using Vercel, "Include source files outside of the Root Directory" should be enabled if shared packages are used during build.
