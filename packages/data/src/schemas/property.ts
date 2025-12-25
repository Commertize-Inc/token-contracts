import { z } from "zod";
import { EntityStructure, OfferingType } from "../enums"; // Ensure enums are imported

// Schema for creating/updating a property
export const createListingSchema = z.object({
	name: z.string().min(1, "Name is required"),
	address: z.string().min(1, "Address is required"),
	city: z.string().min(1, "City is required"),
	state: z.string().min(2, "State is required"),
	zipCode: z.string().min(5, "Zip Code is required"),
	propertyType: z.string().min(1, "Property Type is required"),

	// Comprehensive financial inputs
	financials: z.object({
		// Deal economics
		purchasePrice: z.number().min(0, "Purchase price must be positive"),
		totalCapitalization: z.number().min(0, "Total capitalization must be positive"),

		// Debt terms
		loanAmount: z.number().min(0, "Loan amount must be positive"),
		loanToValue: z.number().min(0).max(1, "LTV must be between 0 and 1"),
		interestRate: z.number().min(0).max(1, "Interest rate must be between 0 and 1"),
		amortizationYears: z.number().int().min(0).optional().nullable(),
		interestOnlyYears: z.number().int().min(0).optional().nullable(),
		loanTermYears: z.number().int().min(1, "Loan term must be at least 1 year"),

		// Sources & uses
		equityRequired: z.number().min(0, "Equity required must be positive"),
		closingCosts: z.number().min(0, "Closing costs must be positive"),
		acquisitionFee: z.number().min(0, "Acquisition fee must be positive"),
		capexBudget: z.number().min(0, "CapEx budget must be positive"),
		workingCapital: z.number().min(0, "Working capital must be positive"),
		reservesInitial: z.number().min(0, "Initial reserves must be positive"),

		// Operating history (current stabilized year)
		effectiveGrossIncome: z.number().min(0, "EGI must be positive"),
		operatingExpenses: z.number().min(0, "Operating expenses must be positive"),
		noi: z.number().min(0, "NOI must be positive"),
		occupancyRate: z.number().min(0).max(1, "Occupancy rate must be between 0 and 1"),

		// Pro forma & exit
		annualRentGrowth: z.number().min(0).max(1, "Rent growth must be between 0 and 1"),
		annualExpenseGrowth: z.number().min(0).max(1, "Expense growth must be between 0 and 1"),
		holdPeriodYears: z.number().int().min(1, "Hold period must be at least 1 year"),
		exitCapRate: z.number().min(0).max(1, "Exit cap rate must be between 0 and 1"),
		exitSalePrice: z.number().min(0, "Exit sale price must be positive"),

		// Investor return targets (summary)
		targetCoCYear1: z.number().min(0).max(1, "Target CoC Year 1 must be between 0 and 1"),
		targetAvgCoC: z.number().min(0).max(1, "Target Avg CoC must be between 0 and 1"),
		targetIRR: z.number().min(0).max(1, "Target IRR must be between 0 and 1"),
		targetEquityMultiple: z.number().min(1, "Target equity multiple must be at least 1"),

		// Distribution policy
		preferredReturn: z.number().min(0).max(1, "Preferred return must be between 0 and 1"),
		sponsorPromote: z.number().min(0).max(1, "Sponsor promote must be between 0 and 1"),
		payoutRatioOfFCF: z.number().min(0).max(1, "Payout ratio must be between 0 and 1"),
		distributionFrequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
	}),

	// Tokenomics and fractionalization parameters
	tokenomics: z.object({
		// Token supply & pricing
		totalTokenSupply: z.number().int().min(1, "Total token supply must be at least 1"),
		tokensForInvestors: z.number().int().min(1, "Investor tokens must be at least 1"),
		tokensForSponsor: z.number().int().min(0, "Sponsor tokens must be positive"),
		tokensForTreasury: z.number().int().min(0, "Treasury tokens must be positive"),

		tokenPrice: z.number().min(0, "Token price must be positive"),
		minInvestmentTokens: z.number().int().min(1, "Min investment must be at least 1 token"),
		maxInvestmentTokens: z.number().int().min(1).optional().nullable(),

		// Rights / constraints
		lockupMonths: z.number().int().min(0).optional().nullable(),
		transferRestricted: z.boolean().default(false),
	}),

	offeringType: z.nativeEnum(OfferingType).default(OfferingType.RULE_506_B),
	entityStructure: z.nativeEnum(EntityStructure).optional(),
	description: z.string().optional(),
	constructionYear: z
		.number({ invalid_type_error: "Must be a number" })
		.int()
		.min(1800)
		.max(new Date().getFullYear() + 5)
		.optional(),
	totalUnits: z
		.number({ invalid_type_error: "Must be a number" })
		.int()
		.min(1)
		.optional(),
	images: z.array(z.string().url("Must be a valid URL")).optional().default([]),
	documents: z
		.array(z.string().url("Must be a valid URL"))
		.optional()
		.default([]),
	highlights: z
		.array(z.string().min(1, "Highlight cannot be empty"))
		.optional()
		.default([]),
});

// Schema for updating a property (partial)
export const updateListingSchema = createListingSchema.partial();

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// Schema for admin review
export const reviewListingSchema = z
	.object({
		decision: z.enum(["APPROVE", "REJECT"]),
		rejectionReason: z.string().optional(),
	})
	.refine((data) => data.decision !== "REJECT" || !!data.rejectionReason, {
		message: "Rejection reason is required when rejecting",
		path: ["rejectionReason"],
	});
