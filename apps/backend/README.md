# Backend Application

The core API server for the Commertize platform.

## Technologies

- **Runtime**: Node.js
- **Framework**: Express (via custom wrapper or structure)
- **Database**: PostgreSQL (via `@commertize/data` and MikroORM)
- **Authentication**: JWT / Session (see `middleware/`)

## Setup

```bash
pnpm dev
```

## Structure

- `src/routes`: API route definitions.
- `src/services`: Business logic.
- `src/middleware`: Request processing (auth, validation).
- `src/lib`: Integrations (Plaid, etc.).

## Environment Variables

Ensure `.env` matches the `env` package schemas.
