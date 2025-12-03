# Plaid ACH Integration

Complete Plaid bank account linking and ACH payment integration with Stripe processor support.

## Overview

This integration enables investors to link their bank accounts via Plaid and process ACH payments (both debits and credits) through Stripe. It includes:

- Bank account linking via Plaid Link
- Multiple accounts per user support
- Stripe processor token generation for ACH
- Webhook handling for real-time updates
- Comprehensive type safety and error handling

## Architecture

### Database Schema

```
User
  └─> PlaidItem (bank connection)
       ├─ itemId (unique per bank)
       ├─ accessToken (encrypted)
       └─> BankAccount[] (multiple accounts per bank)
            ├─ plaidAccountId
            ├─ accountType (checking/savings)
            ├─ stripeProcessorToken
            └─ isPrimary flag
```

**Key Entities:**

- **PlaidItem**: Represents a connection to one financial institution
- **BankAccount**: Individual account (checking, savings, etc.)
- **User**: Keeps only IDV (KYC) data; bank data is in PlaidItem/BankAccount

## Setup

### 1. Environment Variables

Add to `apps/dashboard/.env`:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox  # sandbox, development, or production
PLAID_IDENTITY_VERIFICATION_TEMPLATE_ID=your_idv_template_id

# Webhook configuration (optional but recommended)
PLAID_WEBHOOK_URL=https://yourdomain.com/api/plaid/webhooks
PLAID_WEBHOOK_SECRET=your_webhook_secret

# Stripe (if not already present)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable
```

### 2. Get Plaid Credentials

1. Sign up at [Plaid Dashboard](https://dashboard.plaid.com/)
2. Get your `client_id` and `secret` from Keys page
3. Configure webhook URL in Settings → Webhooks

### 3. Database Migration

Already completed! The migration created:

- `plaid_item` table
- `bank_account` table
- Removed redundant fields from `user` table

## Usage

### Frontend: Link Bank Account

```typescript
'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useEffect, useState } from 'react';

export function LinkBankButton() {
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // 1. Create link token for Auth flow
  useEffect(() => {
    fetch('/api/plaid/create_link_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow: 'auth' }),  // Important: 'auth' not 'idv'
    })
      .then((res) => res.json())
      .then((data) => setLinkToken(data.link_token));
  }, []);

  // 2. Handle successful link
  const onSuccess = async (public_token: string) => {
    // Exchange public token for access token and save accounts
    const response = await fetch('/api/plaid/exchange_public_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_token }),
    });

    const data = await response.json();
    console.log('Linked accounts:', data.accounts);
    // Redirect or show success message
  };

  // 3. Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Link Bank Account
    </button>
  );
}
```

### Backend: List Linked Accounts

```typescript
// In your API route or server component
import { getEM } from "@/lib/db/orm";
import { BankAccount } from "@/lib/db/entities/BankAccount";
import { sanitizeBankAccount } from "@/lib/plaid";

// Get user's accounts
const em = await getEM();
const accounts = await em.find(BankAccount, {
	user: userId,
	status: "active",
});

// Sanitize before sending to client
const safeAccounts = accounts.map(sanitizeBankAccount);
```

### Create Stripe Processor Token

```typescript
// Frontend: Get processor token
const response = await fetch("/api/plaid/stripe-token", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ accountId: selectedAccount.id }),
});

const { processorToken } = await response.json();

// Backend: Use with Stripe
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Create bank account source
const bankAccount = await stripe.customers.createSource(customerId, {
	source: processorToken,
});

// Create ACH debit (charge investor)
const charge = await stripe.charges.create({
	amount: 50000, // $500.00
	currency: "usd",
	customer: customerId,
	source: bankAccount.id,
});

