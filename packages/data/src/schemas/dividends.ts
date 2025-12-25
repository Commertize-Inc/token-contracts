import { z } from "zod";

export const createDistributionSchema = z.object({
	listingId: z.string().uuid("Invalid Listing ID"),
	amount: z.number().positive("Amount must be positive"),
	distributionDate: z.coerce.date(),
});

export type CreateDistributionInput = z.infer<typeof createDistributionSchema>;
