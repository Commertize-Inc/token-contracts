# Vercel Project Setup Guide

This guide provides step-by-step instructions for setting up independent Vercel projects for each app in the Commertize monorepo.

## Prerequisites

- Vercel account with appropriate permissions
- Vercel CLI installed (`npm i -g vercel`)
- Access to the GitHub repository
- Environment variables ready (see [README.md](./README.md) for lists)

## Overview

Each app (`landing`, `dashboard`, `backend`) will be deployed as a separate Vercel project. This provides:

- Independent domains and URLs
- Separate scaling and configuration
- Isolated deployments
- Independent environment variable management

## Step 1: Create Landing App Project

### 1.1 Create Project in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `Commertize-Inc/commertize.com`
4. Configure the project:
   - **Project Name**: `commertize-landing` (or your preferred name)
   - **Framework Preset**: **Vite**
   - **Root Directory**: `apps/landing`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### 1.2 Configure Monorepo Settings

1. In project settings, go to **Settings** → **General**
2. Scroll to **"Root Directory"** section
3. Enable **"Include source files outside of Root Directory"** ✅
   - This is **critical** for monorepo builds to access shared packages

### 1.3 Configure Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for each environment (Production, Preview, Development):

   ```
   VITE_API_URL=https://api.commertize.com
   VITE_PRIVY_APP_ID=your_privy_app_id
   VITE_POSTHOG_HOST=https://app.posthog.com
   VITE_POSTHOG_KEY=your_posthog_key
   VITE_STAGE=production (or preview/development)
   VITE_LANDING_URL=https://commertize.com
   VITE_DASHBOARD_URL=https://app.commertize.com
   ```

3. Repeat for Preview and Development environments with appropriate values

### 1.4 Link Project Locally (Optional)

```bash
cd apps/landing
vercel link
# Follow prompts to link to the project you just created
```

### 1.5 Deploy

1. Push changes to your repository
2. Vercel will automatically deploy on push (if connected to GitHub)
3. Or deploy manually: `vercel --prod` from `apps/landing` directory

## Step 2: Create Dashboard App Project

### 2.1 Create Project in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the same GitHub repository: `Commertize-Inc/commertize.com`
4. Configure the project:
   - **Project Name**: `commertize-dashboard` (or your preferred name)
   - **Framework Preset**: **Vite**
   - **Root Directory**: `apps/dashboard`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install\*\*

### 2.2 Configure Monorepo Settings

1. In project settings, go to **Settings** → **General**
2. Enable **"Include source files outside of Root Directory"** ✅

### 2.3 Configure Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add the same variables as landing app (see Step 1.3)

### 2.4 Link Project Locally (Optional)

```bash
cd apps/dashboard
vercel link
```

### 2.5 Deploy

Deploy following the same process as landing app.

## Step 3: Create Backend App Project

### 3.1 Create Project in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import the same GitHub repository: `Commertize-Inc/commertize.com`
4. Configure the project:
   - **Project Name**: `commertize-backend` (or your preferred name)
   - **Framework Preset**: **Hono** (or "Other" if Hono preset is not available)
   - **Root Directory**: `apps/backend`
   - **Build Command**: `pnpm build`
   - **Output Directory**: Leave empty or set to `dist` (Vercel ignores this for serverless functions - functions are auto-detected in `api/` directory)
   - **Install Command**: `pnpm install`

**Note**: The backend uses `api/index.mts` as the Vercel serverless function entry point. The build command compiles the app to `dist/`, which is imported by the serverless function. Vercel automatically detects and deploys functions in the `api/` directory, so the Output Directory setting is not used.

### 3.2 Configure Monorepo Settings

1. In project settings, go to **Settings** → **General**
2. Enable **"Include source files outside of Root Directory"** ✅

