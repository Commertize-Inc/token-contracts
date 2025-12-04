"use client";

import { useEffect } from "react";
import {
	usePlaidLink,
	PlaidLinkOnSuccess,
	PlaidLinkOnExit,
} from "react-plaid-link";

interface PlaidLauncherProps {
	token: string;
	onSuccess: PlaidLinkOnSuccess;
	onExit?: PlaidLinkOnExit;
}

export const PlaidLauncher = ({
	token,
	onSuccess,
	onExit,
}: PlaidLauncherProps) => {
	const { open, ready } = usePlaidLink({
		token,
		onSuccess,
		onExit,
	});

	useEffect(() => {
		if (ready) {
			open();
		}
	}, [ready, open]);

	return null;
};
