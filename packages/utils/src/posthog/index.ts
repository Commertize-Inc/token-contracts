"use client";

import posthog from "posthog-js";
import {
	PostHogProvider as PHProvider,
	useFeatureFlagEnabled,
	usePostHog,
} from "posthog-js/react";
import { useEffect, createElement } from "react";
import { STAGE } from "../env-client";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Avoid double initialization
			if (posthog.has_opted_in_capturing() || posthog.__loaded) {
				return;
			}

			try {
				posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
					api_host:
						process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
					person_profiles: "identified_only",
					bootstrap: {
						distinctID: undefined,
						featureFlags: {},
					},
					loaded: (posthog) => {
						// Set global super listings for all events
						posthog.register({
							STAGE,
						});
					},
				});
			} catch (error) {
				console.error("PostHog initialization failed:", error);
			}
		}
	}, []);

	return createElement(PHProvider, { client: posthog }, children);
}

export function useFeatureFlag(name: string) {
	const ffName = `commertize-${STAGE}-${name}`;

	if (STAGE === "development" && typeof window !== "undefined") {
		console.debug(`[PostHog] Checking flag: ${ffName}`);
	}

	return useFeatureFlagEnabled(ffName);
}

export { usePostHog };
export * from "./constants";
