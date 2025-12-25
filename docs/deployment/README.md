# Deployment Guide

This repository contains a monorepo structure with three main deployable applications:

1. `apps/landing` (Vite SPA)
2. `apps/dashboard` (Vite SPA)
3. `apps/backend` (Hono API)

Each app should be deployed as an **independent Vercel project** for better isolation, separate domains, and independent scaling.

## Database Migration

Before deploying, ensure database migrations are applied.

```bash
# Run migrations from root
pnpm migration:up
```

## Vercel Deployment Setup

Each app requires its own Vercel project. See [vercel-setup.md](./vercel-setup.md) for detailed step-by-step instructions on creating and configuring each project.

### Quick Reference: Vercel Project Settings

#### Landing App (`apps/landing`)

- **Framework Preset**: Vite
- **Root Directory**: `apps/landing`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Include source files outside of Root Directory**: ✅ **Enabled** (required for monorepo)

**Environment Variables:**

- `VITE_API_URL`: URL of the deployed backend (e.g., `https://api.commertize.com`)
- `VITE_PRIVY_APP_ID`: Public Privy ID
- `VITE_POSTHOG_HOST`: PostHog host URL
- `VITE_POSTHOG_KEY`: PostHog project key
- `VITE_STAGE`: Deployment stage (`preview`, `production`, `development`)
- `VITE_LANDING_URL`: Landing app URL (for CORS)
- `VITE_DASHBOARD_URL`: Dashboard app URL (for CORS)

#### Dashboard App (`apps/dashboard`)

- **Framework Preset**: Vite
- **Root Directory**: `apps/dashboard`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Include source files outside of Root Directory**: ✅ **Enabled** (required for monorepo)

**Environment Variables:**

- `VITE_API_URL`: URL of the deployed backend (e.g., `https://api.commertize.com`)
- `VITE_PRIVY_APP_ID`: Public Privy ID
- `VITE_POSTHOG_HOST`: PostHog host URL
- `VITE_POSTHOG_KEY`: PostHog project key
- `VITE_STAGE`: Deployment stage (`preview`, `production`, `development`)
- `VITE_LANDING_URL`: Landing app URL (for CORS)
- `VITE_DASHBOARD_URL`: Dashboard app URL (for CORS)

#### Backend App (`apps/backend`)

- **Framework Preset**: Hono (or "Other" if Hono is not available)
- **Root Directory**: `apps/backend`
- **Build Command**: `pnpm build`
- **Output Directory**: Leave empty or set to `dist` (not used by Vercel for serverless functions - functions are detected in `api/` directory)
- **Install Command**: `pnpm install`
- **Include source files outside of Root Directory**: ✅ **Enabled** (required for monorepo)

**Note**: The backend uses `api/index.mts` as the serverless function entry point. Vercel automatically detects functions in the `api/` directory, so the Output Directory setting is not used. The build command compiles the app to `dist/`, which is then imported by the serverless function.

**Environment Variables:**

- `DATABASE_URL`: Connection string to Neon/Postgres
- `PRIVY_APP_ID`, `PRIVY_APP_SECRET`: Auth credentials
- `OPENAI_API_KEY`: For news generation
- `OPENAI_ORG_ID`: OpenAI organization ID
- `STRIPE_SECRET_KEY`: For payment processing
- `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`: For banking integration
- `PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID`: Plaid identity verification template
- `VITE_LANDING_URL`, `VITE_DASHBOARD_URL`: For CORS configuration
- `API_SECRET_KEY`: API authentication secret
- `AES_KEY`: Encryption key for sensitive data
- `BLOB_PROD_READ_WRITE_TOKEN`, `BLOB_PREVIEW_READ_WRITE_TOKEN`: Vercel Blob storage tokens
- `VITE_VERCEL_AUTOMATION_BYPASS_SECRET`: Vercel automation bypass secret

## Monorepo-Specific Configuration

### Critical Settings

1. **Include source files outside of Root Directory**: Must be enabled for all apps since they depend on shared packages in `packages/`

2. **Ignore Build Step** (Optional but recommended):
   - Configure in Vercel project settings → General → Ignore Build Step
   - Use: `git diff --quiet HEAD^ HEAD ./apps/landing` (replace with appropriate app path)
   - This prevents rebuilding apps that haven't changed

3. **Build Dependencies**: Each app's build script automatically builds required dependencies using Turbo:
   - Landing: `build:deps` → builds `@commertize/ui`, `@commertize/utils`, `@commertize/data`
   - Dashboard: `build:deps` → builds `@commertize/ui`, `@commertize/utils`, `@commertize/data`
   - Backend: `build:deps` → builds `@commertize/utils`, `@commertize/data`

### Linking Projects

Each app must be linked to its own Vercel project:

```bash
# From each app directory
cd apps/landing
vercel link

cd ../dashboard
vercel link

cd ../backend
vercel link
```

## Environment Variable Management

Environment variables must be set manually in each Vercel project's dashboard:

1. Go to Project Settings → Environment Variables
2. Add variables for each environment (Production, Preview, Development)
3. Ensure all required variables are set (see lists above)

**Note**: The `sync-vercel-env.ts` script is not configured for independent projects. Manage environment variables directly in the Vercel dashboard.

## Troubleshooting

### Build Failures

- **"Cannot find module '@commertize/...'"**: Ensure "Include source files outside of Root Directory" is enabled
- **TypeScript errors in backend**: The backend's `tsconfig.json` excludes other apps to prevent cross-app type checking
- **Missing dependencies**: Ensure `build:deps` scripts run before main build (handled automatically)

### Deployment Issues

- **404 on routes**: Ensure `vercel.json` has proper rewrites configured (already set up for SPAs)
- **CORS errors**: Verify `VITE_LANDING_URL` and `VITE_DASHBOARD_URL` are set correctly in backend
- **Database connection**: Ensure `DATABASE_URL` is set and migrations are applied

## Next Steps

For detailed setup instructions, see [vercel-setup.md](./vercel-setup.md).
