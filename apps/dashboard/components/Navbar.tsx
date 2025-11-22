"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { Navbar as SharedNavbar } from "@commertize/ui";

export function Navbar() {
	const { user, logout } = usePrivy();

	return (
		<SharedNavbar
			user={user || null}
			onLogout={logout}
			logoHref="/"
			showStatusIndicator={true}
			LinkComponent={Link}
		/>
	);
}
