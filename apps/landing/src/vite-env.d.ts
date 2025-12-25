/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
	readonly VITE_POSTHOG_KEY: string;
	readonly VITE_POSTHOG_HOST: string;
	readonly VITE_PRIVY_APP_ID: string;
	readonly VITE_PRIVY_CLIENT_ID: string;
	readonly VITE_DASHBOARD_URL: string;
	// more env variables...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