// Create ACH credit (pay investor)
const payout = await stripe.payouts.create({
	amount: 10000, // $100.00
	currency: "usd",
	destination: bankAccount.id,
});
```

## API Routes

All routes under `/api/plaid/`:

### `POST /create_link_token`

Create Plaid Link token for bank linking.

**Body:**

```json
{ "flow": "auth" }
```

**Response:**

```json
{ "link_token": "link-sandbox-..." }
```

### `POST /exchange_public_token`

Exchange public token and save bank accounts.

**Body:**

```json
{ "public_token": "public-sandbox-..." }
```

**Response:**

```json
{
	"success": true,
	"accounts": [
		{
			"id": "uuid",
			"accountName": "Chase Checking",
			"accountType": "checking",
			"accountMask": "••••1234",
			"institutionName": "Chase",
			"isPrimary": true,
			"isVerified": true,
			"status": "active"
		}
	]
}
```

### `GET /accounts`

List user's bank accounts.

**Query params:**

- `status` - Filter by status (active/inactive/error)
- `primary` - Filter by isPrimary (true/false)

**Response:**

```json
{
  "accounts": [...]
}
```

### `GET /accounts/[id]`

Get single account details.

### `DELETE /accounts/[id]`

Remove/unlink bank account (soft delete).

### `POST /accounts/[id]/set-primary`

Set account as primary payment method.

### `POST /stripe-token`

Create Stripe processor token.

**Body:**

```json
{ "accountId": "uuid" }
```

**Response:**

```json
{
	"processorToken": "btok_...",
	"accountId": "uuid"
}
```

### `POST /webhooks`

Handle Plaid webhook events.

## Webhooks

Plaid sends webhooks for important events:

### Event Types

- `ITEM_LOGIN_REQUIRED` - User must re-authenticate bank
- `ERROR` - Item error occurred
- `PENDING_EXPIRATION` - Item will expire soon
- `USER_PERMISSION_REVOKED` - User revoked access
- `DEFAULT_UPDATE` - General item updates

### Setup

1. Configure webhook URL in Plaid Dashboard
2. Add `PLAID_WEBHOOK_SECRET` to `.env`
3. Webhook route automatically handles signature validation
4. PlaidItem status is updated automatically

## Security Best Practices

### ✅ Implemented

- Access tokens never exposed in API responses
- Webhook signature validation
- User ownership verification on all operations
- Account data sanitization via `sanitizeBankAccount()`
- Comprehensive authentication checks

### 🔒 Production Recommendations

1. **Encrypt access tokens in database:**

```typescript
// Use crypto or DB-level encryption
import { encrypt, decrypt } from "@/lib/crypto";

plaidItem.accessToken = encrypt(access_token);
```

2. **Rate limiting:**

```typescript
// Add rate limiting middleware
import rateLimit from "@/lib/rateLimit";

export const POST = rateLimit(actualHandler, {
	max: 5,
	windowMs: 60000, // 5 requests per minute
});
```

3. **PCI compliance:**

- Never log full account numbers
- Use HTTPS only
- Regular security audits

## Utilities

### Formatting

```typescript
import { formatAccountMask, formatAccountName } from "@/lib/plaid";

formatAccountMask("1234"); // "••••1234"
formatAccountName("Plaid Checking", "Plaid"); // "Checking"
```

### Validation

```typescript
import { isAccountVerified, itemNeedsReauth } from "@/lib/plaid";

if (isAccountVerified(account)) {
	// Process payment
}

if (itemNeedsReauth(plaidItem)) {
	// Show re-auth prompt
}
```

### Account Selection

```typescript
import { getPrimaryAccount, sortAccounts } from "@/lib/plaid";

const primary = getPrimaryAccount(accounts);
const sorted = sortAccounts(accounts); // Primary first, then by date
```

## Testing

### Plaid Sandbox

Use these credentials in sandbox:

- **Username:** `user_good`
- **Password:** `pass_good`
- **Institution:** Any from test list

### Test Flow

1. Create link token with `flow: 'auth'`
2. Open Plaid Link with test credentials
3. Exchange public token
4. Verify accounts in database
5. Create Stripe processor token
6. Test ACH payment with Stripe

### Webhook Testing

Trigger webhooks via Plaid Dashboard → Sandbox → Fire Webhook Event

## Troubleshooting

### "Missing public_token"

- Ensure Plaid Link completed successfully
- Check `onSuccess` callback receives token

### "Account not found"

- Verify account ID is correct UUID
- Check user owns the account
- Ensure account status is 'active'

### "Item requires re-authentication"

- PlaidItem status is 'login_required'
- Create new link token with `update` mode
- User must re-authenticate via Plaid Link

### Webhook not received

- Verify PLAID_WEBHOOK_URL is publicly accessible
- Check webhook configuration in Plaid Dashboard
- Ensure route returns 200 status

## Resources

- [Plaid API Docs](https://plaid.com/docs/api/)
- [Plaid Auth Overview](https://plaid.com/docs/auth/)
- [Stripe ACH Payments](https://stripe.com/docs/ach)
- [Plaid + Stripe Integration](https://plaid.com/docs/auth/partnerships/stripe/)

## Support

For issues:

1. Check logs in browser console and server
2. Verify environment variables are set
3. Review Plaid Dashboard for API errors
4. Check webhook delivery logs

For Plaid support:

- Email: support@plaid.com
- Docs: https://plaid.com/docs/

For Stripe support:

- Email: support@stripe.com
- Docs: https://stripe.com/docs/
