/**
 * Lifecycle status of a property or offering on the platform.
 * Tracks progression from initial creation through review, tokenization, funding, and potential rejection.
 */
export enum ListingStatus {
	/**
	 * Draft state where the sponsor is still editing details and the property is not yet submitted for platform review or visible to investors.
	 */
	DRAFT = "DRAFT",

	/**
	 * Property has been submitted and is awaiting internal compliance, legal, and quality review before being approved for a live offering.
	 */
	PENDING_REVIEW = "PENDING_REVIEW",

	/**
	 * Property has passed review and is approved to move forward toward tokenization and investor marketing, subject to the relevant exemption (for example, Reg D, Reg A, Reg CF, or Reg S).
	 */
	APPROVED = "APPROVED",

	/**
	 * The property’s ownership interests are being structured and minted as digital tokens or units, and smart contracts and legal entities are being finalized.
	 */
	TOKENIZING = "TOKENIZING",

	/**
	 * The property offering is live and open for investments; investors can subscribe for fractional interests under the applicable exemption (such as Rule 506(b), Rule 506(c), Reg A, Reg CF, or Reg S).
	 */
	ACTIVE = "ACTIVE",

	/**
	 * The offering has reached its maximum raise amount or allocation and is no longer accepting new investments, though it may continue operating and distributing yield.
	 */
	FULLY_FUNDED = "FULLY_FUNDED",

	/**
	 * The property or offering has been declined by the platform (for example, failing underwriting, compliance, or legal review) and will not proceed to investors.
	 */
	REJECTED = "REJECTED",

	/**
	 * The property or offering has been withdrawn by the sponsor and is no longer being considered for listing.
	 */
	WITHDRAWN = "WITHDRAWN",

	/**
	 * The property has been frozen by the admin, halting all activity.
	 */
	FROZEN = "FROZEN",
}

/**
 * Processing status of an individual investment transaction.
 * Indicates where a specific commitment stands from initiation through completion or failure.
 */
export enum InvestmentStatus {
	/**
	 * The investment has been created but is not fully executed yet; funding, signatures, or on‑chain settlement may still be pending.
	 */
	PENDING = "PENDING",

	/**
	 * The investment has been successfully executed, funds have settled (on‑chain or off‑chain), and the investor’s ownership tokens or units are recorded.
	 */
	COMPLETED = "COMPLETED",

	/**
	 * The investment could not be completed due to issues such as failed payment, compliance rejection, expired documents, or transaction errors, and no ownership was issued.
	 */
	FAILED = "FAILED",
}

/**
 * Classification of the investor profile.
 * Used to distinguish between natural persons and organizations participating in offerings.
 */
export enum InvestorType {
	/**
	 * A natural person investing in their own name, subject to individual accredited or non‑accredited status and related limits.
	 */
	INDIVIDUAL = "INDIVIDUAL",

	/**
	 * A legal entity such as a fund, family office, corporation, or trust investing on behalf of multiple stakeholders, often with different regulatory treatment from individuals.
	 */
	INSTITUTIONAL = "INSTITUTIONAL",
}

/**
 * High‑level regulatory accreditation category associated with the investor or investment.
 * Reflects whether the investor participates under U.S. Regulation D or Regulation S concepts.
 */
export enum AccreditationType {
	/**
	 * Investor is treated as accredited (or otherwise eligible) under Regulation D frameworks (for example, Rule 506(b) or Rule 506(c)) for U.S. offerings.
	 */
	REG_D = "REG_D",

	/**
	 * Investor participates under Regulation S–style offshore offering concepts, generally for non‑U.S. persons in offerings conducted outside the United States.
	 */
	REG_S = "REG_S",
}

/**
 * Types of legal and compliance documents associated with investors, listings, and offerings.
 * Used to drive document generation, uploads, and signature workflows.
 */
export enum LegalDocumentType {
	/**
	 * Tax documentation such as W‑9, W‑8, or other jurisdiction‑specific forms used for reporting and withholding.
	 */
	TAX_FORM = "TAX_FORM",

