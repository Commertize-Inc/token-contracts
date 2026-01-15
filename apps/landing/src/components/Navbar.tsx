// navbar component for the landing page
// wraps the shared navbar from ui package and adds landing specific stuff like dropdowns and login button

import { Navbar as SharedNavbar } from "@commertize/ui";
import {
	PostHogFeatureFlags,
	useFeatureFlag,
	useIsMounted,
	usePostHog,
} from "@commertize/utils/client"; // Ensure this works in Vite
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// this wraper handles the difference between internal links (react router) and external ones
// basically if its a hash link or external url we use regular anchor tag, otherwise use Link
const LinkWrapper = ({ href, children, ...props }: any) => {
	// anchor links need to use regular a tag for scrolling to work properly
	if (href.startsWith("/#") || href.includes("#")) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	}
	// external links also use regular a tag
	if (href.startsWith("http")) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	}
	// internal links use react router Link for client side navigation
	return (
		<Link to={href} {...props}>
			{children}
		</Link>
	);
};

// main navbar compoennt
const Navbar = () => {
	const isMounted = useIsMounted();
	const [scrolled, setScrolled] = useState(false);
	const posthog = usePostHog();

	const trackNav = (label: string, destination: string) => {
		if (posthog) {
			posthog.capture("navigation_clicked", { label, destination });
		}
	};

	// dropdown states for the nav menu items
	const [useCasesOpen, setUseCasesOpen] = useState(false);
	const [companyOpen, setCompanyOpen] = useState(false);

	// refs for timeout cleanup when hovering dropdowns
	const useCasesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// feature flags to control whats visible in the nav
	const isAiNewsEnabled = useFeatureFlag(PostHogFeatureFlags.NEWS_GENERATION);

	// handle scroll to add background blur when user scrolls down
	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
			// clean up the dropdown timeouts too
			if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
			if (useCasesTimeoutRef.current) clearTimeout(useCasesTimeoutRef.current);
		};
	}, []);

	// custom inline styles for the fixed navbar
	// changes background and blur based on scroll position
	const navbarStyle = {
		position: "fixed" as const,
		top: 0,
		left: 0,
		right: 0,
		background: scrolled
			? "rgba(255, 255, 255, 0.95)"
			: "rgba(255, 255, 255, 0.8)",
		zIndex: 50,
		backdropFilter: scrolled ? "blur(12px)" : "blur(8px)",
		borderBottom: scrolled ? "1px solid #e2e8f0" : "none",
		boxShadow: scrolled ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)" : "none",
		transition: "all 0.3s ease",
	};

	// center nav items with dropdowns for use cases and company
	const CenterContent = (
		<div className="flex items-center gap-6 lg:gap-8">
			{/* mission link - just scrolls to about section */}
			<a
				href="/#about"
				className="text-sm text-gray-700 hover:text-[#DDB35F] transition-colors font-light"
				onClick={() => trackNav("Mission", "/#about")}
			>
				Mission
			</a>

			{/* use cases dropdown - shows on hover with a small delay before closing */}
			<div
				className="relative"
				onMouseEnter={() => {
					if (useCasesTimeoutRef.current)
						clearTimeout(useCasesTimeoutRef.current);
					setUseCasesOpen(true);
				}}
				onMouseLeave={() => {
					useCasesTimeoutRef.current = setTimeout(
						() => setUseCasesOpen(false),
						150
					);
				}}
			>
				<button className="text-sm text-gray-700 hover:text-[#DDB35F] transition-colors font-light flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
					Use Cases
					<ChevronRight
						size={12}
						className={`transition-transform ${useCasesOpen ? "rotate-90" : ""}`}
					/>
				</button>
				{useCasesOpen && (
					<div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
						<Link
							to="/nexus"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#DDB35F]"
							onClick={() => trackNav("Nexus", "/nexus")}
						>
							Nexus
						</Link>
						<Link
							to="/omnigrid"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#DDB35F]"
							onClick={() => trackNav("OmniGrid", "/omnigrid")}
						>
							OmniGrid
						</Link>
					</div>
				)}
			</div>

			{/* news link - only shows if feature flag is on */}
			{isAiNewsEnabled && (
				<Link
					to="/news"
					className="text-sm text-gray-700 hover:text-[#DDB35F] transition-colors font-light"
					onClick={() => trackNav("News", "/news")}
				>
					News
				</Link>
			)}

			{/* analytics link */}
			<Link
				to="/analytics"
				className="text-sm text-gray-700 hover:text-[#DDB35F] transition-colors font-light"
				onClick={() => trackNav("Analytics", "/analytics")}
			>
				Analytics
			</Link>

			{/* company dropdown - same hover pattern as use cases */}
			<div
				className="relative"
				onMouseEnter={() => {
					if (companyTimeoutRef.current)
						clearTimeout(companyTimeoutRef.current);
					setCompanyOpen(true);
				}}
				onMouseLeave={() => {
					companyTimeoutRef.current = setTimeout(
						() => setCompanyOpen(false),
						150
					);
				}}
			>
				<button className="text-sm text-gray-700 hover:text-[#DDB35F] transition-colors font-light flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
					Company
					<ChevronRight
						size={12}
						className={`transition-transform ${companyOpen ? "rotate-90" : ""}`}
					/>
				</button>
				{companyOpen && (
					<div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
						<Link
							to="/team"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#DDB35F]"
							onClick={() => trackNav("Team", "/team")}
						>
							Team
						</Link>

						<Link
							to="/faq"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#DDB35F]"
							onClick={() => trackNav("FAQ", "/faq")}
						>
							FAQ
						</Link>
					</div>
				)}
			</div>
		</div>
	);

	// right side buttons for desktop only
	const RightContent = (
		<>
			{/* mobile version - no buttons shown */}
			<div className="flex sm:hidden items-center gap-1">
				{/* Empty - no mobile navbar buttons */}
			</div>
			{/* desktop version - sign in button only */}
			<div className="hidden sm:flex items-center gap-4">
				{isMounted && (
					<a
						href={import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003"}
						className="inline-flex items-center justify-center px-5 py-2 bg-[#DDB35F] text-white text-sm font-light rounded-lg hover:bg-[#C9A84E] transition-colors"
						onClick={() => {
							if (posthog) {
								posthog.capture("landing_signin_click", {
									destination: import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003",
								});
							}
						}}
					>
						Sign In
					</a>
				)}
			</div>
		</>
	);

	// mobile menu content - shows when hamburger is tapped
	// laid out differently than desktop, more vertcal
	const MobileContent = (
		<div>
			<a
				href="/#about"
				className="block py-3 text-gray-700 border-b border-gray-100"
			>
				Mission
			</a>

			{/* use cases section in mobile menu */}
			<div className="py-2 border-b border-gray-100">
				<div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
					Use Cases
				</div>
				<Link to="/nexus" className="block py-1 pl-8 text-gray-600 text-sm">
					Nexus
				</Link>
				<Link to="/omnigrid" className="block py-1 pl-8 text-gray-600 text-sm">
					OmniGrid
				</Link>
			</div>

			{isAiNewsEnabled && (
				<Link
					to="/news"
					className="block py-3 text-gray-700 border-b border-gray-100"
				>
					News
				</Link>
			)}
			<Link
				to="/analytics"
				className="block py-3 text-gray-700 border-b border-gray-100"
			>
				Analytics
			</Link>

			{/* company section in mobile menu */}
			<div className="py-2 border-b border-gray-100">
				<div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
					Company
				</div>
				<Link to="/team" className="block py-1 pl-8 text-gray-600 text-sm">
					Team
				</Link>

				<Link to="/faq" className="block py-1 pl-8 text-gray-600 text-sm">
					FAQ
				</Link>
			</div>

			{/* cta button at the bottom of mobile menu */}
			<div className="pt-4 border-t border-gray-100 space-y-3">
				{isMounted && (
					<a
						href={import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003"}
						className="block w-full text-center px-5 py-3 bg-[#DDB35F] text-white font-light rounded-lg"
						onClick={() => {
							if (posthog) {
								posthog.capture("landing_signin_click", {
									destination: import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003",
									source: "mobile_menu",
								});
							}
						}}
					>
						Sign In
					</a>
				)}
			</div>
		</div>
	);

	return (
		<>
			<SharedNavbar
				logoSrc="/assets/logo.png"
				LinkComponent={LinkWrapper}
				centerContent={CenterContent}
				rightContent={RightContent}
				mobileContent={MobileContent}
				style={navbarStyle}
				// override the gradient bg from shared component
				className="!bg-none"
			/>
			{/* spacer div so content doesnt go under the fixed navbar */}
			<div className="h-16" aria-hidden="true" />
		</>
	);
};

export default Navbar;
