import { z } from "zod";

export const createDividendSchema = z.object({
	listingId: z.string().uuid("Invalid Listing ID"),
	amount: z.number().positive("Amount must be positive"),
	distributionDate: z.coerce.date(),
});

export type CreateDividendInput = z.infer<typeof createDividendSchema>;
