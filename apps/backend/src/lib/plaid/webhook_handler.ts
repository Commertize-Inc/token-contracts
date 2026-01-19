import { KycStatus, User } from "@commertize/data";
import { getEM } from "../../db";
import { wrap } from "@mikro-orm/core";
import { TokenService } from "../../services/token";

export interface IdentityVerificationWebhook {
	webhook_type: "IDENTITY_VERIFICATION";
	webhook_code: "STATUS_UPDATED" | "RETRIED" | "COMPLETED";
	identity_verification_id: string;
	status: string;
}

export interface WatchlistScreeningWebhook {
	webhook_type: "WATCHLIST_SCREENING";
	webhook_code: "NEW_PARTICIPANT_SCREENING" | "PARTICIPANT_SCREENING_UPDATED";
	watchlist_screening_id: string;
	status: string;
}

export const handleIdentityVerificationWebhook = async (
	event: IdentityVerificationWebhook
) => {
	const em = await getEM();

	// Find user by session ID
	const user = await em.findOne(
		User,
		{
			plaidIdvSessionId: event.identity_verification_id,
		},
		{ populate: ["investor"] }
	);

	if (!user) {
		console.warn(
			`[Plaid Webhook] No user found for IDV session: ${event.identity_verification_id}`
		);
		return;
	}

	// Update KYC status based on Plaid status
	let kycStatus = user.kycStatus;
	if (event.status === "success") {
		kycStatus = KycStatus.APPROVED;
	} else if (
		event.status === "failed" ||
		event.status === "expired" ||
		event.status === "canceled"
	) {
		kycStatus = KycStatus.REJECTED;
	}

	if (kycStatus !== user.kycStatus) {
		user.kycStatus = kycStatus;
		user.updatedAt = new Date();

		// Sync with On-chain Identity Registry if Approved
		if (kycStatus === KycStatus.APPROVED && user.walletAddress) {
			try {
				console.log(
					`[Plaid Webhook] User ${user.id} approved. Registering on-chain identity...`
				);
				const country = user.investor?.taxCountry === "US" ? 840 : 0;
				// We don't await this to block the webhook response?
				// Actually, we should try to ensure it happens. But if it fails, we shouldn't fail the DB update?
				// Better to await and log error if fail.
				await TokenService.registerIdentity(
					user.walletAddress,
					country,
					user.privyId
				);
			} catch (e) {
				console.error(
					`[Plaid Webhook] Failed to register identity for ${user.id}:`,
					e
				);
			}
		}

		await em.persist(user).flush();
	}
};

export const handleWatchlistScreeningWebhook = async (
	event: WatchlistScreeningWebhook
) => {
	const em = await getEM();

	// Find user by watchlist ID
	const user = await em.findOne(User, {
		plaidWatchlistScreeningId: event.watchlist_screening_id,
	});

	if (!user) {
		console.warn(
			`[Plaid Webhook] No user found for Watchlist Screening ID: ${event.watchlist_screening_id}`
		);
		return;
	}

	// Update watchlist status
	user.plaidWatchlistScreeningStatus = event.status;
	user.updatedAt = new Date();

	// If the screening is explicitly cleared/completed, we might check if that affects overall KYC,
	// but Plaid IDV usually aggregates this. This is mostly for ongoing monitoring updates.
	// If status becomes "cleared" from "pending_review", great.
	// If "pending_review", it might flag manually.

	await em.persist(user).flush();
};

export const handlePlaidWebhook = async (body: any) => {
	const type = body.webhook_type;

	switch (type) {
		case "IDENTITY_VERIFICATION":
			await handleIdentityVerificationWebhook(
				body as IdentityVerificationWebhook
			);
			break;
		case "WATCHLIST_SCREENING":
			await handleWatchlistScreeningWebhook(body as WatchlistScreeningWebhook);
			break;
		default:
	}
};
