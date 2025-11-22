# Commertize Documentation

Welcome to the Commertize documentation hub.

## Getting Started

- **[Quick Start Guide](../QUICK_START.md)** - Get up and running in 5 minutes
- **[Environment Setup](../ENV_SETUP.md)** - Detailed configuration guide
- **[Monorepo Architecture](../MONOREPO_SETUP.md)** - Deep dive into project structure

## Design & Branding

- **[Brand Identity](branding/brand_identity.md)** - Colors, typography, logo usage
- **[Style Guide](branding/style_guide.md)** - UI component guidelines and standards

## Application Architecture

- **[Dashboard Architecture](dashboard/architecture.md)** - Dashboard app structure and design patterns

## Package Documentation

### `@commertize/ui` - Shared UI Components

Location: `packages/ui/`

Available Components:
- **Button** - Multiple variants (primary, secondary, outlined, text)
- **Chip** - Active/inactive state chips
- **Logo** - Brand logo with light/dark theme support
- **Navbar** - Reusable navigation bar with auth integration

Usage:
```tsx
import { Logo, Button, Chip, Navbar } from "@commertize/ui";
```

## Development Guides

### Adding New Features

1. Create feature branch from `main`
2. Develop and test locally
3. Update relevant documentation
4. Create pull request

### Database Migrations

```bash
cd apps/dashboard
pnpm mikro-orm migration:create  # Create new migration
pnpm mikro-orm migration:up      # Apply migrations
pnpm mikro-orm migration:down    # Rollback migration
```

### Adding Dependencies

```bash
# To a specific app
pnpm --filter @commertize/dashboard add package-name

# To shared UI package
pnpm --filter @commertize/ui add package-name

# Dev dependency to root
pnpm add -D -w package-name
```

## API Documentation

### Dashboard API Endpoints

#### Authentication
Protected by Privy authentication middleware

#### KYC Endpoints

**`GET /api/kyc/status`**
- Returns user's KYC verification status
- Response: `{ isKycd: boolean, kycCompletedAt?: Date }`

**`POST /api/kyc/submit`**
- Submits KYC verification (demo implementation)
- Response: `{ success: boolean }`

## Troubleshooting

### Common Issues

**Port already in use**
```bash
lsof -ti:3000 | xargs kill -9  # Kill landing page
lsof -ti:3001 | xargs kill -9  # Kill dashboard
```

**Database connection errors**
- Verify DATABASE_URL in `.env`
- Ensure NeonDB instance is running
- Check SSL mode is set to `require`

**Privy authentication fails**
- Verify NEXT_PUBLIC_PRIVY_APP_ID and NEXT_PUBLIC_PRIVY_CLIENT_ID
- Check app is configured correctly in Privy dashboard
- Ensure redirect URLs are whitelisted

**Shared UI components not found**
- Run `pnpm install` from root
- Verify `transpilePackages: ["@commertize/ui"]` in next.config.ts
- Check workspace is properly linked in pnpm-workspace.yaml

## Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [MikroORM Documentation](https://mikro-orm.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

For questions or issues, contact the development team.
