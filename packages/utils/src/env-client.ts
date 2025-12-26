// Client-only utilities (Browser/Vite environment)
// Safe to use import.meta.env and browser APIs

export function getStage(): string {
	if (typeof import.meta !== "undefined" && (import.meta as any).env) {
		const env = (import.meta as any).env;
		return env.VITE_STAGE || env.MODE || "development";
	}
	return "development";
}

export const STAGE = getStage();
export const isDevelopment = STAGE === "development";
