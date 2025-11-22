# Environment Variable Setup

This monorepo uses a dual environment configuration strategy optimized for development workflow and production deployment.

## Strategy Overview

### Development Mode
- **Location**: Root-level `.env.development`
- **Purpose**: Centralized environment variables for all apps
- **Benefits**:
  - Single source of truth for development
  - Easy to manage and update
  - Shared across all apps in the monorepo
  - Safe to commit (contains dev values only)

### Production Mode
- **Location**: App-specific `.env.production` files
  - `apps/dashboard/.env.production`
  - `apps/landing/.env.production`
- **Purpose**: Isolated environment variables per app
- **Benefits**:
  - Smaller deployment footprint (each app only gets its vars)
  - Better security isolation
  - Independent deployments
  - **Never committed to git** (contains production secrets)

## File Structure

```
commertize.com/
├── .env.development          # Development vars (tracked in git)
├── apps/
│   ├── dashboard/
│   │   ├── .env.production.example  # Template (tracked in git)
│   │   └── .env.production          # Actual prod vars (gitignored)
│   └── landing/
│       ├── .env.production.example  # Template (tracked in git)
│       └── .env.production          # Actual prod vars (gitignored)
```

## How It Works

Both apps use `dotenv` and `dotenv-expand` for environment variable loading with interpolation support:

```typescript
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";

const monorepoRoot = path.join(__dirname, '..', '..');

// Load .env from monorepo root with variable interpolation support
const envPath = path.join(monorepoRoot, '.env');
const myEnv = dotenv.config({ path: envPath });
dotenvExpand.expand(myEnv);
```

This provides:
- **Variable interpolation**: Use `${VAR_NAME}` syntax in `.env` files
- **Consistent behavior**: Same env loading across Next.js, MikroORM, and other tools
- **Better DX**: Compose complex values from simpler variables

## Setup Instructions

### For Development

1. The root `.env.development` file is already configured and tracked in git
2. Simply run `pnpm dev` from any app directory
3. All apps automatically use the shared development environment

### For Production Deployment

Each app needs its own `.env.production` file:

#### Dashboard App
```bash
cd apps/dashboard
cp .env.production.example .env.production
# Edit .env.production with your production values
```

#### Landing App
```bash
cd apps/landing
cp .env.production.example .env.production
# Edit .env.production with your production values
```

## Adding New Variables

### Development Variables
Add to root `.env.development` file:
```bash
# In .env.development
NEW_DEV_VARIABLE=dev_value
```

### Production Variables
1. Add to the app-specific `.env.production.example` as a template
2. Add the actual value to `.env.production` (never commit this)

## Security Notes

- ✅ `.env.development` - Safe to commit (dev values only)
- ✅ `.env.production.example` - Safe to commit (template only)
- ❌ `.env.production` - **NEVER COMMIT** (contains secrets)
- ❌ `.env.local` - **NEVER COMMIT** (personal overrides)

## Deployment Checklist

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all production values in `.env.production`
- [ ] Verify no secrets are committed to git
- [ ] Test build with production env: `NODE_ENV=production pnpm build`
- [ ] Ensure deployment platform has access to `.env.production` or uses env injection
