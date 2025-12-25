import { z } from "zod";
import {
	InvestmentExperience,
	RiskTolerance,
	AccreditationType,
} from "../enums";

export const investIntentSchema = z.object({
	propertyId: z.string().uuid("Invalid Property ID"),
	amount: z.number().positive("Investment amount must be positive"),
	agreedToTerms: z.boolean().refine((val) => val === true, {
		message: "You must agree to the terms.",
	}),
});

export const investorProfileSchema = z.object({
	investmentExperience: z.nativeEnum(InvestmentExperience),
	riskTolerance: z.nativeEnum(RiskTolerance),
	liquidNetWorth: z.string().min(1, "Please select a net worth range"),
	taxCountry: z.string().min(2, "Country code must be at least 2 characters"),
	accreditationType: z.nativeEnum(AccreditationType),
	documents: z.array(z.string()).optional(),
});
