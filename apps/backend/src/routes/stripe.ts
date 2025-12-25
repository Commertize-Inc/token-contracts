import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import { getEM } from "../db";
import { User, BankAccount } from "@commertize/data";
import { getStripeClient } from "../lib/stripe/client";
import { privyClient } from "../lib/privy";
import { HonoEnv } from "../types";

const stripe = new Hono<HonoEnv>();

stripe.use("*", authMiddleware);

// POST /stripe/test-charge
stripe.post("/test-charge", async (c) => {
	try {
		const userId = c.get("userId"); // Privy ID
		const { accountId, amount = 100, type = "charge" } = await c.req.json();

		const em = await getEM();
		const user = await em.findOne(User, { privyId: userId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const account = await em.findOne(BankAccount, { id: accountId });
		if (!account) {
			return c.json({ error: "Account not found" }, 404);
		}

		if (account.user.id !== user.id) {
			return c.json({ error: "Forbidden" }, 403);
		}

		if (!account.stripeBankAccountId) {
			return c.json({ error: "Account not linked to Stripe" }, 400);
		}

		const stripeClient = getStripeClient();

		let result;
		if (type === "charge") {
			result = await stripeClient.charges.create({
				amount,
				currency: "usd",
				customer: user.stripeCustomerId!,
				source: account.stripeBankAccountId,
				description: "Test Charge from Dashboard",
			});
		} else {
			result = await stripeClient.payouts.create({
				amount,
				currency: "usd",
				destination: account.stripeBankAccountId,
				description: "Test Payout from Dashboard",
			});
		}

		return c.json({ success: true, result });
	} catch (error: any) {
		console.error("Stripe Test Error:", error);
		return c.json({ error: error.message }, 500);
	}
});

export default stripe;
