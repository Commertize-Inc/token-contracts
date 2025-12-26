/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_POSTHOG_KEY: string;
	readonly VITE_POSTHOG_HOST: string;
	readonly VITE_PRIVY_APP_ID: string;
	readonly VITE_PRIVY_CLIENT_ID: string;
	readonly VITE_DASHBOARD_URL: string;
	readonly VITE_LANDING_URL: string;
	readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
	readonly VITE_STAGE: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
