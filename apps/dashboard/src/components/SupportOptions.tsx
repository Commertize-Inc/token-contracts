import { Button } from "@commertize/ui";
import { Mail } from "lucide-react";

interface SupportOptionsProps {
	userId?: string; // Postgres ID
	privyUserId?: string; // Privy DID
	variant?: "default" | "minimal";
	className?: string;
	subject?: string;
	body?: string;
}

export const SupportOptions = ({
	userId,
	privyUserId,
	variant = "default",
	className = "",
	subject: customSubject,
	body: customBody,
}: SupportOptionsProps) => {
	const defaultSubject = `Identity Verification Support (${privyUserId || "Unknown"})`;
	const defaultBody = `Hello Commertize Team,

I am facing issues with verifying my identity.

---
id: ${userId || "Not Available"}
privy_id: ${privyUserId || "Not Available"}
---`;

	const subject = customSubject || defaultSubject;
	const body = customBody || defaultBody;

	const mailtoLink = `mailto:support@commertize.com?subject=${encodeURIComponent(
		subject
	)}&body=${encodeURIComponent(body)}`;

	if (variant === "minimal") {
		return (
			<div className={`space-y-2 ${className}`}>
				<a
					href={mailtoLink}
					className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2"
				>
					<Mail className="w-4 h-4" />
					Contact Support via Email
				</a>
				<p className="text-sm text-slate-500 text-center">
					Faster response? Join our{" "}
					<a
						href="https://discord.gg/RDpkUWyff4"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:underline"
					>
						Discord #support channel
					</a>
				</p>
			</div>
		);
	}

	return (
		<div className={`space-y-3 w-full ${className}`}>
			<Button
				variant="secondary"
				className="w-full gap-2"
				onClick={() => {
					window.location.href = mailtoLink;
				}}
			>
				<Mail className="w-4 h-4" />
				Contact Support
			</Button>

			<p className="text-sm text-slate-500 text-center">
				Faster response? Join our{" "}
				<a
					href="https://discord.gg/RDpkUWyff4"
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-600 hover:underline"
				>
					Discord #support channel
				</a>
			</p>
		</div>
	);
};