### 3.3 Configure Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add the following variables for each environment:

   ```
   DATABASE_URL=postgresql://...
   PRIVY_APP_ID=your_privy_app_id
   PRIVY_APP_SECRET=your_privy_secret
   OPENAI_API_KEY=your_openai_key
   OPENAI_ORG_ID=your_openai_org_id
   STRIPE_SECRET_KEY=your_stripe_secret
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox (or production)
   PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID=your_template_id
   VITE_LANDING_URL=https://commertize.com
   VITE_DASHBOARD_URL=https://app.commertize.com
   API_SECRET_KEY=your_api_secret
   AES_KEY=your_encryption_key
   BLOB_PROD_READ_WRITE_TOKEN=your_blob_token
   BLOB_PREVIEW_READ_WRITE_TOKEN=your_blob_token
   VITE_VERCEL_AUTOMATION_BYPASS_SECRET=your_bypass_secret
   ```

3. Repeat for Preview and Development environments

### 3.4 Link Project Locally (Optional)

```bash
cd apps/backend
vercel link
```

### 3.5 Deploy

Deploy following the same process as other apps.

## Step 4: Configure Ignore Build Step (Optional)

To optimize deployments and avoid unnecessary rebuilds:

1. Go to each project's **Settings** → **General**
2. Scroll to **"Ignore Build Step"**
3. Add the following command (replace `landing` with appropriate app name):

   ```bash
   git diff --quiet HEAD^ HEAD ./apps/landing
   ```

   This will skip builds when the app's directory hasn't changed.

## Step 5: Configure Custom Domains

### 5.1 Landing App

1. Go to project settings → **Domains**
2. Add your custom domain (e.g., `commertize.com`)
3. Follow DNS configuration instructions

### 5.2 Dashboard App

1. Go to project settings → **Domains**
2. Add your custom domain (e.g., `app.commertize.com`)
3. Follow DNS configuration instructions

### 5.3 Backend App

1. Go to project settings → **Domains**
2. Add your custom domain (e.g., `api.commertize.com`)
3. Follow DNS configuration instructions

## Step 6: Verify Deployment

### 6.1 Check Build Logs

1. Go to each project's **Deployments** tab
2. Click on a deployment to view build logs
3. Verify:
   - Dependencies are built correctly
   - No TypeScript errors
   - Build completes successfully

### 6.2 Test Endpoints

- **Landing**: Visit the landing URL and verify routing works
- **Dashboard**: Visit the dashboard URL and verify authentication
- **Backend**: Test API endpoints (e.g., `GET /api/health`)

### 6.3 Verify Environment Variables

1. Check that environment variables are set correctly
2. Verify CORS is configured properly (backend should allow landing and dashboard origins)
3. Test API connectivity from frontend apps

## Troubleshooting

### Build Fails with "Cannot find module"

**Problem**: Build fails with errors like "Cannot find module '@commertize/ui'"

**Solution**:

1. Verify "Include source files outside of Root Directory" is enabled
2. Check that `build:deps` script runs before main build
3. Verify shared packages are built correctly

### TypeScript Errors in Backend

**Problem**: Backend build fails with TypeScript errors from landing/dashboard

**Solution**: This should be fixed by the `tsconfig.json` exclude configuration. Verify `apps/backend/tsconfig.json` excludes other apps.

### CORS Errors

**Problem**: Frontend apps can't connect to backend API

**Solution**:

1. Verify `VITE_LANDING_URL` and `VITE_DASHBOARD_URL` are set in backend
2. Check backend CORS configuration in `apps/backend/src/app.ts`
3. Ensure frontend `VITE_API_URL` points to correct backend URL

### Environment Variables Not Available

**Problem**: Environment variables are not accessible at runtime

**Solution**:

1. Verify variables are set in correct environment (Production/Preview/Development)
2. Check variable names match exactly (case-sensitive)
3. For Vite apps, ensure variables start with `VITE_` prefix
4. Redeploy after adding new variables

## Next Steps

- Set up monitoring and alerts
- Configure preview deployments for pull requests
- Set up staging environments if needed
- Configure database migrations to run automatically
- Set up CI/CD pipelines if not using Vercel's built-in deployment

## Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/monorepos)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
