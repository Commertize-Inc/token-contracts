'use client';
import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, useFeatureFlagEnabled, usePostHog } from 'posthog-js/react'
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Avoid double initialization
			if (posthog.has_opted_in_capturing() || posthog.__loaded) {
				return;
			}

			try {
				posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
					api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
					person_profiles: "identified_only",
				});
			} catch (error) {
				console.error("PostHog initialization failed:", error);
			}
		}
	}, []);

	return <PHProvider client={posthog}> {children} </PHProvider>;
}

export function useFeatureFlag(name: string) {
	const env = process.env.NODE_ENV || 'development';
	const ffName = `commertize-${env}-${name}`;

	if (env === 'development' && typeof window !== 'undefined') {
		console.debug(`[PostHog] Checking flag: ${ffName}`);
	}

	return useFeatureFlagEnabled(ffName);
}

export { usePostHog };
