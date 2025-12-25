export enum OnboardingStep {
	ROLE_SELECTION = "role_selection",
	PROFILE = "profile",
	INVESTOR_PROFILE = "investor_profile",
	QUESTIONNAIRE = "questionnaire",
	IDENTITY = "identity",
	ACCREDITATION = "accreditation",
	ACH = "ach",
	COMPLETED = "completed",
	SPONSOR_KYB = "sponsor_kyb",
}

export enum KycStatus {
	NOT_STARTED = "not_started",
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
	DOCUMENTS_REQUIRED = "documents_required",
}

export enum UserRole {
	INVESTOR = "investor",
	SPONSOR = "sponsor",
	ADMIN = "admin",
	SPONSOR_INVESTOR = "sponsor_investor",
}

export enum VerificationStatus {
	VERIFIED = "verified",
	PENDING = "pending",
	UNVERIFIED = "unverified",
	REJECTED = "rejected",
	NOT_STARTED = "NOT_STARTED",
}
