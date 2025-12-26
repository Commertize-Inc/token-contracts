import { usePrivy } from "@privy-io/react-auth";
import { usePostHog } from "@commertize/utils/client";
import { useEffect } from "react";

export function PostHogIdentity() {
	const { user, authenticated, ready } = usePrivy();
	const posthog = usePostHog();

	useEffect(() => {
		if (posthog) {
			if (ready && authenticated && user) {
				posthog.identify(user.id, {
					email: user.email?.address,
					wallet: user.wallet?.address,
				});
			} else if (ready && !authenticated) {
				// Only reset if we were previously identified?
				// PostHog handles reset idempotent-ish, but calling it every render if !authenticated is bad if logic isn't careful.
				// But ready && !authenticated is stable state for unauth user.
				// We should probably check if posthog.get_distinct_id() is distinct from device id?
				// Simplest is to just call reset.
				posthog.reset();
			}
		}
	}, [user, authenticated, ready, posthog]);

	return null;
}
