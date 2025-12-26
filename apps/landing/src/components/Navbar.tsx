import { Navbar as SharedNavbar } from "@commertize/ui";
import { useFeatureFlag } from "@commertize/utils/client"; // Ensure this works in Vite
import { useIsMounted } from "@commertize/utils/client"; // Ensure this works in Vite
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PostHogFeatureFlags } from "@commertize/utils/client";

// Wrapper to adapt standard href to react-router-dom's to prop
// Handles both 'to' (internal) and 'href' (external/anchor)

const LinkWrapper = ({ href, children, ...props }: any) => {
	// If it starts with /#, it's an anchor on the home page usually,
	// but here we just check if it's an anchor link
	if (href.startsWith("/#") || href.includes("#")) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	}
	// Check if external
	if (href.startsWith("http")) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	}
	return (
		<Link to={href} {...props}>
			{children}
		</Link>
	);
};

const Navbar = () => {
	const isMounted = useIsMounted();
	const [scrolled, setScrolled] = useState(false);
	// State for dropdowns
	const [useCasesOpen, setUseCasesOpen] = useState(false);
	const [companyOpen, setCompanyOpen] = useState(false);

	const useCasesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const ffLogin = useFeatureFlag(PostHogFeatureFlags.LANDING_LOGIN);
	const isAiNewsEnabled = useFeatureFlag(PostHogFeatureFlags.NEWS_GENERATION);
	// Fallback for dev if feature flag fails or PostHog not loaded
	const showLogin = ffLogin === undefined ? true : ffLogin;

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
			if (useCasesTimeoutRef.current) clearTimeout(useCasesTimeoutRef.current);
		};
	}, []);

	// Custom Styles for Landing Page (Fixed + Transparent/White)
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

	const CenterContent = (
		<div className="flex items-center gap-6 lg:gap-8">
			{/* 1. Mission */}
			<a
				href="/#about"
				className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light"
			>
				Mission
			</a>

			{/* 2. Use Cases Dropdown */}
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
				<button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
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
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]"
						>
							Nexus
						</Link>
						<Link
							to="/omnigrid"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]"
						>
							OmniGrid
						</Link>
					</div>
				)}
			</div>

			{/* 3. News */}
			{isAiNewsEnabled && (
				<Link
					to="/news"
					className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light"
				>
					News
				</Link>
			)}

			{/* 4. Analytics */}
			<Link
				to="/analytics"
				className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light"
			>
				Analytics
			</Link>

			{/* 5. Company Dropdown */}
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
				<button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light flex items-center gap-1 cursor-pointer bg-transparent border-none p-0">
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
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]"
						>
							Team
						</Link>

						<Link
							to="/faq"
							className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]"
						>
							FAQ
						</Link>
					</div>
				)}
			</div>
		</div>
	);

	const RightContent = (
		<div className="flex items-center gap-4">
			<a
				href="/waitlist"
				className="inline-flex items-center justify-center px-5 py-2 border border-[#D4A024] text-[#D4A024] text-sm font-light rounded-lg hover:bg-[#D4A024] hover:text-white transition-colors"
			>
				Join Waitlist
			</a>
			{isMounted && showLogin && (
				<a
					href={import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003"}
					className="inline-flex items-center justify-center px-5 py-2 bg-[#D4A024] text-white text-sm font-light rounded-lg hover:bg-[#B8881C] transition-colors"
				>
					Sign In
				</a>
			)}
		</div>
	);

	const MobileContent = (
		<div>
			<a
				href="/#about"
				className="block py-3 text-gray-700 border-b border-gray-100"
			>
				Mission
			</a>

			{/* Use Cases Mobile */}
			<div className="py-2 border-b border-gray-100">
				<div className="text-xs text-gray-500 uppercase tracking-wider mb-2 pl-4">
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

			{/* Company Mobile */}
			<div className="py-2 border-b border-gray-100">
				<div className="text-xs text-gray-500 uppercase tracking-wider mb-2 pl-4">
					Company
				</div>
				<Link to="/team" className="block py-1 pl-8 text-gray-600 text-sm">
					Team
				</Link>

				<Link to="/faq" className="block py-1 pl-8 text-gray-600 text-sm">
					FAQ
				</Link>
			</div>

			<div className="pt-4 border-t border-gray-100 space-y-3">
				<a
					href="/waitlist"
					className="block w-full text-center px-5 py-3 border border-[#D4A024] text-[#D4A024] font-light rounded-lg"
				>
					Join Waitlist
				</a>
				{isMounted && showLogin && (
					<a
						href={import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003"}
						className="block w-full text-center px-5 py-3 bg-[#D4A024] text-white font-light rounded-lg"
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
				// Override the gradient background from the shared component with !bg-none if needed,
				// but we are using inline style background which should take precedence.
				// Using className="!bg-none" to be safe if desired, but let's test.
				className="!bg-none"
			/>
			<div className="h-16" aria-hidden="true" />
		</>
	);
};

export default Navbar;
