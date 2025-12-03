import { NextRequest, NextResponse } from "next/server";
import { getEM } from "@/lib/db/orm";
import { PlaidItem } from "@/lib/db/entities/PlaidItem";
import {
	validateWebhookSignature,
	parseWebhookEvent,
	getWebhookStatusMessage,
} from "@/lib/plaid";

/**
 * POST: Handle Plaid webhook events
 *
 * Plaid sends webhooks for various events:
 * - ITEM_LOGIN_REQUIRED: User needs to re-authenticate
 * - ERROR: Item error occurred
 * - PENDING_EXPIRATION: Item will expire soon
 * - USER_PERMISSION_REVOKED: User revoked access
 * - DEFAULT_UPDATE: General item updates
 *
 * @param request - Webhook request from Plaid
 * @returns 200 OK response
 */
export async function POST(request: NextRequest) {
	try {
		// Get raw body for signature validation
		const body = await request.text();
		const signature = request.headers.get("plaid-signature") || "";

		console.log("[Plaid Webhook] Received webhook:", {
			hasSignature: !!signature,
			bodyLength: body.length,
		});

		// Validate webhook signature (if secret is configured)
		if (process.env.PLAID_WEBHOOK_SECRET) {
			const isValid = validateWebhookSignature(
				body,
				signature,
				process.env.PLAID_WEBHOOK_SECRET
			);

			if (!isValid) {
				console.warn("[Plaid Webhook] Invalid signature");
				return NextResponse.json(
					{ error: "Invalid signature" },
					{ status: 401 }
				);
			}
		}

		// Parse webhook event
		const event = parseWebhookEvent(body);

		console.log("[Plaid Webhook] Event details:", {
			type: event.webhook_type,
			code: event.webhook_code,
			itemId: event.item_id,
			environment: event.environment,
		});

		// Get PlaidItem from database
		const em = await getEM();
		const plaidItem = await em.findOne(PlaidItem, { itemId: event.item_id });

		if (!plaidItem) {
			console.warn("[Plaid Webhook] PlaidItem not found:", event.item_id);
			// Still return 200 to acknowledge receipt
			return NextResponse.json({ success: true });
		}

		// Handle different webhook codes
		switch (event.webhook_code) {
			case "ITEM_LOGIN_REQUIRED":
				// User needs to re-authenticate
				plaidItem.status = "login_required";
				plaidItem.errorMessage = "Please re-authenticate your bank account";
				console.log("[Plaid Webhook] Item requires re-auth:", plaidItem.id);
				break;

			case "ERROR":
				// Item error occurred
				plaidItem.status = "error";
				plaidItem.errorMessage =
					event.error?.display_message || "An error occurred";
				console.log("[Plaid Webhook] Item error:", {
					itemId: plaidItem.id,
					errorCode: event.error?.error_code,
					errorMessage: event.error?.error_message,
				});
				break;

			case "PENDING_EXPIRATION":
				// Item will expire soon
				plaidItem.errorMessage = "Bank connection will expire soon";
				console.log("[Plaid Webhook] Item expiring:", {
					itemId: plaidItem.id,
					expirationTime: event.consent_expiration_time,
				});
				break;

			case "USER_PERMISSION_REVOKED":
				// User revoked access
				plaidItem.status = "inactive";
				plaidItem.errorMessage = "Access to bank account was revoked";
				console.log("[Plaid Webhook] Permission revoked:", plaidItem.id);
				break;

			case "WEBHOOK_UPDATE_ACKNOWLEDGED":
				// Webhook URL was updated
				console.log(
					"[Plaid Webhook] Webhook URL updated for item:",
					plaidItem.id
				);
				break;

			case "DEFAULT_UPDATE":
				// General item update - set back to active if no errors
				if (
					plaidItem.status === "login_required" ||
					plaidItem.status === "error"
				) {
					// Don't override error states
					break;
				}
				plaidItem.status = "active";
				plaidItem.errorMessage = undefined;
				console.log("[Plaid Webhook] Item updated:", plaidItem.id);
				break;

			case "TRANSACTIONS_REMOVED":
				// Historical transactions were removed
				console.log(
					"[Plaid Webhook] Transactions removed for item:",
					plaidItem.id
				);
				break;

			default:
				console.log(
					"[Plaid Webhook] Unhandled webhook code:",
					event.webhook_code
				);
		}

		// Update last webhook timestamp
		plaidItem.lastWebhookAt = new Date();

		await em.persistAndFlush(plaidItem);

		// Log for monitoring
		const statusMessage = getWebhookStatusMessage(event);
		console.log("[Plaid Webhook] Processed:", {
			itemId: plaidItem.id,
			code: event.webhook_code,
			newStatus: plaidItem.status,
			message: statusMessage,
		});

		// TODO: Optionally notify user via email/push notification
		// if (event.webhook_code === 'ITEM_LOGIN_REQUIRED') {
		//   await sendNotification(plaidItem.user, statusMessage);
		// }

		return NextResponse.json({ success: true });
	} catch (error: any) {
		console.error("[Plaid Webhook] Error processing webhook:", {
			message: error?.message,
			stack: error?.stack,
		});

		// Always return 200 to acknowledge receipt
		// Plaid will retry failed webhooks
		return NextResponse.json({ success: true });
	}
}
