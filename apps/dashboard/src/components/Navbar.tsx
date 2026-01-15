import { Navbar as SharedNavbar, UserMenu } from "@commertize/ui";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "react-router-dom";

import { useOnboardingStatus } from "../hooks/useOnboardingStatus";
import { useProfile } from "../hooks/useProfile";
import { VerificationStatus } from "@commertize/data/enums";
import { NotificationsDropdown } from "./NotificationsDropdown";

// Wrapper to adapt standard href to react-router-dom's to prop

const LinkWrapper = ({ href, children, ...props }: any) => {
	return (
		<Link to={href} {...props}>
			{children}
		</Link>
	);
};

export function Navbar() {
	const { user, logout } = usePrivy();
	const { data: status } = useOnboardingStatus();
	const { data: profile } = useProfile();
	const canList =
		status?.sponsor &&
		(status.sponsor.status === VerificationStatus.VERIFIED ||
			status.sponsor.status === "verified");

	const rightContent = (
		<div className="flex items-center gap-4">
			<NotificationsDropdown />
			<UserMenu
				user={user || null}
				username={profile?.username}
				onLogout={logout}
				showStatusIndicator={false}
				LinkComponent={LinkWrapper}
			/>
		</div>
	);

	const centerContent = (
		<div className="hidden md:flex items-center space-x-8">
			<Link
				to="/"
				className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
			>
				Dashboard
			</Link>
			<Link
				to="/marketplace"
				className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
			>
				Marketplace
			</Link>
			{canList && (
				<>
					<Link
						to="/sponsor/dashboard"
						className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
					>
						Sponsor
					</Link>
				</>
			)}
			{profile?.isAdmin && (
				<Link
					to="/admin/reviews"
					className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
				>
					Admin Reviews
				</Link>
			)}
		</div>
	);

	const mobileContent = (
		<div className="flex flex-col space-y-4 py-2">
			<Link
				to="/"
				className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
			>
				Dashboard
			</Link>
			<Link
				to="/marketplace"
				className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
			>
				Marketplace
			</Link>
			{canList && (
				<Link
					to="/sponsor/dashboard"
					className="text-base font-medium text-slate-600 hover:text-slate-900 transition-colors"
				>
					Sponsor Dashboard
				</Link>
			)}
			{profile?.isAdmin && (
				<Link
					to="/admin/reviews"
					className="text-base font-medium text-purple-600 hover:text-purple-800 transition-colors"
				>
					Admin Reviews
				</Link>
			)}
		</div>
	);

	return (
		<SharedNavbar
			logoHref="/"
			logoSrc="/assets/logo.png"
			rightContent={rightContent}
			centerContent={centerContent}
			mobileContent={mobileContent}
			LinkComponent={LinkWrapper}
		/>
	);
}
