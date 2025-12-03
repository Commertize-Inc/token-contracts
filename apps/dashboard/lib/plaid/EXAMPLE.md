# Plaid ACH Integration - Code Examples

Practical examples for common use cases in the Commertize platform.

## Table of Contents

- [Bank Account Linking Component](#bank-account-linking-component)
- [Account List Component](#account-list-component)
- [Account Selection Component](#account-selection-component)
- [ACH Payment Processing](#ach-payment-processing)
- [Investment Flow](#investment-flow)
- [Dividend Distribution](#dividend-distribution)

## Bank Account Linking Component

Complete component for linking bank accounts:

```typescript
'use client';

import { usePlaidLink } from 'react-plaid-link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@commertize/ui';

export function LinkBankAccount() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch link token
  useEffect(() => {
    async function createLinkToken() {
      try {
        const response = await fetch('/api/plaid/create_link_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flow: 'auth' }),
        });

        if (!response.ok) throw new Error('Failed to create link token');

        const data = await response.json();
        setLinkToken(data.link_token);
      } catch (err) {
        setError('Failed to initialize bank linking');
        console.error(err);
      }
    }

    createLinkToken();
  }, []);

  // Handle successful link
  const onSuccess = async (public_token: string, metadata: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plaid/exchange_public_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token }),
      });

      if (!response.ok) throw new Error('Failed to link bank account');

      const data = await response.json();
      console.log('Linked accounts:', data.accounts);

      // Redirect to success page or show accounts
      router.push('/dashboard/bank-accounts');
    } catch (err) {
      setError('Failed to link bank account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle errors
  const onExit = (error: any, metadata: any) => {
    if (error) {
      console.error('Plaid Link error:', error);
      setError('Bank linking cancelled or failed');
    }
  };

  // Initialize Plaid Link
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Link Your Bank Account</h2>
      <p className="text-slate-600">
        Connect your bank account to invest in properties via ACH.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <Button
        onClick={() => open()}
        disabled={!ready || loading}
        variant="primary"
      >
        {loading ? 'Linking...' : 'Connect Bank Account'}
      </Button>
    </div>
  );
}
```

## Account List Component

Display all linked bank accounts:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Button, Chip } from '@commertize/ui';
import type { BankAccountResponse } from '@/lib/plaid';

export function BankAccountList() {
  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      try {
        const response = await fetch('/api/plaid/accounts?status=active');
        const data = await response.json();
        setAccounts(data.accounts);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, []);

  // Set primary account
  const setPrimary = async (accountId: string) => {
    try {
      const response = await fetch(`/api/plaid/accounts/${accountId}/set-primary`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh accounts
        const data = await response.json();
        setAccounts(prev =>
          prev.map(acc => ({
            ...acc,
            isPrimary: acc.id === accountId,
          }))
        );
      }
    } catch (error) {
      console.error('Failed to set primary:', error);
    }
  };

  // Remove account
  const removeAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to remove this bank account?')) return;

    try {
      const response = await fetch(`/api/plaid/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      }
    } catch (error) {
      console.error('Failed to remove account:', error);
    }
  };

  if (loading) return <div>Loading accounts...</div>;

  if (accounts.length === 0) {
    return <div>No bank accounts linked yet.</div>;
  }

  return (
    <div className="space-y-4">
      {accounts.map(account => (
        <div
          key={account.id}
          className="border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{account.accountName}</h3>
              {account.isPrimary && <Chip active>Primary</Chip>}
            </div>
            <p className="text-sm text-slate-600">
              {account.institutionName} {account.accountMask}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {account.accountType}
            </p>
          </div>

          <div className="flex gap-2">
            {!account.isPrimary && (
              <Button
                variant="outlined"
                onClick={() => setPrimary(account.id)}
              >
                Set as Primary
              </Button>
            )}
            <Button
              variant="text"
              onClick={() => removeAccount(account.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Account Selection Component

Select bank account for payment:

```typescript
'use client';

import { useState } from 'react';
import type { BankAccountResponse } from '@/lib/plaid';

interface AccountSelectorProps {
  accounts: BankAccountResponse[];
  onSelect: (accountId: string) => void;
  selectedId?: string;
}

export function AccountSelector({
  accounts,
  onSelect,
  selectedId,
}: AccountSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Select Payment Method
      </label>

      {accounts.map(account => (
        <button
          key={account.id}
          onClick={() => onSelect(account.id)}
          className={`
            w-full text-left p-4 border rounded-lg transition-colors
            ${selectedId === account.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-slate-300'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{account.accountName}</div>
              <div className="text-sm text-slate-600">
                {account.institutionName} {account.accountMask}
              </div>
            </div>
            {account.isPrimary && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Primary
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
```

## ACH Payment Processing

Process ACH payment with Stripe:

```typescript
// app/api/investments/[id]/pay/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEM } from '@/lib/db/orm';
import { BankAccount } from '@/lib/db/entities/BankAccount';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { accountId, amount } = await request.json();
    const { id: investmentId } = await params;

    // Get bank account
    const em = await getEM();
    const account = await em.findOne(BankAccount, { id: accountId });

    if (!account || account.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid bank account' },
        { status: 400 }
      );
    }

    // Get or create Stripe processor token
    let processorToken = account.stripeProcessorToken;

    if (!processorToken) {
      const tokenResponse = await fetch('/api/plaid/stripe-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const tokenData = await tokenResponse.json();
      processorToken = tokenData.processorToken;
    }

    // Get or create Stripe customer
    const customerId = 'cus_...';  // Get from user record

    // Create bank account source in Stripe
    const bankAccountSource = await stripe.customers.createSource(customerId, {
      source: processorToken,
    });

    // Create ACH debit (charge)
    const charge = await stripe.charges.create({
      amount: amount * 100,  // Convert dollars to cents
      currency: 'usd',
      customer: customerId,
      source: bankAccountSource.id,
      description: `Investment in property ${investmentId}`,
      metadata: {
        investmentId,
        accountId,
      },
    });

    // Store payment record in database
    // ...

    return NextResponse.json({
      success: true,
      chargeId: charge.id,
      amount: charge.amount / 100,
      status: charge.status,
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}
```

## Investment Flow

Complete investment flow with ACH payment:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@commertize/ui';
import { AccountSelector } from './AccountSelector';
import type { BankAccountResponse } from '@/lib/plaid';

interface InvestmentFlowProps {
  propertyId: string;
  amount: number;
}

export function InvestmentFlow({ propertyId, amount }: InvestmentFlowProps) {
  const [accounts, setAccounts] = useState<BankAccountResponse[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      const response = await fetch('/api/plaid/accounts?status=active');
      const data = await response.json();
      setAccounts(data.accounts);

      // Auto-select primary account
      const primary = data.accounts.find((acc: any) => acc.isPrimary);
      if (primary) setSelectedAccountId(primary.id);
    }

    fetchAccounts();
  }, []);

  // Process investment
  const handleInvest = async () => {
    if (!selectedAccountId) {
      setError('Please select a payment method');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/investments/${propertyId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          amount,
        }),
      });

      if (!response.ok) throw new Error('Payment failed');

      const data = await response.json();

      // Show success and redirect
      alert('Investment successful!');
      window.location.href = '/dashboard/investments';
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Investment Amount</h3>
        <p className="text-3xl font-bold text-green-600">
          ${amount.toLocaleString()}
        </p>
      </div>

      <AccountSelector
        accounts={accounts}
        selectedId={selectedAccountId}
        onSelect={setSelectedAccountId}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Button
          onClick={handleInvest}
          disabled={!selectedAccountId || processing}
          variant="primary"
          className="w-full"
        >
          {processing ? 'Processing...' : `Invest $${amount.toLocaleString()}`}
        </Button>

        <p className="text-xs text-slate-500 text-center">
          ACH transfers typically take 3-5 business days to process
        </p>
      </div>
    </div>
  );
}
```

## Dividend Distribution

Distribute dividends via ACH credit:

```typescript
// app/api/dividends/distribute/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getEM } from '@/lib/db/orm';
import { BankAccount } from '@/lib/db/entities/BankAccount';
import { User } from '@/lib/db/entities/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Distribute dividends to all investors
 */
export async function POST(request: NextRequest) {
  try {
    const { propertyId, totalAmount, investors } = await request.json();

    const em = await getEM();
    const results = [];

    for (const investor of investors) {
      try {
        // Get investor's primary account
        const account = await em.findOne(BankAccount, {
          user: investor.userId,
          isPrimary: true,
          status: 'active',
        });

        if (!account) {
          results.push({
            userId: investor.userId,
            success: false,
            error: 'No active bank account',
          });
          continue;
        }

        // Get Stripe processor token
        let processorToken = account.stripeProcessorToken;

        if (!processorToken) {
          const tokenResponse = await fetch('/api/plaid/stripe-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId: account.id }),
          });

          const tokenData = await tokenResponse.json();
          processorToken = tokenData.processorToken;
        }

        // Create bank account in Stripe
        const customerId = investor.stripeCustomerId;  // From user record

        const bankAccountSource = await stripe.customers.createSource(
          customerId,
          { source: processorToken }
        );

        // Create ACH credit (payout)
        const payout = await stripe.payouts.create({
          amount: Math.round(investor.dividendAmount * 100),
          currency: 'usd',
          destination: bankAccountSource.id,
          description: `Dividend payment for property ${propertyId}`,
          metadata: {
            propertyId,
            userId: investor.userId,
          },
        });

        results.push({
          userId: investor.userId,
          success: true,
          payoutId: payout.id,
          amount: investor.dividendAmount,
        });
      } catch (error: any) {
        results.push({
          userId: investor.userId,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Dividend distribution error:', error);
    return NextResponse.json(
      { error: 'Dividend distribution failed' },
      { status: 500 }
    );
  }
}
```

## Testing Examples

### Test Bank Account Linking

```typescript
// Test in sandbox environment
const testCredentials = {
  username: 'user_good',
  password: 'pass_good',
  institution: 'Chase',
};

// After linking, you should see accounts in database
// Query: SELECT * FROM bank_account WHERE user_id = 'your-user-id';
```

### Test Webhook Events

```typescript
// Trigger via Plaid Dashboard or curl

curl -X POST https://yourdomain.com/api/plaid/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "webhook_type": "ITEM",
    "webhook_code": "ITEM_LOGIN_REQUIRED",
    "item_id": "item_xxx",
    "environment": "sandbox"
  }'
```

These examples cover the most common use cases. Adapt them to your specific requirements!
