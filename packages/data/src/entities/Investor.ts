import { Embeddable, Property, Enum } from "@mikro-orm/core";

import {
	InvestorType,
	AccreditationType,
	AccreditationVerificationMethod,
	InvestmentExperience,
	RiskTolerance,
} from "../enums/entities";

import { VerificationStatus } from "../enums/onboarding";

@Embeddable()
export class Investor {
	@Enum({
		items: () => VerificationStatus,
		default: VerificationStatus.UNVERIFIED,
	})
	status: VerificationStatus = VerificationStatus.UNVERIFIED;

	@Enum({ items: () => InvestorType, default: InvestorType.INDIVIDUAL })
	type: InvestorType = InvestorType.INDIVIDUAL;

	@Enum({ items: () => AccreditationType, default: AccreditationType.REG_D })
	accreditationType: AccreditationType = AccreditationType.REG_D;

	@Enum({ items: () => AccreditationVerificationMethod, nullable: true })
	verificationMethod?: AccreditationVerificationMethod;

	@Property({ type: "date", nullable: true })
	verifiedAt?: Date;

	@Enum({ items: () => InvestmentExperience, nullable: true })
	investmentExperience?: InvestmentExperience;

	@Enum({ items: () => RiskTolerance, nullable: true })
	riskTolerance?: RiskTolerance;

	@Property({ type: "string", nullable: true })
	liquidNetWorth?: string;

	@Property({ type: "string", nullable: true })
	taxCountry?: string;

	@Property({ type: "jsonb", nullable: true })
	accreditationDocuments?: string[];

	// DocuSeal Integration
	@Property({ type: "string", nullable: true })
	docusealSubmissionId?: string;

	@Property({ type: "string", nullable: true })
	docusealTemplateId?: string;

	@Property({ type: "jsonb", nullable: true })
	preferences: any = {};

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
