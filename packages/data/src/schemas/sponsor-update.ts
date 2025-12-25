import { z } from "zod";

export const sponsorUpdateRequestSchema = z.object({
	businessName: z.string().min(1).optional(),
	businessType: z
		.enum(["LLC", "C_CORP", "S_CORP", "PARTNERSHIP", "SOLE_PROP"])
		.optional(),
	ein: z.string().min(1).optional(),
	address: z.string().min(1).optional(),
	documents: z.array(z.string().url()).optional(),
});

export const adminReviewSchema = z.object({
	adminNotes: z.string().optional(),
});

export type SponsorUpdateRequestInput = z.infer<
	typeof sponsorUpdateRequestSchema
>;
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;
