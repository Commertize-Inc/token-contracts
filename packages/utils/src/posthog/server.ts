import { PostHog } from 'posthog-node';

export default function PostHogClient() {
	const posthogClient = new PostHog(
		process.env.NEXT_PUBLIC_POSTHOG_KEY!,
		{
			host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
			personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
		},
	);
	return posthogClient;
}
