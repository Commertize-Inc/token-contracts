export const createApi = (baseUrl: string) => {
	const getHeaders = (token?: string | null) => {
		const headers: HeadersInit = {};
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const vercelProtectionBypass = (import.meta as any).env
			.VITE_VERCEL_AUTOMATION_BYPASS_SECRET;
		if (vercelProtectionBypass) {
			headers["x-vercel-protection-bypass"] = vercelProtectionBypass;
		}
		return headers;
	};

	const getUrl = (endpoint: string) => {
		const cleanBase = baseUrl.replace(/\/+$/, "");
		const cleanEndpoint = endpoint.replace(/^\/+/, "");
		return `${cleanBase}/api/${cleanEndpoint}`;
	};

	return {
		get: async (endpoint: string, token?: string | null) => {
			const res = await fetch(getUrl(endpoint), {
				headers: getHeaders(token),
			});
			if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
			return res.json();
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		post: async (endpoint: string, body: any, token?: string | null) => {
			const headers = getHeaders(token);
			headers["Content-Type"] = "application/json";

			const res = await fetch(getUrl(endpoint), {
				method: "POST",
				headers,
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const errorText = await res.text();
				let errorMessage = res.statusText;
				try {
					const errorJson = JSON.parse(errorText);
					if (errorJson.error) errorMessage = errorJson.error;
					if (errorJson.details) errorMessage += `: ${errorJson.details}`;
				} catch {}
				throw new Error(`API Error: ${errorMessage}`);
			}
			return res.json();
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		patch: async (endpoint: string, body: any, token?: string | null) => {
			const headers = getHeaders(token);
			headers["Content-Type"] = "application/json";

			const res = await fetch(getUrl(endpoint), {
				method: "PATCH",
				headers,
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
			return res.json();
		},
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		put: async (endpoint: string, body: any, token?: string | null) => {
			const headers = getHeaders(token);
			headers["Content-Type"] = "application/json";

			const res = await fetch(getUrl(endpoint), {
				method: "PUT",
				headers,
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
			return res.json();
		},
		delete: async (endpoint: string, token?: string | null) => {
			const res = await fetch(getUrl(endpoint), {
				method: "DELETE",
				headers: getHeaders(token),
			});
			if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
			if (res.status === 204) return null;
			try {
				return await res.json();
			} catch {
				return null;
			}
		},
	};
};
