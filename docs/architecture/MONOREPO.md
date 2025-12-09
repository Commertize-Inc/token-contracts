# Monorepo Architecture

Commertize is built as a pnpm workspace monorepo.

## Structure

```
.
├── apps/               # Deployable applications
│   ├── dashboard/      # Next.js App (Investor Portal)
│   └── landing/        # Next.js App (Marketing Site)
├── packages/           # Shared libraries
│   ├── ui/             # Shared UI components
│   ├── config/         # Shared configuration (ESLint, TS)
│   └── utils/          # Shared utilities (logging, formatting)
└── docs/               # Documentation
```

## Workspaces

We use `pnpm-workspace.yaml` to define the workspace:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

## Dependency Management

-   **Internal Dependencies**: Apps depend on packages using the workspace protocol (e.g., `"@commertize/ui": "workspace:*"`).
-   **Shared Dependencies**: Dev dependencies like Turbo, Prettier, and ESLint are often at the root.

## Building

We use [Turbo](https://turbo.build/) (optional but recommended) or pnpm filtering to build.

```bash
pnpm build --filter @commertize/dashboard
```
