import { PostHog } from "posthog-node";
import { STAGE } from "../env-server";

export default function PostHogClient() {
	const posthogClient = new PostHog(process.env.VITE_POSTHOG_KEY!, {
		host: process.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
		personalApiKey: process.env.VITE_POSTHOG_PERSONAL_API_KEY,
	});

	// Set global listings for all server-side events
	const stage = STAGE;

	// Intercept capture to add STAGE to all events
	const originalCapture = posthogClient.capture.bind(posthogClient);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	posthogClient.capture = (event: any) => {
		if (typeof event === "object" && event.listings) {
			event.listings.STAGE = stage;
		} else if (typeof event === "object") {
			event.listings = { STAGE: stage };
		}
		return originalCapture(event);
	};

	return posthogClient;
}

export async function getFeatureFlag(
	name: string,
	distinctId: string
): Promise<boolean | string | undefined> {
	const client = PostHogClient();
	const env = STAGE;
	const ffName = `commertize-${env}-${name}`;

	// In dev, log the check
	if (env === "development") {
		console.debug(
			`[PostHog Server] Checking flag: ${ffName} for ${distinctId}`
		);
	}

	try {
		const isEnabled = await client.isFeatureEnabled(ffName, distinctId);
		await client.shutdown(); // Ensure we don't leave connections open if this is one-off
		return isEnabled;
	} catch (error) {
		console.error(`[PostHog Server] Error checking flag ${ffName}:`, error);
		return false; // Default to false on error
	}
}

export * from "./constants";
