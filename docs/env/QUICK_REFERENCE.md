# Environment Variable Quick Reference

## Common Variables

| Variable | Required By | Description | Example |
| --- | --- | --- | --- |
| `DATABASE_URL` | Dashboard | NeonDB Connection String | `postgres://user:pass@host/db` |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Dashboard | Privy Setup | `clp...` |
| `STRIPE_SECRET_KEY` | Dashboard | Payments | `sk_test_...` |
| `DOCUSEAL_API_KEY` | Dashboard | Document Signing | `...` |

## Troubleshooting

### "Database connection failed"
-   Check `sslmode=require` is at the end of `DATABASE_URL`.
-   Verify your IP is whitelisted in Neon (if applicable).

### "Privy app not found"
-   Ensure `NEXT_PUBLIC_PRIVY_APP_ID` matches the one in your Privy dashboard.

### "Environment variable undefined"
-   Did you restart the dev server? Next.js loads env vars on boot.
-   Is it client-side? Ensure it starts with `NEXT_PUBLIC_`.
