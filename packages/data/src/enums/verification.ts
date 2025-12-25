/**
 * Status of a verification request (e.g., for sponsor profile updates).
 */
export enum VerificationRequestStatus {
	/**
	 * Request is pending review by an admin.
	 */
	PENDING = "PENDING",

	/**
	 * Request has been approved.
	 */
	APPROVED = "APPROVED",

	/**
	 * Request has been rejected.
	 */
	REJECTED = "REJECTED",

	/**
	 * Request was cancelled by the user.
	 */
	CANCELLED = "CANCELLED",
}
