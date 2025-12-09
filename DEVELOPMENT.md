# Development Guide

This guide covers detailed workflows, best practices, and troubleshooting for the Commertize monorepo.

## Environment Setup

We use a cascading environment variable system. See [Environment Setup](docs/env/SETUP.md) for full details.

### Quick Command Reference

```bash
# Install dependencies
pnpm install

# Run all apps in development mode
pnpm dev

# Run only the landing page
pnpm dev:landing

# Run only the dashboard
pnpm dev:dashboard

# Build all apps
pnpm build

# Lint all apps
pnpm lint
```

## Database Management

We use **MikroORM** with **NeonDB** (PostgreSQL).

### Migration Workflow

1.  **Make schema changes** in your entities (e.g., `apps/dashboard/lib/db/entities/`).
2.  **Create a migration**:
    ```bash
    cd apps/dashboard
    pnpm mikro-orm migration:create
    ```
3.  **Apply migration**:
    ```bash
    pnpm mikro-orm migration:up
    ```

### Database Troubleshooting

-   **Connection Error**: Check `sslmode=require` is in your `DATABASE_URL`.
-   **Migration Mismatch**: If local state is messed up, you can drop the schema and re-run migrations (ONLY IN DEVELOPMENT):
    ```bash
    pnpm mikro-orm schema:drop --run
    pnpm mikro-orm migration:up
    ```

## Adding New Packages

### To a specific app
```bash
pnpm --filter @commertize/dashboard add <package-name>
```

### To the shared UI package
```bash
pnpm --filter @commertize/ui add <package-name>
```

### As a dev dependency for the root
```bash
pnpm add -D -w <package-name>
```

## Shared UI Library

Located in `packages/ui`.
-   **Development**: When you update a component in `packages/ui`, changes are instantly reflected in apps thanks to the monorepo setup.
-   **Styles**: We use CSS Modules for component-level styling to prevent conflicts.

## Common Issues & Fixes

### Hydration Mismatches
-   Ensure you aren't using random values (like `Math.random()`) during render without `useEffect`.
-	Consider using `useIsMounted` from [@commertize/utils](https://github.com/commertize/commertize.com/tree/main/packages/utils) to prevent hydration mismatches.
-   Check that `typeof window` checks are handled correctly if rendering different content on client/server.

### Port Conflicts
-   Landing page runs on `:3000`.
-   Dashboard runs on `:3001`.
-   If ports are blocked: `lsof -ti:3000 | xargs kill -9`
