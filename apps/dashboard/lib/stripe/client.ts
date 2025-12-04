import Stripe from "stripe";

export const getStripeClient = () => {
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
	if (!stripeSecretKey) {
		throw new Error("STRIPE_SECRET_KEY is not defined");
	}

	return new Stripe(stripeSecretKey, {
		apiVersion: "2025-11-17.clover",
		typescript: true,
	});
};
