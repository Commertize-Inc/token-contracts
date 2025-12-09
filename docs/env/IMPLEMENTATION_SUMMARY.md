# Environment Implementation Summary

This document explains the "cascading" environment variable loading strategy used in `@commertize/utils/env`.

## The Strategy

We load environment variables in a specific order of precedence:

1.  **System/Shell Variables**: Highest priority.
2.  `[app]/.env.[stage]`
3.  `[app]/.env`
4.  `root/.env.[stage]`
5.  `root/.env`

*Note: The actual implementation logic resides in `packages/utils/src/env.ts`.*

## Why this complexity?

This allows us to:
-   Have shared defaults in the root `.env`.
-   Override them for specific apps (e.g., Dashboard needs a different `API_URL` than Landing).
-   Let developers locally override everything with `.env.local` without git-committing secrets.
