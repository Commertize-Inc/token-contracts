import { z } from "zod";

export const kybSchema = z.object({
	businessName: z.string().min(1, "Business Name is required"),
	businessType: z.string().optional().default("LLC"),
	ein: z.string().min(9, "EIN must be at least 9 characters"),
	address: z.string().min(1, "Address is required"),
	bio: z.string().optional(),
	documents: z.array(z.string()).optional(),
	beneficialOwners: z
		.array(
			z.object({
				name: z.string().min(1),
				dob: z.string(),
				ssn: z.string(),
			})
		)
		.optional(),
	walletAddress: z.string().optional(),
});
