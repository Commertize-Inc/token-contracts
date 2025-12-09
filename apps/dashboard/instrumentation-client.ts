import posthog from 'posthog-js'

// Load env vars using utils script
import { loadEnv } from "@commertize/utils/env";
loadEnv();

// posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
// 	api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
// 	defaults: '2025-11-30'
// });
