import { PostHog } from 'posthog-node';

export default function PostHogClient() {
	const posthogClient = new PostHog(
		process.env.NEXT_PUBLIC_POSTHOG_KEY!,
		{
			host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
			personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
		},
	);

	// Set global properties for all server-side events
	const nodeEnv = process.env.NODE_ENV || 'development';

	// Intercept capture to add NODE_ENV to all events
	const originalCapture = posthogClient.capture.bind(posthogClient);
	posthogClient.capture = (event: any) => {
		if (typeof event === 'object' && event.properties) {
			event.properties.NODE_ENV = nodeEnv;
		} else if (typeof event === 'object') {
			event.properties = { NODE_ENV: nodeEnv };
		}
		return originalCapture(event);
	};

	return posthogClient;
}
