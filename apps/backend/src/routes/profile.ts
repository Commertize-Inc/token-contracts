import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getEM } from "../db";
import {
	User,
	Listing,
	BankAccount,
	KycStatus,
	UserRole,
	VerificationStatus,
} from "@commertize/data";
import { privyClient } from "../lib/privy";
import { HonoEnv } from "../types";

const profile = new Hono<HonoEnv>();

profile.use("*", authMiddleware);

profile.get("/", async (c) => {
	try {
		const privyId = c.get("userId"); // Auth middleware sets this
		const em = await getEM();
		const user = await em.findOne(
			User,
			{ privyId },
			{ populate: ["sponsor", "investor"] }
		);

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Fetch bank accounts
		const bankAccounts = await em.find(
			BankAccount,
			{ user: user.id, status: "active" },
			{ populate: ["plaidItem"] }
		);

		return c.json({
			kycStatus: user.kycStatus,
			isAdmin: user.isAdmin,
			isInvestor: user.investor?.status === VerificationStatus.VERIFIED,
			isSponsor: user.sponsor?.status === VerificationStatus.VERIFIED,
			investorStatus: user.investor?.status,
			sponsorStatus: user.sponsor?.status,
			businessName: user.sponsor?.businessName,
			sponsor: user.sponsor
				? {
					businessName: user.sponsor.businessName,
					status: user.sponsor.status,
				}
				: undefined,
			walletAddress: user.walletAddress,
			email: user.email,
			privyId: user.privyId,
			stripeCustomerId: user.stripeCustomerId,
			// Personal Info
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			phoneNumber: user.phoneNumber,
			bio: user.bio,
			avatarUrl: user.avatarUrl,
			createdAt:
				user.createdAt instanceof Date
					? user.createdAt.toISOString()
					: user.createdAt,
			bankAccounts: bankAccounts.map((account) => ({
				id: account.id,
				institutionName: account.institutionName,
				accountName: account.accountName,
				accountMask: account.accountMask,
				accountType: account.accountType,
				isPrimary: account.isPrimary,
				status: account.status,
				isStripeLinked: !!account.stripeBankAccountId,
			})),
		});
	} catch (error) {
		console.error("Error fetching profile:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

profile.put("/", async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const body = await c.req.json();
		const { username, email, bio, avatarUrl } = body;

		// Validation: Check if username is already taken by another user
		if (username && username !== user.username) {
			const existingUser = await em.findOne(User, { username });
			if (existingUser) {
				return c.json({ error: "Username already taken" }, 400);
			}
			user.username = username;
		}

		// Update allowed fields
		if (email !== undefined) user.email = email;
		if (bio !== undefined) user.bio = bio;
		if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

		await em.flush();

		return c.json({
			message: "Profile updated successfully",
			user: {
				username: user.username,
				email: user.email,
				bio: user.bio,
				avatarUrl: user.avatarUrl,
			},
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// ... imports
import { decrypt } from "../lib/security/encryption";
import { getPlaidClient } from "../lib/plaid/client";
import { PlaidItem } from "@commertize/data";

// ... existing code ...

profile.delete("/", async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Check if user is a sole sponsor of any listings
		const listingCount = await em.count(Listing, { sponsor: user });
		if (listingCount > 0) {
			return c.json(
				{
					error:
						"Cannot delete account while you are the sponsor of active properties. Please transfer ownership first.",
				},
				403
			);
		}

		// 1. Remove from Plaid (Revoke Access Tokens)
		try {
			const plaidItems = await em.find(PlaidItem, { user });

			const plaidClient = getPlaidClient();

			for (const item of plaidItems) {
				try {
					if (item.accessToken) {
						const accessToken = decrypt(item.accessToken);
						await plaidClient.itemRemove({ access_token: accessToken });
						console.info(`[Plaid] Removed item ${item.itemId} during user deletion`);
					}
				} catch (plaidError: any) {
					console.warn(
						`[Plaid] Failed to remove item ${item.itemId}:`,
						plaidError?.response?.data || plaidError.message
					);
					// Continue deletion even if Plaid fails (might be already removed)
				}
			}
		} catch (error) {
			console.error("Error cleaning up Plaid items:", error);
		}

		// 2. Delete from Privy
		try {
			await privyClient.deleteUser(privyId);
			console.info(`[Privy] Deleted user ${privyId}`);
		} catch (privyError) {
			console.error("Error deleting user from Privy:", privyError);
			// Continue to delete from DB even if Privy fails
		}

		// 3. Delete from Database
		// Cascade delete will remove PlaidItem, BankAccount, Investor, Sponsor, etc.
		await em.removeAndFlush(user);

		return c.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default profile;
