import { NextRequest, NextResponse } from 'next/server';
import { ProcessorTokenCreateRequest } from 'plaid';
import { privyClient } from '@/lib/privy/client';
import { plaidClient } from '@/lib/plaid/client';
import { getEM } from '@/lib/db/orm';
import { User } from '@/lib/db/entities/User';
import { BankAccount } from '@/lib/db/entities/BankAccount';

/**
 * POST: Create Stripe processor token for ACH payments
 *
 * This token is used with Stripe's API to create a bank account
 * payment source and process ACH debits/credits.
 *
 * Flow:
 * 1. Verify authentication
 * 2. Get bank account and verify ownership
 * 3. Get PlaidItem to access the access_token
 * 4. Create processor token via Plaid
 * 5. Store token in BankAccount
 * 6. Return token for Stripe API usage
 *
 * @param request - Request with { accountId: string }
 * @returns Stripe processor token
 */
export async function POST(request: NextRequest) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get('privy-token')?.value;
		if (!privyToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		// Parse request body
		const { accountId } = await request.json();
		if (!accountId) {
			return NextResponse.json(
				{ error: 'Missing accountId' },
				{ status: 400 }
			);
		}

		console.log('[Stripe Token] Creating processor token:', {
			accountId,
			userId: privyId,
		});

		// Database operations
		const em = await getEM();

		const user = await em.findOne(User, { privyId });
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const account = await em.findOne(
			BankAccount,
			{ id: accountId },
			{ populate: ['plaidItem'] }
		);

		if (!account) {
			return NextResponse.json(
				{ error: 'Bank account not found' },
				{ status: 404 }
			);
		}

		// Verify ownership
		if (account.user.id !== user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Verify account is active
		if (account.status !== 'active') {
			return NextResponse.json(
				{ error: 'Bank account is not active' },
				{ status: 400 }
			);
		}

		// Check if we already have a processor token
		if (account.stripeProcessorToken) {
			console.log('[Stripe Token] Using existing token');

			// Update last used timestamp
			account.stripeTokenLastUsedAt = new Date();
			await em.persistAndFlush(account);

			return NextResponse.json({
				processorToken: account.stripeProcessorToken,
				accountId: account.id,
			});
		}

		// Get PlaidItem for access token
		const plaidItem = account.plaidItem;

		// Get decrypted access token
		const accessToken = plaidItem.getDecryptedAccessToken();

		// Create processor token via Plaid
		const processorTokenRequest: ProcessorTokenCreateRequest = {
			access_token: accessToken,
			account_id: account.plaidAccountId,
			processor: 'stripe' as any,  // Stripe not in enum yet, but supported by API
		};

		const response = await plaidClient.processorTokenCreate(
			processorTokenRequest
		);

		const processorToken = response.data.processor_token;

		console.log('[Stripe Token] Processor token created:', {
			accountId: account.id,
			hasToken: !!processorToken,
		});

		// Store processor token in database with audit trail
		account.stripeProcessorToken = processorToken;
		account.stripeTokenCreatedAt = new Date();
		account.stripeTokenLastUsedAt = new Date();
		account.updatedAt = new Date();

		await em.persistAndFlush(account);

		return NextResponse.json({
			processorToken,
			accountId: account.id,
		});
	} catch (error: any) {
		console.error('[Stripe Token] Error:', {
			message: error?.message,
			response: error?.response?.data,
			stack: error?.stack,
		});

		const isDevelopment = process.env.NODE_ENV === 'development';
		return NextResponse.json(
			{
				error: 'Failed to create Stripe processor token',
				...(isDevelopment && {
					details: {
						message: error?.message,
						plaidError: error?.response?.data,
					},
				}),
			},
			{ status: error?.response?.status || 500 }
		);
	}
}
