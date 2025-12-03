import { NextRequest, NextResponse } from 'next/server';
import { privyClient } from '@/lib/privy/client';
import { getEM } from '@/lib/db/orm';
import { User } from '@/lib/db/entities/User';
import { BankAccount } from '@/lib/db/entities/BankAccount';
import { sanitizeBankAccount, getPrimaryAccount } from '@/lib/plaid';

/**
 * GET: Get single bank account by ID
 *
 * @param request - Request object
 * @param params - Route params with account id
 * @returns Bank account details
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get('privy-token')?.value;
		if (!privyToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const { id } = await params;

		// Database query
		const em = await getEM();

		const user = await em.findOne(User, { privyId });
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const account = await em.findOne(BankAccount, { id }, {
			populate: ['plaidItem'],
		});

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Verify ownership
		if (account.user.id !== user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Return sanitized data
		return NextResponse.json({ account: sanitizeBankAccount(account) });
	} catch (error: any) {
		console.error('[Get Account] Error:', {
			message: error?.message,
			stack: error?.stack,
		});

		return NextResponse.json(
			{ error: 'Failed to fetch bank account' },
			{ status: 500 }
		);
	}
}

/**
 * DELETE: Remove/unlink a bank account
 *
 * Performs soft delete by setting status to 'inactive'
 * If deleted account was primary, assigns a new primary account
 *
 * @param request - Request object
 * @param params - Route params with account id
 * @returns Success status
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Verify authentication
		const privyToken = request.cookies.get('privy-token')?.value;
		if (!privyToken) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const { id } = await params;

		// Database operations
		const em = await getEM();

		const user = await em.findOne(User, { privyId });
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const account = await em.findOne(BankAccount, { id });

		if (!account) {
			return NextResponse.json({ error: 'Account not found' }, { status: 404 });
		}

		// Verify ownership
		if (account.user.id !== user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const wasPrimary = account.isPrimary;

		// Soft delete - set status to inactive
		account.status = 'inactive';
		account.isPrimary = false;
		account.updatedAt = new Date();

		await em.persistAndFlush(account);

		console.log('[Delete Account] Account deactivated:', {
			accountId: id,
			wasPrimary,
		});

		// If this was the primary account, assign a new primary
		if (wasPrimary) {
			const otherAccounts = await em.find(BankAccount, {
				user: user.id,
				status: 'active',
			});

			if (otherAccounts.length > 0) {
				const newPrimary = getPrimaryAccount(otherAccounts);
				if (newPrimary) {
					newPrimary.isPrimary = true;
					await em.persistAndFlush(newPrimary);

					console.log('[Delete Account] New primary assigned:', {
						accountId: newPrimary.id,
					});
				}
			}
		}

		return NextResponse.json({
			success: true,
			message: 'Bank account removed successfully',
		});
	} catch (error: any) {
		console.error('[Delete Account] Error:', {
			message: error?.message,
			stack: error?.stack,
		});

		return NextResponse.json(
			{ error: 'Failed to remove bank account' },
			{ status: 500 }
		);
	}
}
