# Contributing to Commertize Monorepo

## Prerequisites
- **Node.js**: >=20.0.0
- **pnpm**: >=10.0.0
- **Docker**: (Optional) For running local database.

## Setup
One command to install dependencies and build packages:

```bash
pnpm install
```

## Running Locally

### 1. Environment Variables
Local development relies on the root `.env` file. Copy the example and fill in keys:

```bash
cp .env.example .env
```

### 2. Start Development Servers
Run all apps (Landing, Dashboard, Backend) in parallel:

```bash
pnpm dev
# Landing: http://localhost:3000
# Dashboard: http://localhost:3001
# Backend: http://localhost:3002
```

### 3. Database (Optional)
To run a local PostgreSQL instance:

```bash
pnpm docker:up
```

## Project Structure
- `apps/backend`: Node.js/Hono API server
- `apps/dashboard`: React/Vite admin dashboard
- `apps/landing`: React/Vite public landing page
- `packages/data`: Shared database schemas and entities
- `packages/ui`: Shared UI components
- `packages/utils`: Shared utilities and configuration
