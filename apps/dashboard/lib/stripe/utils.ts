import { getStripeClient } from "./client";

export const createStripeCustomer = async (
	email: string,
	name?: string,
	metadata?: Record<string, string>
) => {
	const stripe = getStripeClient();
	const customer = await stripe.customers.create({
		email,
		name,
		metadata,
	});
	return customer;
};

export const createStripeBankAccount = async (
	customerId: string,
	processorToken: string
) => {
	const stripe = getStripeClient();
	const source = await stripe.customers.createSource(customerId, {
		source: processorToken,
	});
	return source;
};
