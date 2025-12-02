"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, X, Menu } from "lucide-react";
import { Logo } from "@commertize/ui";

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [intelligenceOpen, setIntelligenceOpen] = useState(false);
	const [companyOpen, setCompanyOpen] = useState(false);
	const intelligenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
			if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
		};
	}, []);

	return (
		<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="flex-shrink-0">
						<Logo src="/assets/logo.png" width={240} height={75} />
					</Link>

					<div className="hidden md:flex items-center gap-6 lg:gap-8">
						<button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">Mission</button>
						<Link href="/marketplace" className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">Marketplace</Link>
						<Link href="/nexus" className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">Nexus</Link>
						<a href="/omnigrid" className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">OmniGrid</a>

						<div
							className="relative"
							onMouseEnter={() => {
								if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
								setIntelligenceOpen(true);
							}}
							onMouseLeave={() => {
								intelligenceTimeoutRef.current = setTimeout(() => setIntelligenceOpen(false), 150);
							}}
						>
							<button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light flex items-center gap-1">
								Intelligence
								<ChevronRight size={12} className={`transition-transform ${intelligenceOpen ? 'rotate-90' : ''}`} />
							</button>
							{intelligenceOpen && (
								<div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Market Analytics</a>
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">AI Insights</a>
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Reports</a>
								</div>
							)}
						</div>

						<div
							className="relative"
							onMouseEnter={() => {
								if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
								setCompanyOpen(true);
							}}
							onMouseLeave={() => {
								companyTimeoutRef.current = setTimeout(() => setCompanyOpen(false), 150);
							}}
						>
							<button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light flex items-center gap-1">
								Company
								<ChevronRight size={12} className={`transition-transform ${companyOpen ? 'rotate-90' : ''}`} />
							</button>
							{companyOpen && (
								<div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">About Us</a>
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Contact</a>
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Careers</a>
									<a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Press</a>
								</div>
							)}
						</div>
					</div>

					<div className="hidden md:block">
						<a
							href={process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}
							className="inline-flex items-center justify-center px-5 py-2 bg-[#D4A024] text-white text-sm font-light rounded-lg hover:bg-[#B8881C] transition-colors"
						>
							Sign In
						</a>
					</div>

					<div className="md:hidden">
						<button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2">
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</div>

			{isOpen && (
				<div className="md:hidden fixed inset-0 top-16 bg-black/50" onClick={() => setIsOpen(false)}>
					<div className="bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
						<a href="#" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>Mission</a>
						<Link href="/marketplace" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>Marketplace</Link>
						<Link href="/nexus" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>Nexus</Link>
						<a href="/omnigrid" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>OmniGrid</a>
						<div className="py-2">
							<div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Intelligence</div>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Market Analytics</a>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>AI Insights</a>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Reports</a>
						</div>
						<div className="py-2 border-t border-gray-100">
							<div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Company</div>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>About Us</a>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Contact</a>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Careers</a>
							<a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Press</a>
						</div>
						<div className="pt-4 border-t border-gray-100">
							<a
								href={process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"}
								className="block w-full text-center px-5 py-3 bg-[#D4A024] text-white font-light rounded-lg"
								onClick={() => setIsOpen(false)}
							>
								Sign In
							</a>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default Navbar;
