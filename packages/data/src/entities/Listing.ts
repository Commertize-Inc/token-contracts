import {
	Entity,
	Enum,
	ManyToOne,
	Property,
	PrimaryKey,
	OneToMany,
	Collection,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { Dividend } from "./Dividend";
import {
	EntityStructure,
	OfferingType,
	ListingStatus,
} from "../enums/entities";
import { Sponsor } from "./Sponsor";

export type ListingFinancials = {
	// Deal economics
	purchasePrice: number; // total acquisition price
	totalCapitalization: number; // equity + debt, incl. fees

	// Debt terms
	loanAmount: number;
	loanToValue: number; // 0–1
	interestRate: number; // 0–1
	amortizationYears?: number | null;
	interestOnlyYears?: number | null;
	loanTermYears: number;

	// Sources & uses
	equityRequired: number;
	closingCosts: number;
	acquisitionFee: number;
	capexBudget: number;
	workingCapital: number;
	reservesInitial: number;

	// Operating history (current stabilized year)
	effectiveGrossIncome: number;
	operatingExpenses: number;
	noi: number; // can be derived but kept as input for now
	occupancyRate: number; // 0–1

	// Pro forma & exit
	annualRentGrowth: number; // 0–1
	annualExpenseGrowth: number; // 0–1
	holdPeriodYears: number;
	exitCapRate: number; // 0–1
	exitSalePrice: number;

	// Investor return targets (summary)
	targetCoCYear1: number; // cash‑on‑cash, 0–1
	targetAvgCoC: number; // 0–1
	targetIRR: number; // 0–1
	targetEquityMultiple: number;

	// Distribution policy
	preferredReturn: number; // 0–1
	sponsorPromote: number; // 0–1 of upside above pref
	payoutRatioOfFCF: number; // 0–1 of distributable CF paid out
	distributionFrequency: "MONTHLY" | "QUARTERLY" | "SEMI_ANNUALLY" | "ANNUALLY";
};

export type Tokenomics = {
	// Token supply & pricing (inputs)
	totalTokenSupply: number; // total tokens minted
	tokensForInvestors: number; // tokens in this offering
	tokensForSponsor: number; // sponsor/GP tokens
	tokensForTreasury: number; // platform/treasury tokens

	tokenPrice: number; // price per token in raise currency
	minInvestmentTokens: number;
	maxInvestmentTokens?: number | null;

	// Rights / constraints (not all modeled here)
	lockupMonths?: number | null;
	transferRestricted: boolean;
};

/**
 * Entity representing a real estate listing or offering on the platform.
 * Contains property details, financial data, tokenomics, and status.
 */
@Entity({ tableName: "listing" })
export class Listing {
	@PrimaryKey()
	id: string = v4();

	@ManyToOne(() => Sponsor)
	sponsor!: Sponsor;

	@Enum({
		items: () => ListingStatus,
		index: true,
		default: ListingStatus.DRAFT,
	})
	status: ListingStatus = ListingStatus.DRAFT;

	@Enum({ items: () => OfferingType, default: OfferingType.RULE_506_B })
	offeringType: OfferingType = OfferingType.RULE_506_B;

	@Property({ type: "string" })
	name!: string;

	@Property({ type: "string" })
	address!: string;

	@Property({ type: "string" })
	city!: string;

	@Property({ type: "string" })
	state!: string;

	@Property({ type: "string" })
	zipCode!: string;

	@Property({ type: "string" })
	propertyType!: string;

	@Enum({ items: () => EntityStructure, nullable: true })
	entityStructure?: EntityStructure;

	/**
	 * Structured financial inputs used to derive investor metrics and
	 * distributions to token holders.
	 */
	@Property({ type: "jsonb" })
	financials!: ListingFinancials;

	/**
	 * Tokenomics and fractionalization parameters for the PropertyToken.
	 */
	@Property({ type: "jsonb" })
	tokenomics!: Tokenomics;

	@Property({ type: "array", default: [] })
	images: string[] = [];

	@Property({ type: "jsonb", default: [] })
	documents: string[] = [];

	/** Smart contract address for the tokenized property (if applicable). */
	@Property({ type: "string", nullable: true })
	tokenContractAddress?: string;

	@Property({ type: "text", nullable: true })
	description?: string;

	@Property({ type: "array", default: [] })
	highlights: string[] = [];

	@Property({ type: "integer", nullable: true })
	constructionYear?: number;

	@Property({ type: "integer", nullable: true })
	totalUnits?: number;

	@OneToMany(() => Dividend, (dividend) => dividend.listing)
	dividends: Collection<Dividend> = new Collection<Dividend>(this);

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();

	//
	// Derived / computed fields (not persisted)
	//

	/** Implied equity valuation based on tokenomics. */
	@Property({ persist: false, type: "number" })
	get impliedEquityValuation(): number | null {
		if (!this.tokenomics) return null;
		const { tokensForInvestors, tokenPrice } = this.tokenomics;
		if (!tokensForInvestors || !tokenPrice) return null;
		return tokensForInvestors * tokenPrice;
	}

	/** Fraction of total tokens held by investors (0–1). */
	@Property({ persist: false, type: "number" })
	get investorTokenShare(): number | null {
		if (!this.tokenomics) return null;
		const { totalTokenSupply, tokensForInvestors } = this.tokenomics;
		if (!totalTokenSupply) return null;
		return tokensForInvestors / totalTokenSupply;
	}

	/** Fraction of total tokens held by sponsor (0–1). */
	@Property({ persist: false, type: "number" })
	get sponsorTokenShare(): number | null {
		if (!this.tokenomics) return null;
		const { totalTokenSupply, tokensForSponsor } = this.tokenomics;
		if (!totalTokenSupply) return null;
		return tokensForSponsor / totalTokenSupply;
	}

	/** Simple derived cap rate from current NOI and purchase price, if both given. */
	@Property({ persist: false, type: "number" })
	get derivedCapRate(): number | null {
		if (!this.financials) return null;
		const { noi, purchasePrice } = this.financials;
		if (!purchasePrice) return null;
		return noi / purchasePrice;
	}

	/** Simple year‑1 cash‑on‑cash based on NOI, debt service, and equity. */
	@Property({ persist: false, type: "number" })
	get year1CashOnCash(): number | null {
		if (!this.financials) return null;
		const { noi, interestRate, loanAmount, equityRequired } = this.financials;
		if (!equityRequired) return null;
		// Very rough: interest‑only debt service = rate * loanAmount.
		const annualDebtService = interestRate * loanAmount;
		const cashFlowToEquity = noi - annualDebtService;
		return cashFlowToEquity / equityRequired;
	}
}
