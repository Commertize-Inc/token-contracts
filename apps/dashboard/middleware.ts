import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Only apply to /api routes
	if (request.nextUrl.pathname.startsWith("/api")) {
		const origin = request.headers.get("origin");

		// If an origin is present, verify it matches the current request's origin
		if (origin) {
			const appOrigin = request.nextUrl.origin;

			if (process.env.NODE_ENV === "development") {
				return NextResponse.next();
			}

			if (origin !== appOrigin) {
				return new NextResponse(null, {
					status: 403,
					statusText: "Forbidden: Cross-origin access denied"
				});
			}
		}

		// Note: We are not strictly blocking requests without an Origin header here
		// (like server-side fetches or direct tool access) to avoid breaking
		// internal functionality, but we are enforcing that if an Origin IS
		// provided (which browsers do for cross-origin and often same-origin
		// non-GET requests), it must match.
	}

	return NextResponse.next();
}

export const config = {
	matcher: "/api/:path*",
};
