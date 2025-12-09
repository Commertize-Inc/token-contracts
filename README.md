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

### Installation & Setup

1.  **Install dependencies**

    ```bash
    pnpm install
    ```

2.  **Configure Environment**

    Commertize uses a cascading environment variable system. Start by copying the root template:

    ```bash
    cp .env.example .env
    ```

    Then navigate to the dashboard app and configure its specific environment:

    ```bash
    cd apps/dashboard
    cp .env.example .env.local
    ```

    Update `apps/dashboard/.env.local` with your credentials:
    ```env
    NEXT_PUBLIC_PRIVY_APP_ID=your_app_id
    NEXT_PUBLIC_PRIVY_CLIENT_ID=your_client_id
    PRIVY_APP_SECRET=your_secret
    DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
    ```

3.  **Initialize Database**

    ```bash
    # From apps/dashboard directory
    pnpm mikro-orm migration:create --initial
    pnpm mikro-orm migration:up
    cd ../..
    ```

### Running the Apps

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm dev:landing    # http://localhost:3000
pnpm dev:dashboard  # http://localhost:3001
```

## Project Structure

```
commertize.com/
├── apps/
│   ├── landing/          # Public marketing site
│   └── dashboard/        # Investor portal (Auth, KYC)
├── packages/
│   └── ui/              # Shared design system components
├── docs/                # Detailed documentation
└── pnpm-workspace.yaml
```

## Documentation

- **[Development Guide](DEVELOPMENT.md)** - detailed workflows, standards, and troubleshooting.
- **[Contributing](CONTRIBUTING.md)** - how to contribute to this project.
- **[Docs Folder](docs/README.md)** - deep dive into architecture, branding, and environment setup.

## Features

### Landing Page (`apps/landing`)
- Premium real estate showcase
- SEO-optimized static pages
- Responsive, brand-consistent UI

### Dashboard (`apps/dashboard`)
- **Authentication**: Privy-powered email/wallet login
- **KYC Verification**: Required identity verification flow
- **User Management**: PostgreSQL + MikroORM
- **Session Security**: Robust session invalidation

### Shared UI (`packages/ui`)
- Reusable components (Button, Chip, Logo)
- Consistent theming and typography

## License

Proprietary - All rights reserved
