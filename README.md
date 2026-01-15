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

    Commertize uses a cascading environment variable system. Please fetch the required environment variables from the project's [Notion workspace](https://www.notion.so/Secrets-2c4f8b6f93a580c29f11d40ac7c0749f).
    1. Create a `.env` file in the root directory.
    2. Populate both files with the values from Notion.

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
