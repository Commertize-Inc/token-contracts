"use client";

import { useEffect } from "react";
import {
	usePlaidLink,
	PlaidLinkOnSuccess,
	PlaidLinkOnExit,
} from "react-plaid-link";

interface PlaidLauncherProps {
	token: string | null;
	onSuccess: PlaidLinkOnSuccess;
	onExit?: PlaidLinkOnExit;
}

export const PlaidLauncher = ({
	token,
	onSuccess,
	onExit,
}: PlaidLauncherProps) => {
	const { open, ready } = usePlaidLink({
		token: token || "",
		onSuccess,
		onExit,
	});

	useEffect(() => {
		if (ready && token) {
			open();
		}
	}, [ready, open, token]);

	return null;
};
