import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { BankAccount } from "@/lib/db/entities/BankAccount";
import { User } from "@/lib/db/entities/User";
import { PlaidItem } from "@/lib/db/entities/PlaidItem";
import { privyClient } from "@/lib/privy/client";
import { getPlaidClient } from "@/lib/plaid/client";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const privyToken = request.cookies.get("privy-token")?.value;

		if (!privyToken) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const claims = await privyClient.verifyAuthToken(privyToken);
		const privyId = claims.userId;

		const em = await getEM();

		const user = await em.findOne(User, { privyId });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const bankAccount = await em.findOne(
			BankAccount,
			{
				id,
				user: user,
			},
			{ populate: ["plaidItem"] }
		);

		if (!bankAccount) {
			return NextResponse.json(
				{ error: "Bank account not found" },
				{ status: 404 }
			);
		}

		// Soft delete the account
		bankAccount.status = "inactive";
		bankAccount.isPrimary = false;

		// Check if there are other active accounts for this Plaid Item
		if (bankAccount.plaidItem) {
			const plaidItem = bankAccount.plaidItem;

			// Count other active accounts for this item
			const activeAccountsCount = await em.count(BankAccount, {
				plaidItem: plaidItem,
				status: "active",
				id: { $ne: bankAccount.id }, // Exclude the one we just deactivated
			});

			// If no other active accounts, revoke Plaid access
			if (activeAccountsCount === 0) {
				try {
					const plaidClient = getPlaidClient();
					await plaidClient.itemRemove({
						access_token: plaidItem.accessToken,
					});

					// Mark PlaidItem as inactive
					plaidItem.status = "inactive";
					console.log(`Revoked Plaid access for item ${plaidItem.id}`);
				} catch (plaidError) {
					console.error("Error revoking Plaid access:", plaidError);
					// Continue even if Plaid revocation fails, but log it
				}
			}
		}

		await em.flush();

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error disconnecting bank account:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
