import { useEffect } from "react";
import {
	usePlaidLink,
	PlaidLinkOptions,
	PlaidLinkOnSuccess,
	PlaidLinkOnExit,
} from "react-plaid-link";

interface PlaidLauncherProps {
	token: string | null;
	onSuccess: PlaidLinkOnSuccess;
	onExit: PlaidLinkOnExit;
}

export const PlaidLauncher = ({
	token,
	onSuccess,
	onExit,
}: PlaidLauncherProps) => {
	const config: PlaidLinkOptions = {
		token,
		onSuccess,
		onExit,
	};

	const { open, ready } = usePlaidLink(config);

	useEffect(() => {
		if (ready && token) {
			open();
		}
	}, [ready, open, token]);

	return null;
};
