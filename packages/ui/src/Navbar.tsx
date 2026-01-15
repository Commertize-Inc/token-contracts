// shared navbar component used across different apps
// provides basic layout with logo, center content, right content and mobile menu
// the actual content is passed in as props so each app can customize it

"use client";

import { Menu, X } from "lucide-react";
import { useState, ReactNode } from "react";
import Logo from "./Logo";

export interface NavbarProps {
	logoHref?: string;
	logoSrc?: string;
	LinkComponent?: React.ComponentType<{
		href: string;
		className?: string;
		children: ReactNode;
	}>;
	centerContent?: ReactNode;
	rightContent?: ReactNode;
	mobileContent?: ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

// fallback link component if none is provided
// just renders a regular anchor tag
const DefaultLink: React.FC<{
	href: string;
	className?: string;
	children: ReactNode;
}> = ({ href, className, children }) => (
	<a href={href} className={className}>
		{children}
	</a>
);

// the actual navbar component
const Navbar: React.FC<NavbarProps> = ({
	logoHref = "/",
	logoSrc,
	LinkComponent,
	centerContent,
	rightContent,
	mobileContent,
	className,
	style,
}) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// use custom link component if provided, otherwise defualt to anchor
	const LogoLink = LinkComponent || DefaultLink;

	return (
		<nav
			className={`sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur transition-all duration-300 mb-8 ${className || ""}`}
			style={style}
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* logo on the left side */}
					<div className="flex items-center gap-8">
						<LogoLink
							href={logoHref}
							className="flex items-center transition-opacity hover:opacity-80"
						>
							<Logo src={logoSrc} />
						</LogoLink>
					</div>

					{/* center content only shows on larger screens */}
					{centerContent && (
						<div className="hidden md:flex items-center gap-8">
							{centerContent}
						</div>
					)}

					<div className="flex items-center gap-4">
						{rightContent}

						{/* hamburger button for mobile - only shows if theres mobile content */}
						{mobileContent && (
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="flex items-center justify-center p-2 text-slate-700 md:hidden"
								aria-label="Toggle menu"
							>
								{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
							</button>
						)}
					</div>
				</div>
			</div>

			{/* mobile menu overlay - covers the screen when open */}
			{isMobileMenuOpen && mobileContent && (
				<div
					className="fixed inset-0 top-16 z-40 bg-black/50"
					onClick={() => setIsMobileMenuOpen(false)}
				>
					{/* actual menu content - stops click propogation so it doesnt close when clicking inside */}
					<div
						className="bg-white p-4 shadow-md border-t border-slate-100"
						onClick={(e) => e.stopPropagation()}
					>
						{mobileContent}
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
