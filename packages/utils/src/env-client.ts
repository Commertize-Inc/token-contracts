// Client-only utilities (Browser/Vite environment)
// Safe to use import.meta.env and browser APIs

export function getStage(): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (typeof import.meta !== "undefined" && (import.meta as any).env) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const env = (import.meta as any).env;
		return env.VITE_STAGE || env.MODE || "development";
	}
	return "development";
}

export const STAGE = getStage();
export const isDevelopment = STAGE === "development";
