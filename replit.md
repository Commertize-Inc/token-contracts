# Commertize

## Overview
Commertize is a premium real estate investment platform designed to merge traditional finance with DeFi by enabling tokenized property investments. It features a public landing page and a secure investor dashboard with robust KYC/IDV verification. The platform aims to democratize access to real estate investments through fractional ownership, enhanced liquidity, and diversification opportunities for investors, while offering capital and tokenization solutions for property sponsors.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
Commertize utilizes a **pnpm monorepo** structure, separating the public `landing` page and authenticated `dashboard` into distinct Next.js 16 applications. Shared components and utilities reside in `packages/ui` and `packages/utils` respectively, ensuring design consistency and code reusability.

**Frontend**: Built with Next.js 16 (App Router) and React 19, employing CSS Modules and Tailwind CSS for styling. A custom design system, inspired by Material 3 and featuring a "Commertize Gold" palette, ensures a premium, trustworthy aesthetic with glassmorphism and clean data presentation. Key reusable components include a versatile `Button`, `Chip`, `Navbar`, and a `PropertyCard` for displaying investment opportunities with detailed metrics and gold-bordered styling. The landing page incorporates a dynamic `FlippingText` component for engaging messaging and a responsive marketplace section.

**Authentication & Authorization**: **Privy** is the primary provider, supporting email, Web3 wallet, and Google OAuth logins. It facilitates embedded wallet creation and integrates with server-side token verification. An `AuthGuard` protects dashboard routes, redirecting unauthenticated users. Role-based architecture (Investor, Sponsor, Admin) ensures tailored dashboard experiences with distinct routing and navigation.

**Database Layer**: **MikroORM v6** with a PostgreSQL driver (recommended NeonDB) manages data. The `User` entity integrates Privy IDs with Plaid KYC data. A Request Context pattern ensures proper EntityManager isolation for robust serverless operation.

**KYC/Identity Verification**: Implemented via **Plaid Identity Verification**. The flow involves generating a Plaid Link token for IDV, user completion through the Plaid Link UI, and updating the user's KYC status in the database to grant full dashboard access. This ensures financial services compliance with minimal user friction.

**AI Assistant (RUNE.CTZ)**: Powered by **OpenAI (GPT-4o)**, this assistant provides guidance on tokenized real estate, platform features, and investment processes. It's integrated into the authenticated dashboard, secured with Privy session verification, per-user rate limiting, and strict input validation.

**Environment Management**: Uses a root-level `.env.development` for local setup and git-ignored, app-specific `.env.production` files for secure, isolated deployments.

## External Dependencies

### Third-Party Services
-   **Privy**: Authentication and wallet management (email, Web3, Google OAuth, embedded wallets).
-   **Plaid**: Identity Verification (KYC) for regulatory compliance.
-   **NeonDB**: Managed PostgreSQL database service with SSL support.
-   **OpenAI**: Powers the RUNE.CTZ AI assistant (GPT-4o model).

### NPM Packages
-   **Core Framework**: `next`, `react`, `typescript`.
-   **Authentication**: `@privy-io/react-auth`, `@privy-io/server-auth`.
-   **Database**: `@mikro-orm/core`, `@mikro-orm/postgresql`, `@mikro-orm/migrations`, `pg`.
-   **KYC Integration**: `plaid`, `react-plaid-link`.
-   **AI Chat**: `openai`.
-   **UI & Styling**: `tailwindcss`, `lucide-react`, `clsx`, `tailwind-merge`.
-   **Utilities**: `dotenv`, `dotenv-expand`, `uuid`, `reflect-metadata`.