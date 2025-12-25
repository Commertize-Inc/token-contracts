# Data Package (`@commertize/data`)

Shared data access layer, schemas, and database configurations.

## Contents

- **MikroORM**: Database ORM configuration and entities.
- **Zod Schemas**: Validation schemas shared between frontend and backend.
- **Migrations**: Database schema changes.
- **Seeders**: Initial data population.

## Key Scripts

- `pnpm db:seed`: Run database seeders.
- `pnpm migration:create`: Create a new migration.
- `pnpm migration:up`: Apply pending migrations.