	/**
	 * Offering Memorandum, Private Placement Memorandum, or similar disclosure document describing the terms, risks, and structure of the offering.
	 */
	OM = "OM",

	/**
	 * Subscription Agreement or equivalent contract through which an investor commits capital and agrees to the terms of the securities purchase.
	 */
	SUBSCRIPTION_AGREEMENT = "SUBSCRIPTION_AGREEMENT",

	/**
	 * Documentation or certificates supporting an investor’s accredited or eligible status, such as verification letters, income or net‑worth evidence, or license‑based credentials.
	 */
	ACCREDITATION_PROOF = "ACCREDITATION_PROOF",
}

/**
 * Types of entities that other records can be associated with.
 * Enables generic relationships between documents, activities, and core domain objects.
 */
export enum EntityType {
	KYC = "KYC",
	INVESTOR = "INVESTOR",
	SPONSOR = "SPONSOR",
	LISTING = "LISTING",
}

/**
 * Types of entities that other records can be associated with.
 * Enables generic relationships between documents, activities, and core domain objects.
 */
export enum RelatedEntityType {
	/**
	 * A platform user, which may be an investor, sponsor, or admin account.
	 */
	USER = "USER",

	/**
	 * A property or property‑level offering, including its tokenized representation and related structures.
	 */
	PROPERTY = "PROPERTY",
}

/**
 * Types of securities offerings supported by the platform.
 */
export enum OfferingType {
	/**
	 * Rule 506(b) private placement under Regulation D.
	 * No general solicitation; unlimited accredited investors and limited non‑accredited investors, subject to specific conditions.
	 */
	RULE_506_B = "RULE_506_B",

	/**
	 * Rule 506(c) private placement under Regulation D.
	 * Permits general solicitation, but all purchasers must be accredited investors and the issuer must take reasonable steps to verify that status.
	 */
	RULE_506_C = "RULE_506_C",

	/**
	 * Regulation A (“Reg A” or “Reg A+”) exempt public offering.
	 * Allows eligible issuers to raise limited amounts from both accredited and non‑accredited investors, subject to tier‑based caps and disclosure/qualification requirements.
	 */
	REG_A = "REG_A",

	/**
	 * Regulation Crowdfunding (“Reg CF”) exempt offering.
	 * Enables eligible issuers to raise smaller amounts online from many investors through a registered intermediary, with strict offering limits, investor caps, and disclosure obligations.
	 */
	REG_CF = "REG_CF",

	/**
	 * Regulation S offshore offering.
	 * Provides a safe harbor for certain offers and sales of securities made outside the United States, subject to offshore transaction and no‑directed‑selling‑efforts conditions.
	 */
	REG_S = "REG_S",
}

/**
 * Methods used to verify an investor’s accreditation status.
 * Aligns with common approaches under Rule 506(c) and industry practice.
 */
export enum AccreditationVerificationMethod {
	/**
	 * Investor self‑attests to meeting accredited or eligibility criteria via questionnaires and representations, typically used where full third‑party verification is not required.
	 */
	SELF_CERTIFICATION = "SELF_CERTIFICATION",

	/**
	 * A letter from a qualified third party (such as a CPA, attorney, registered broker‑dealer, or investment adviser) confirming that the investor has been verified as accredited within a recent period.
	 */
	THIRD_PARTY_LETTER = "THIRD_PARTY_LETTER",

	/**
	 * Verification based primarily on income documentation such as tax returns, W‑2s, 1099s, or K‑1s to confirm the investor meets the income thresholds for accreditation.
	 */
	INCOME_PROOF = "INCOME_PROOF",

	/**
	 * Verification based on net‑worth documentation such as bank and brokerage statements, appraisals, and credit reports to demonstrate sufficient net worth for accreditation.
	 */
	NET_WORTH_PROOF = "NET_WORTH_PROOF",
}

