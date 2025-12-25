import { z } from "zod";

export const userProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required").optional(),
	lastName: z.string().min(1, "Last name is required").optional(),
	phoneNumber: z.string().min(10, "Valid phone number required").optional(),
	bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
	avatarUrl: z.string().url("Must be a valid URL").optional(),
	jobTitle: z.string().optional(),
	dateOfBirth: z.coerce.date().optional(),
	countryOfResidence: z.string().min(2).optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
