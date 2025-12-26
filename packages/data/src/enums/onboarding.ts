/**
 * Steps in the user onboarding process.
 * Tracks the user's progress through account creation and verification.
 */
export enum OnboardingStep {
	/**
	 * Initial step where the user selects their primary role (e.g., Investor or Sponsor).
	 */
	ROLE_SELECTION = "role_selection",

	/**
	 * User completes their basic profile information.
	 */
	PROFILE = "profile",

	/**
	 * Investor-specific profile details.
	 */
	INVESTOR_PROFILE = "investor_profile",

	/**
	 * Regulation-required questionnaire for investors.
	 */
	QUESTIONNAIRE = "questionnaire",

	/**
	 * Identity verification step (KYC).
	 */
	IDENTITY = "identity",

	/**
	 * Accreditation verification step for accredited investors.
	 */
	ACCREDITATION = "accreditation",

	/**
	 * Bank account setup (ACH) for fund transfers.
	 */
	ACH = "ach",

	/**
	 * Onboarding process is fully complete.
	 */
	COMPLETED = "completed",

	/**
	 * Business verification (KYB) step for sponsors.
	 */
	SPONSOR_KYB = "sponsor_kyb",
}

/**
 * Status of Know Your Customer (KYC) verification.
 */
export enum KycStatus {
	/**
	 * KYC process has not been initiated.
	 */
	NOT_STARTED = "not_started",

	/**
	 * KYC verification is in progress or awaiting review.
	 */
	PENDING = "pending",

	/**
	 * KYC verification has been successfully approved.
	 */
	APPROVED = "approved",

	/**
	 * KYC verification has been rejected.
	 */
	REJECTED = "rejected",

	/**
	 * Additional documents are required to complete KYC verification.
	 */
	DOCUMENTS_REQUIRED = "documents_required",
}

/**
 * Roles a user can have within the platform.
 */
export enum UserRole {
	/**
	 * User looking to invest in properties.
	 */
	INVESTOR = "investor",

	/**
	 * User looking to list properties and raise funds.
	 */
	SPONSOR = "sponsor",

	/**
	 * Platform administrator with elevated privileges.
	 */
	ADMIN = "admin",

	/**
	 * User who is both a sponsor and an investor.
	 */
	SPONSOR_INVESTOR = "sponsor_investor",
}

/**
 * Generic verification status used for various checks (e.g., email, phone).
 */
export enum VerificationStatus {
	/**
	 * Verification successful.
	 */
	VERIFIED = "verified",

	/**
	 * Verification is pending.
	 */
	PENDING = "pending",

	/**
	 * Verification has not been completed.
	 */
	UNVERIFIED = "unverified",

	/**
	 * Verification failed or was rejected.
	 */
	REJECTED = "rejected",

	/**
	 * Verification process has not started.
	 */
	NOT_STARTED = "NOT_STARTED",

	/**
	 * Verification requires user action (e.g. resubmit documents).
	 */
	ACTION_REQUIRED = "action_required",
}