/**
 * Self‑reported level of investment experience for suitability and risk profiling.
 * Helps tailor disclosures and assess whether complex offerings are appropriate.
 */
export enum InvestmentExperience {
	/**
	 * No prior investing experience beyond basic savings or equivalent, requiring enhanced education and disclosures.
	 */
	NONE = "NONE",

	/**
	 * Limited experience with basic products (for example, mutual funds or ETFs) and minimal exposure to private or alternative investments.
	 */
	LIMITED = "LIMITED",

	/**
	 * Meaningful experience investing in public markets or some private deals, with an understanding of volatility and illiquidity.
	 */
	GOOD = "GOOD",

	/**
	 * Extensive background in investing or professional finance, including familiarity with private placements, alternatives, and complex structures.
	 */
	EXTENSIVE = "EXTENSIVE",
}

/**
 * Investor’s stated tolerance for risk.
 * Used for suitability checks and matching investors with appropriate offerings.
 */
export enum RiskTolerance {
	/**
	 * Prefers capital preservation and lower volatility, generally favoring more stable and income‑oriented offerings.
	 */
	LOW = "LOW",

	/**
	 * Willing to accept moderate volatility and some risk of loss in exchange for higher return potential.
	 */
	MEDIUM = "MEDIUM",

	/**
	 * Comfortable with significant volatility and risk of loss, including higher‑risk private or leveraged strategies.
	 */
	HIGH = "HIGH",
}

/**
 * Commercial real estate asset types supported by the platform.
 * Categorizes properties by their primary use case and operational characteristics.
 */
export enum PropertyType {
	/**
	 * Multifamily residential properties (apartments, condos).
	 */
	MULTIFAMILY = "MULTIFAMILY",

	/**
	 * Office buildings and commercial office space.
	 */
	OFFICE = "OFFICE",

	/**
	 * Retail properties (shopping centers, standalone retail).
	 */
	RETAIL = "RETAIL",

	/**
	 * Industrial properties (warehouses, distribution centers, manufacturing).
	 */
	INDUSTRIAL = "INDUSTRIAL",

	/**
	 * Mixed-use properties combining multiple asset types.
	 */
	MIXED_USE = "MIXED_USE",

	/**
	 * Hospitality properties (hotels, resorts, short-term rentals).
	 */
	HOSPITALITY = "HOSPITALITY",

	/**
	 * Data centers and technology infrastructure.
	 */
	DATA_CENTERS = "DATA_CENTERS",

	/**
	 * Special purpose properties (self-storage, healthcare, student housing, etc.).
	 */
	SPECIAL_PURPOSE = "SPECIAL_PURPOSE",

	/**
	 * Other property types not fitting standard categories.
	 */
	OTHER = "OTHER",
}

/**
 * Legal structure of the issuing or owning entity for a property or offering.
 * Determines governance, tax treatment, and how interests are represented or tokenized.
 */
export enum EntityStructure {
	/**
	 * Limited Liability Company (LLC), commonly used for holding individual listings and issuing membership interests, including tokenized units.
	 */
	LLC = "LLC",

	/**
	 * C‑Corporation, often used for operating companies or specialized structures that may hold or manage real estate assets.
	 */
	C_CORP = "C_CORP",

	/**
	 * Limited Partnership (LP), frequently used in private funds and real estate syndications with separate general and limited partners.
	 */
	LP = "LP",

	/**
	 * Series LLC, where separate series can hold different listings or offerings with segregated assets and liabilities, useful for fractional and tokenized structures.
	 */
	SERIES_LLC = "SERIES_LLC",

	/**
	 * Real Estate Investment Trust (REIT), a vehicle that owns or finances income‑producing real estate and may have specific tax and distribution requirements.
	 */
	REIT = "REIT",

	/**
	 * Trust structure used to hold property or securities for beneficiaries, sometimes combined with tokenized representations of beneficial interests.
	 */
	TRUST = "TRUST",
}
