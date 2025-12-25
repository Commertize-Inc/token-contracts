import { z } from "zod";

export const waitlistInvestorSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(10, "Please enter a valid phone number"),
	country: z.string().min(2, "Please select your country"),
	city: z.string().min(2, "City is required"),
	investmentAmount: z.string().min(1, "Please specify your investment amount"),
	investmentTimeframe: z
		.string()
		.min(1, "Please select your investment timeframe"),
	propertyTypes: z
		.string()
		.min(1, "Please select property types you're interested in"),
	experience: z.string().min(1, "Please select your investment experience"),
	hearAboutUs: z.string().min(1, "Please let us know how you heard about us"),
	message: z.string().optional(),
});

export const waitlistSponsorSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	company: z.string().min(2, "Company/Ownership Entity is required"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(10, "Please enter a valid phone number"),
	propertyName: z.string().min(2, "Property name is required"),
	propertyLocation: z.string().min(2, "Property location is required"),
	assetType: z.string().min(1, "Please select an asset type"),
	estimatedValue: z.string().min(1, "Please enter estimated property value"),
	capitalNeeded: z.string().min(1, "Please enter capital needed"),
	timeline: z.string().min(1, "Please select a timeline"),
	hearAboutUs: z.string().min(1, "Please let us know how you heard about us"),
	additionalInfo: z.string().optional(),
});
