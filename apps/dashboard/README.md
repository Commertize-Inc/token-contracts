# Dashboard Application

The Investor Dashboard is the secure, authenticated portal for Commertize users. It handles identity verification (KYC), investment management, and profile settings.

## Features

-   **Authentication**: Managed by [Privy](https://privy.io) (Email, Google, Wallet).
-   **KYC Verification**: Custom flow to verify investor identity before allowing access.
-   **Real-time Status**: Polls for KYC completion and document signing status.
-   **Document Signing**: Integrated with DocuSeal.
-   **Bank Linking**: Integrated with Plaid.

## Tech Stack

-   **Framework**: Next.js 16 (App Router)
-   **Database**: MikroORM + PostgreSQL
-   **Styling**: Tailwind CSS + CSS Modules
-   **State**: React Server Components + Client Hooks

## Setup & Configuration

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy App ID |
| `DATABASE_URL` | NeonDB Connection String |
| `PLAID_CLIENT_ID` | Plaid Client ID (for bank linking) |
| `DOCUSEAL_API_KEY` | DocuSeal API Key (for documents) |

## Development

### Running the App

```bash
pnpm dev:dashboard
```
Runs on `http://localhost:3001`.

### Database Migrations

Use MikroORM CLI from this directory:

```bash
pnpm mikro-orm migration:create # Create
pnpm mikro-orm migration:up     # Apply
```

## Related Documentation

-   [DocuSeal Integration](lib/docuseal/README.md)
-   [Plaid Integration](lib/plaid/README.md)
