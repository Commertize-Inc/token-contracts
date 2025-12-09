"use client";

import ChatGPTWidget from "@/components/ChatGPTWidget";
import { Button, Logo, PropertyCard, PropertyData, BentoBox } from "@commertize/ui";
import { useIsMounted } from "@commertize/utils/hooks";
import { AnimatePresence, motion } from "framer-motion";
import {
	Activity,
	ArrowLeftRight,
	ArrowRight,
	Bell,
	Building,
	Building2,
	Calendar,
	Check,
	ChevronDown,
	ChevronRight,
	Clock,
	Coins,
	Cookie,
	DollarSign,
	FileText,
	Filter,
	Globe,
	Home as HomeIcon,
	Layers,
	LayoutDashboard,
	Link2,
	LogOut,
	MapPin,
	Menu,
	PieChart,
	Search,
	Settings,
	ShieldCheck,
	Sun,
	TrendingUp,
	Users,
	Wallet,
	Warehouse,
	Wind,
	X,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const SAMPLE_PROPERTIES: PropertyData[] = [
	{
		id: "1",
		name: "Gateway Medical Plaza",
		location: "Austin, TX",
		imageUrl:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
		propertyValue: 24500000,
		pricePerToken: 100,
		minInvestment: 25000,
		totalTokens: 245000,
		tokensSold: 147000,
		status: "Active",
		propertyType: "medical",
		targetedIRR: 14.5,
		capRate: 6.8,
		holdPeriod: 5,
		units: 48,
	},
	{
		id: "2",
		name: "Riverside Industrial Park",
		location: "Phoenix, AZ",
		imageUrl:
			"https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
		propertyValue: 18750000,
		pricePerToken: 75,
		minInvestment: 50000,
		totalTokens: 250000,
		tokensSold: 200000,
		status: "Active",
		propertyType: "industrial",
		targetedIRR: 16.2,
		capRate: 7.5,
		holdPeriod: 7,
		units: 12,
	},
	{
		id: "3",
		name: "Metropolitan Tower",
		location: "Denver, CO",
		imageUrl:
			"https://images.unsplash.com/photo-1554435493-93422e8220c8?w=600&h=400&fit=crop",
		propertyValue: 52000000,
		pricePerToken: 250,
		minInvestment: 100000,
		totalTokens: 208000,
		tokensSold: 83200,
		status: "Active",
		propertyType: "office",
		targetedIRR: 12.8,
		capRate: 5.9,
		holdPeriod: 10,
		units: 320,
	},
	{
		id: "4",
		name: "Sunrise Retail Center",
		location: "Miami, FL",
		imageUrl:
			"https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
		propertyValue: 15200000,
		pricePerToken: 50,
		minInvestment: 25000,
		totalTokens: 304000,
		tokensSold: 243200,
		status: "Active",
		propertyType: "retail",
		targetedIRR: 11.5,
		capRate: 6.2,
		holdPeriod: 5,
		units: 24,
	},
	{
		id: "5",
		name: "Pacific Heights Multifamily",
		location: "Seattle, WA",
		imageUrl:
			"https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
		propertyValue: 38000000,
		pricePerToken: 150,
		minInvestment: 50000,
		totalTokens: 253333,
		tokensSold: 177333,
		status: "Active",
		propertyType: "multifamily",
		targetedIRR: 13.2,
		capRate: 5.4,
		holdPeriod: 7,
		units: 156,
	},
	{
		id: "6",
		name: "Harbor View Hotel",
		location: "San Diego, CA",
		imageUrl:
			"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
		propertyValue: 45000000,
		pricePerToken: 200,
		minInvestment: 75000,
		totalTokens: 225000,
		tokensSold: 0,
		status: "Coming Soon",
		propertyType: "hotel",
		targetedIRR: 15.8,
		capRate: 7.2,
		holdPeriod: 8,
		units: 180,
		comingSoon: true,
	},
];

// --- Mock Data ---
const MOCK_PROPERTIES = [
	{
		id: 1,
		title: "DoubleTree Hilton Head Inn",
		type: "HOTEL",
		location: "36 S Forest Beach Dr, Hilton Head Island, SC",
		sponsor: "Passive Partners Capital",
		status: "Funding Opens Soon",
		funded: 0,
		units: 79,
		comingSoon: true,
		image: "/assets/doubletree-hilton-head.jpg",
	},
	{
		id: 2,
		title: "Boardwalk Suites Lafayette",
		type: "HOTEL",
		location: "1605 N University Ave Lafayette, LA",
		sponsor: "Passive Partners Capital",
		status: "Funding Opens Soon",
		funded: 0,
		units: 140,
		comingSoon: true,
		image: "/assets/boardwalk-suites-lafayette.jpg",
	},
	{
		id: 3,
		title: "National Hotel under conversion to Hilton",
		type: "HOTEL",
		location: "2 Water St Jackson, CA",
		sponsor: "Passive Partners Capital",
		status: "Funding Opens Soon",
		funded: 0,
		units: 36,
		comingSoon: true,
		image: "/assets/national-hotel-hilton.jpg",
	},
];

const _MOCK_STATS = [
	{ label: "Assets Tokenized", value: "$1.2B" },
	{ label: "Target APY", value: "11.4%" },
	{ label: "Global Investors", value: "14,000+" },
];

// --- Specialized UI Components ---

interface SectionHeadingProps {
	subtitle: string;
	title: string;
	align?: "center" | "left";
}

const SectionHeading = ({
	subtitle,
	title,
	align = "center",
}: SectionHeadingProps) => (
	<div
		className={`${styles.sectionHeading} ${align === "center" ? styles.sectionHeadingCenter : styles.sectionHeadingLeft}`}
	>
		<div className={styles.subtitle}>{subtitle}</div>
		<h2 className={styles.title}>{title}</h2>
	</div>
);

// --- Sections ---



const FlippingText = () => {
	const prefixes = [
		"Token",
		"Digit",
		"Fractional",
		"Democrat",
		"Collateral",
		"Modern",
		"Global",
		"Revolution",
	];
	const [currentIndex, setCurrentIndex] = useState(0);
	const [animationKey, setAnimationKey] = useState(0);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		// Mount detection - legitimate pattern
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHasMounted(true);
	}, []);

	useEffect(() => {
		if (!hasMounted) return;
		const interval = setInterval(() => {
			setAnimationKey((prev) => prev + 1);
			setTimeout(() => {
				setCurrentIndex((prev) => (prev + 1) % prefixes.length);
			}, 100);
		}, 2500);
		return () => clearInterval(interval);
	}, [hasMounted, prefixes.length]);

	return (
		<div className="relative h-12 sm:h-16 md:h-20 lg:h-24 flex items-center justify-center mt-4">
			<div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 font-logo font-light flex items-baseline justify-center">
				<span
					key={hasMounted ? animationKey : "initial"}
					className={hasMounted ? "text-flip inline-block" : "inline-block"}
				>
					{prefixes[currentIndex]}
				</span>
				<span>ized.</span>
			</div>
		</div>
	);
};

const CookieConsent = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		// Mount detection with delayed visibility - legitimate pattern
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setHasMounted(true);
		const timer = setTimeout(() => setIsVisible(true), 1000);
		return () => clearTimeout(timer);
	}, []);

	if (!hasMounted || !isVisible) return null;

	return (
		<motion.div
			className={styles.cookieConsent}
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
		>
			<button
				className={styles.cookieClose}
				onClick={() => setIsVisible(false)}
			>
				<X size={14} />
			</button>
			<div className={styles.cookieHeader}>
				<div className={styles.cookieIcon}>
					<Cookie size={20} />
				</div>
				<h4 className={styles.cookieTitle}>Cookie Preferences</h4>
			</div>
			<p className={styles.cookieText}>
				We use cookies to enhance your browsing experience, serve personalized
				content, and analyze our traffic. Please choose your preference.
			</p>
			<div className={styles.cookieButtons}>
				<button
					className={styles.cookieBtnReject}
					onClick={() => setIsVisible(false)}
				>
					Reject All
				</button>
				<button
					className={styles.cookieBtnAccept}
					onClick={() => setIsVisible(false)}
				>
					Accept All
				</button>
			</div>
		</motion.div>
	);
};

const Hero = () => (
	<section className="relative min-h-screen flex items-center overflow-hidden">
		<div className="absolute inset-0 pointer-events-none">
			<motion.div
				className="absolute inset-0 bg-no-repeat pointer-events-none"
				style={{
					backgroundImage: `url('/assets/hero-pattern.jpg')`,
					imageRendering:
						"-webkit-optimize-contrast" as React.CSSProperties["imageRendering"],
					WebkitBackfaceVisibility: "hidden",
					backfaceVisibility: "hidden",
					transform: "translateZ(0)",
					willChange: "transform",
					filter: "contrast(1.0) brightness(1.0) saturate(1.0)",
					backgroundPosition: "center center",
					backgroundSize: "cover",
				}}
				initial={{ scale: 1.3 }}
				animate={{ scale: [1.3, 1.7] }}
				transition={{
					duration: 18,
					repeat: Infinity,
					ease: "easeInOut",
					repeatType: "reverse",
				}}
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60 pointer-events-none"></div>
		</div>

		<div className="container relative z-10 px-4 pt-32 sm:pt-40 md:pt-48">
			<div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4 sm:gap-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 font-logo">
						<span className="block font-extralight text-xl sm:text-2xl md:text-4xl">
							Commercial Real Estate
						</span>
						<FlippingText />
					</h1>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="mb-20"
				>
					<p className="max-w-3xl mx-auto text-gray-800 drop-shadow-sm text-base sm:text-lg md:text-xl font-logo font-light px-4">
						Your Gateway to Commercial Real Estate's Digital Future.
						<motion.span
							className="block mt-4 text-gray-700 font-light"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1.2, duration: 0.8 }}
						>
							Welcome to
							<img
								src="/assets/logo.png"
								alt="Commertize"
								className="inline h-4 sm:h-5 w-auto"
								style={{
									verticalAlign: "baseline",
									clipPath: "inset(0 0 0 20%)",
									transform: "translateY(4px) translateX(-22px)",
								}}
							/>
						</motion.span>
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="flex gap-3 sm:gap-4 justify-center mt-4"
				>
					<Link
						href="/marketplace"
						className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#D4A024] rounded-[0.75rem] text-sm sm:text-base font-light border-2 border-[#D4A024] hover:bg-[#D4A024]/5 transition-colors hover:scale-[1.02] active:scale-[0.98]"
					>
						Explore Marketplace
					</Link>
					<Link
						href="/waitlist"
						className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D4A024] text-white rounded-[0.75rem] text-sm sm:text-base font-light hover:bg-[#B8881C] transition-colors hover:scale-[1.02] active:scale-[0.98]"
					>
						Join Waitlist
					</Link>
				</motion.div>
			</div>
		</div>

		<CookieConsent />
	</section>
);

const _Marketplace = () => (
	<section className={styles.marketplaceSection} id="marketplace">
		<div className={styles.container}>
			<SectionHeading
				subtitle="Featured Properties"
				title="Explore Our Marketplace"
			/>
			<p className={styles.marketplaceIntro}>
				Discover institutional-grade commercial real estate investments,
				tokenized for accessibility and liquidity.
			</p>
			<div className={styles.marketplaceGrid}>
				{SAMPLE_PROPERTIES.map((property) => (
					<PropertyCard
						key={property.id}
						property={property}
						showFavoriteButton={false}
					/>
				))}
			</div>
			<div className={styles.marketplaceCta}>
				<motion.button
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					className={styles.marketplaceBtn}
				>
					View All Properties
					<ArrowRight size={16} />
				</motion.button>
			</div>
		</div>
	</section>
);

const _BentoFeatures = () => (
	<div className={styles.bentoSection}>
		<div className={styles.container}>
			<SectionHeading
				subtitle="Why Commertize"
				title="Institutional grade infrastructure."
			/>

			<div className={styles.bentoGrid}>
				{/* Large Feature */}
				<div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
					<div
						style={{
							position: "absolute",
							top: 0,
							right: 0,
							padding: "2.5rem",
							opacity: 0.1,
						}}
					>
						<ShieldCheck size={200} />
					</div>
					<div
						style={{
							position: "relative",
							zIndex: 10,
							height: "100%",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
						}}
					>
						<div>
							<div className={styles.bentoIconBox}>
								<ShieldCheck size={24} color="#C59B26" />
							</div>
							<h3 className={styles.bentoTitle}>Blockchain Transparency</h3>
							<p className={styles.bentoText}>
								Every transaction is recorded on-chain, ensuring immutable
								ownership records and complete transparency. AI-powered insights
								provide real-time valuation and risk assessment.
							</p>
						</div>
						<div
							style={{
								marginTop: "2rem",
								display: "flex",
								justifyContent: "center",
							}}
						>
							<button className={styles.complianceBtn}>
								View Compliance Docs
							</button>
						</div>
					</div>
				</div>

				{/* Vertical Stack */}
				<div
					style={{
						display: "grid",
						gridTemplateRows: "repeat(2, 1fr)",
						gap: "1.5rem",
					}}
				>
					<div className={`${styles.bentoCard} ${styles.bentoDark}`}>
						<div style={{ position: "relative", zIndex: 10 }}>
							<TrendingUp
								style={{ marginBottom: "1rem", color: "#C59B26" }}
								size={32}
							/>
							<h3 className={styles.bentoTitle}>Secondary Market Liquidity</h3>
							<p className={styles.bentoText}>
								Exit your positions when you want. Trade fractional shares
								instantly on our regulated secondary market.
							</p>
						</div>
					</div>
					<div className={`${styles.bentoCard} ${styles.bentoGold}`}>
						<PieChart
							style={{ marginBottom: "1rem", color: "#C59B26" }}
							size={32}
						/>
						<h3 className={styles.bentoTitle}>Fractional Ownership</h3>
						<p className={styles.bentoText}>
							Access institutional-grade deals with lower minimums. Build a
							diversified portfolio across asset classes and geographies.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
);

// --- About Us / Vision Section ---
const AboutUs = () => {
	const companyName = "Commertize";

	return (
		<section
			id="about"
			className="relative overflow-hidden min-h-[700px] md:min-h-[800px]"
		>
			<div className="absolute inset-0">
				<motion.div
					className="absolute inset-0"
					initial={{ scale: 1 }}
					animate={{ scale: [1.0, 1.2] }}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "easeInOut",
						repeatType: "reverse",
					}}
				>
					<img
						src="/assets/vision-background.jpg"
						alt=""
						className="w-full h-full object-cover"
						style={{ objectPosition: "center center" }}
					/>
				</motion.div>
				<div className="absolute inset-0 bg-white/60" />
			</div>

			<div className="absolute inset-0 flex items-center justify-start z-10 px-6 md:px-8 lg:pl-24">
				<motion.div
					className="max-w-2xl text-left"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 1, ease: "easeOut" }}
				>
					<motion.h2
						className="text-3xl md:text-4xl lg:text-5xl font-logo font-light mb-8 md:mb-12 text-gray-900"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					>
						Our Vision
					</motion.h2>

					<div className="space-y-6 md:space-y-8">
						<motion.p
							className="text-base md:text-lg font-logo font-light text-gray-800 leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
						>
							{companyName} is building the platform that connects commercial
							real estate to global capital markets. By merging AI,
							blockchain-based tokenization, and decentralized finance with
							compliant financial infrastructure, we're enhancing liquidity,
							transparency, and access across the real estate landscape.
						</motion.p>
						<motion.p
							className="text-base md:text-lg font-logo font-light text-gray-800 leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
						>
							From office buildings and multifamily properties to data centers
							and solar farms, we empower investors and property owners to own,
							trade, and build the next era of real estate finance—making real
							assets as dynamic and borderless as digital ones.
						</motion.p>
					</div>
				</motion.div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 flex items-center overflow-hidden bg-gradient-to-t from-white/80 to-transparent z-10">
				<motion.div
					animate={{ x: [0, -1600] }}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: "linear",
						repeatType: "loop",
					}}
					className="flex items-center space-x-32 whitespace-nowrap"
					style={{ minWidth: "3200px" }}
				>
					{[
						"Shaping the Future of Ownership",
						"Digital Assets, Real-World Value",
						"Shaping the Future of Ownership",
						"Digital Assets, Real-World Value",
						"Shaping the Future of Ownership",
						"Digital Assets, Real-World Value",
					].map((phrase, index) => (
						<motion.div
							key={`${phrase}-${index}`}
							whileHover={{
								scale: 1.05,
								color: "#D4A024",
								transition: { duration: 0.2 },
							}}
							className="cursor-pointer group flex-shrink-0"
							style={{ minWidth: "500px", textAlign: "center" }}
						>
							<span className="text-xl md:text-2xl font-logo font-light text-gray-800">
								{phrase}
							</span>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

// --- Why Commertize Section ---
const WhyCommertize = () => {
	const features = [
		{
			icon: Link2,
			title: "Blockchain Transparency",
			description:
				"Every transaction is recorded on-chain, ensuring immutable ownership records and complete transparency. AI-powered insights provide real-time valuation and risk assessment.",
			highlight: "On-Chain Verified",
		},
		{
			icon: ArrowLeftRight,
			title: "Secondary Market Liquidity",
			description:
				"Exit your positions when you want. Trade fractional shares instantly on our regulated secondary market.",
			highlight: "Trade Anytime",
		},
		{
			icon: Users,
			title: "Fractional Ownership",
			description:
				"Access institutional-grade deals with lower minimums. Build a diversified portfolio across asset classes and geographies.",
			highlight: "Lower Minimums",
		},
	];

	const traditionalItems = [
		"$1M+ minimum investment",
		"7-10 year lockup periods",
		"Limited to local markets",
		"Complex paperwork",
	];

	const commertizeItems = [
		"$1K minimum investment",
		"Liquid secondary market",
		"Global property access",
		"Streamlined digital process",
	];

	return (
		<section className="relative py-20 md:py-28 overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url('/assets/why-commertize-bg.jpg')" }}
				initial={{ scale: 1 }}
				animate={{ scale: [1.0, 1.15] }}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
					repeatType: "reverse",
				}}
			/>
			<div className="absolute inset-0 bg-white/70" />
			<div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="text-center mb-16"
				>
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-logo font-light text-gray-900 mb-4">
						Powered by <span className="text-[#D4A024]">Innovation</span>
					</h2>
					<p className="text-base md:text-lg font-logo font-light text-gray-600 max-w-2xl mx-auto">
						The future of real estate investing, powered by blockchain
						technology and institutional expertise.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{
								duration: 0.6,
								delay: index * 0.15,
								ease: "easeOut",
							}}
							whileHover={{ y: -8, transition: { duration: 0.3 } }}
							className="relative group h-full"
						>
							<BentoBox
								footer={
									<Link
										href="/faq"
										className="flex items-center text-[#D4A024] font-logo text-sm font-light group-hover:translate-x-2 transition-transform duration-300"
									>
										Learn more
										<ArrowRight className="w-4 h-4 ml-2" />
									</Link>
								}
							>
								<div className="absolute top-0 right-0 -mt-2 -mr-2">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D4A024]/10 text-[#D4A024] border border-[#D4A024]/20">
										{feature.highlight}
									</span>
								</div>

								<div className="mb-6 mt-2">
									<div className="w-12 h-12 bg-[#D4A024]/10 rounded-xl flex items-center justify-center mb-6">
										<feature.icon className="w-6 h-6 text-[#D4A024]" />
									</div>
									<h3 className="text-xl font-logo font-light text-gray-900 mb-3">
										{feature.title}
									</h3>
									<p className="text-gray-600 font-light leading-relaxed text-sm">
										{feature.description}
									</p>
								</div>
							</BentoBox>
						</motion.div>
					))}
				</div>

				<div className="relative max-w-5xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
							className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -mr-16 -mt-16 opacity-50" />
							<div className="relative z-10">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
										<Building2 className="w-6 h-6 text-gray-500" />
									</div>
									<div>
										<h3 className="text-xl font-logo font-light text-gray-900">
											Traditional CRE
										</h3>
										<p className="text-xs text-gray-400 font-light">
											Legacy Approach
										</p>
									</div>
								</div>
								<div className="space-y-4">
									{traditionalItems.map((item, index) => (
										<div
											key={index}
											className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
										>
											<div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
												<X size={14} className="text-red-500" />
											</div>
											<span className="text-gray-600 font-logo font-light">
												{item}
											</span>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
							className="bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 rounded-3xl p-8 border-2 border-[#D4A024]/30 shadow-lg relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A024]/10 rounded-full -mr-16 -mt-16" />
							<div className="absolute -bottom-4 -left-4 w-24 h-24 bg-[#D4A024]/5 rounded-full" />
							<div className="relative z-10">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-12 h-12 rounded-xl bg-[#D4A024]/20 flex items-center justify-center border border-[#D4A024]/30">
										<img
											src="/assets/commertize-icon-gold.png"
											alt=""
											className="w-6 h-6"
										/>
									</div>
									<div>
										<h3 className="text-xl font-logo font-light text-gray-900">
											Commertize
										</h3>
										<p className="text-xs text-[#D4A024] font-light">
											The Future of CRE
										</p>
									</div>
								</div>
								<div className="space-y-4">
									{commertizeItems.map((item, index) => (
										<div
											key={index}
											className="flex items-center gap-4 p-3 bg-white/80 rounded-xl border border-[#D4A024]/10"
										>
											<div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#D4A024]/20 flex items-center justify-center">
												<Check size={14} className="text-[#D4A024]" />
											</div>
											<span className="text-gray-700 font-logo font-light">
												{item}
											</span>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>

					<div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
						<div className="w-14 h-14 rounded-full bg-white shadow-xl border-2 border-[#D4A024]/30 flex items-center justify-center">
							<span className="text-[#D4A024] font-logo font-light text-sm">
								VS
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

// --- Commertize Collection Section ---
const CommertizeCollection = () => (
	<section id="properties" className="py-16 md:py-24 bg-white">
		<div className="relative w-full overflow-hidden mb-6">
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-100px" }}
				transition={{ duration: 0.8, ease: "easeOut" }}
				className="text-center"
			>
				<div className="relative h-12 sm:h-16 md:h-20 flex items-center overflow-hidden mb-4 sm:mb-6">
					<motion.div
						animate={{ x: [0, -800] }}
						transition={{
							duration: 16,
							repeat: Infinity,
							ease: "linear",
							repeatType: "loop",
						}}
						className="flex items-center space-x-24"
						style={{ minWidth: "1600px" }}
					>
						{[
							"The Commertize Collection",
							"The Commertize Collection",
							"The Commertize Collection",
							"The Commertize Collection",
						].map((text, index) => (
							<motion.h2
								key={`${text}-${index}`}
								className="text-3xl md:text-4xl lg:text-5xl font-logo font-light text-gray-900 flex-shrink-0"
								style={{ minWidth: "400px", textAlign: "center" }}
								whileHover={{
									scale: 1.05,
									transition: { duration: 0.2 },
								}}
							>
								The Commertize{" "}
								<span className="text-[#D4A024]">Collection</span>
							</motion.h2>
						))}
					</motion.div>
				</div>
			</motion.div>
		</div>

		<div className="container mx-auto px-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-100px" }}
				transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
				className="text-center mb-12 sm:mb-16 md:mb-20"
			>
				<p className="text-base md:text-lg max-w-2xl mx-auto text-gray-600 px-4 font-light">
					Explore a curated selection of commercial real estate opportunities
					across multiple sectors, sourced and vetted for quality and
					performance potential.
				</p>
			</motion.div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{MOCK_PROPERTIES.slice(0, 3).map((property, index) => (
					<motion.div
						key={property.id}
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: index * 0.1 }}
						className="bg-white rounded-2xl border-2 border-[#D4A024] overflow-hidden hover:shadow-xl transition-all duration-300"
					>
						<div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
							{property.image ? (
								<img
									src={property.image}
									alt={property.title}
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<Building2 size={64} className="text-[#D4A024]/30" />
								</div>
							)}
							{property.comingSoon && (
								<div className="absolute top-4 left-4 px-3 py-1 bg-[#F59E0B] text-white text-xs font-light rounded-[0.75rem]">
									COMING SOON
								</div>
							)}
						</div>
						<div className="p-5">
							<div className="flex items-start justify-between gap-2 mb-3">
								<h3 className="text-lg font-logo font-light text-gray-900 leading-tight">
									{property.title}
								</h3>
								<span className="px-3 py-1 bg-white text-[#92710A] text-xs font-medium rounded-[0.75rem] whitespace-nowrap border-2 border-[#D4A024]">
									{property.type}
								</span>
							</div>
							<div className="flex items-center gap-1 text-sm text-gray-900 mb-4">
								<MapPin size={14} className="text-[#D4A024]" />
								<span className="font-light">{property.location}</span>
							</div>

							<div className="mb-3">
								<div className="text-xs text-gray-900 font-light">Sponsor</div>
								<div className="text-sm text-gray-900 font-light">
									{property.sponsor}
								</div>
							</div>

							<div className="flex items-center justify-between mb-3">
								<span className="text-sm text-gray-900 font-light">
									{property.status}
								</span>
								<span className="text-sm text-gray-900 font-light">
									{property.funded}%
								</span>
							</div>
							<div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
								<div
									className="h-full bg-[#D4A024] rounded-full transition-all duration-500"
									style={{ width: `${property.funded}%` }}
								/>
							</div>

							<div className="text-center mb-4">
								<div className="text-sm text-gray-900 font-light">
									More Details Coming Soon
								</div>
								<div className="text-xs text-gray-900 font-light">
									Investment details available shortly.
								</div>
							</div>

							<div className="flex items-center justify-center mb-4">
								<span className="px-4 py-1.5 bg-white border-2 border-[#D4A024] text-[#92710A] text-sm font-medium rounded-[0.75rem]">
									{property.units} Units
								</span>
							</div>

							<button
								className="w-full py-3 bg-gray-300 text-gray-600 text-sm font-light rounded-[0.75rem] cursor-not-allowed"
								disabled
							>
								Coming Soon
							</button>
						</div>
					</motion.div>
				))}
			</div>
		</div>
	</section>
);

// --- Tokenization Info Section ---
const tokenizationSections = [
	{
		title: "Real Estate Developers",
		description: "Tokenize Your Projects. Raise Capital Faster",
		details: [
			"Offer fractional ownership to reduce funding time",
			"Attract global investors with lower entry points",
			"Increase liquidity for illiquid or early-stage assets",
			"Monetize rental income or future developments",
		],
	},
	{
		title: "Real Estate Companies",
		description: "Expand Access. Go Digital",
		details: [
			"Lower the barrier for investors ($100-$1,000 instead of $100K+)",
			"Diversify portfolio with global tokenized assets",
			"Benefit from 24/7 trading, instant settlement & lower fees",
			"Access broader investor base through digital platforms",
		],
	},
	{
		title: "REITs & Real Estate Investment Funds",
		description: "Reach More Investors. Stay Flexible",
		details: [
			"Expand beyond institutional investors without going public",
			"Offer fractional shares with global accessibility",
			"Improve transparency with on-chain reporting",
			"Reduce operational costs through automation",
		],
	},
	{
		title: "Institutional Investors",
		description: "Access Premium CRE Without Full Property Acquisition",
		details: [
			"Pension funds, endowments, and insurance companies gain fractional exposure",
			"Lower capital commitments with diversified CRE portfolios",
			"Transparent, on-chain reporting for regulatory compliance",
			"Instant settlement and reduced counterparty risk",
		],
	},
	{
		title: "Accredited Retail Investors",
		description: "Access Institutional-Grade CRE with Low Minimums",
		details: [
			"Previously locked out of premium commercial real estate deals",
			"Access top-tier properties with $100-$1,000 minimums",
			"Portfolio diversification beyond stocks and bonds",
			"Passive income through automated rental distributions",
		],
	},
	{
		title: "Family Offices",
		description: "Multi-Generational Wealth Management Simplified",
		details: [
			"Easier estate planning and inheritance distribution through tokens",
			"Diversification across multiple properties with smaller capital per asset",
			"Simplified asset transfers between family members",
			"Preserve wealth across generations with digital ownership records",
		],
	},
	{
		title: "International Investors",
		description: "Global Access to U.S. Commercial Real Estate",
		details: [
			"Cross-border investment without traditional barriers",
			"No need for local banking relationships or complex wire transfers",
			"24/7 access to U.S. commercial real estate from anywhere",
			"Simplified compliance through blockchain verification",
		],
	},
	{
		title: "Real Estate Brokers & Agents",
		description: "New Revenue Streams Through Tokenization",
		details: [
			"Commission opportunities on fractional property sales",
			"Access to global buyer networks through digital platforms",
			"Modern tools for next-generation real estate transactions",
			"Expand client services with tokenized investment offerings",
		],
	},
	{
		title: "Financial Advisors & Wealth Managers",
		description: "Offer Clients a New Asset Class",
		details: [
			"Diversification strategies beyond traditional securities",
			"Easy portfolio rebalancing with liquid tokens",
			"Technology-enabled client reporting and transparency",
			"Access to institutional-grade real estate for all client types",
		],
	},
	{
		title: "Property & Asset Managers",
		description: "Streamlined Operations with Blockchain Technology",
		details: [
			"Automated yield distribution reduces operational overhead",
			"Real-time reporting for multiple stakeholders",
			"Transparent performance tracking and investor communications",
			"Simplified compliance and audit trails",
		],
	},
	{
		title: "High-Net-Worth Individuals",
		description: "Turn Private Assets Into Digital Investment Vehicles",
		details: [
			"Tokenize personal property or portfolios",
			"Sell fractional ownership while retaining control",
			"Create family trusts or inheritance flows via tokens",
			"Unlock capital without traditional sales processes",
		],
	},
	{
		title: "Commercial Tenants",
		description: "Invest in the Properties You Occupy",
		details: [
			"Build equity while paying rent",
			"Aligned interests with property owners",
			"Long-term stability and lease renewal incentives",
			"Potential appreciation alongside property value growth",
		],
	},
];

const TokenizationInfo = () => {
	const [expandedSections, setExpandedSections] = useState<Set<number>>(
		new Set()
	);

	const toggleSection = (index: number) => {
		const newExpanded = new Set(expandedSections);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedSections(newExpanded);
	};

	return (
		<section className="py-20 relative overflow-hidden bg-gray-50">
			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-7xl mx-auto">
					<motion.h2
						className="text-center text-3xl md:text-4xl font-logo font-light text-gray-900 mb-4"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						From Concrete to Capital — Who Wins
					</motion.h2>
					<motion.p
						className="text-center text-gray-600 mb-12 text-lg font-light max-w-4xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.1 }}
					>
						From unlocking liquidity to global investor access, tokenization
						changes the game for everyone in CRE.
					</motion.p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
						{tokenizationSections.map((section, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.7, delay: index * 0.05 }}
							>
								<div className="bg-white border-2 border-[#D4A024] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
									<div className="p-6 pb-4">
										<div
											className="flex items-center justify-between cursor-pointer"
											onClick={() => toggleSection(index)}
										>
											<div className="flex-1">
												<h3 className="text-lg text-[#D4A024] mb-2 font-logo font-light">
													{section.title}
												</h3>
												<p className="text-sm text-gray-700 font-light font-logo">
													{section.description}
												</p>
											</div>
											<motion.div
												className="ml-4 text-[#D4A024]"
												animate={{
													rotate: expandedSections.has(index) ? 0 : -90,
												}}
												transition={{ duration: 0.3 }}
											>
												<ChevronDown className="h-5 w-5" />
											</motion.div>
										</div>
									</div>

									<AnimatePresence>
										{expandedSections.has(index) && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.4 }}
												style={{ overflow: "hidden" }}
											>
												<div className="px-6 pb-6 pt-0">
													<div className="border-t border-gray-200 pt-4">
														<ul className="space-y-2.5">
															{section.details.map((detail, i) => (
																<motion.li
																	key={i}
																	initial={{ x: -20, opacity: 0 }}
																	animate={{ x: 0, opacity: 1 }}
																	transition={{ delay: i * 0.1 }}
																	className="flex items-start"
																>
																	<div className="w-2 h-2 bg-[#D4A024] rounded-full mt-2 mr-3" />
																	<span className="text-gray-700 font-logo text-sm">
																		{detail}
																	</span>
																</motion.li>
															))}
														</ul>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

// --- Submit Property Section ---
const propertyTypes = [
	{ id: "ev-charging", name: "EV Charging Stations", icon: Activity },
	{ id: "wind-farms", name: "Wind Farms", icon: Wind },
	{ id: "solar-farms", name: "Solar Farms", icon: Sun },
	{ id: "multifamily", name: "Multifamily", icon: Building2 },
	{ id: "hospitality", name: "Hospitality", icon: Building },
	{ id: "office", name: "Office", icon: Building },
	{ id: "student-housing", name: "Student Housing", icon: HomeIcon },
	{ id: "datacenters", name: "Datacenters", icon: Warehouse },
	{ id: "mixed-use", name: "Mixed Use", icon: Layers },
	{ id: "retail", name: "Retail", icon: Building2 },
	{ id: "condominium", name: "Condominium", icon: HomeIcon },
	{ id: "industrial", name: "Industrial", icon: Warehouse },
];

const paymentMethods = [
	{
		name: "USD",
		icon: DollarSign,
		description: "Traditional payments",
		currencies: [],
	},
	{
		name: "Stablecoins",
		icon: Coins,
		description: "Digital currency",
		currencies: ["CREUSD", "USDC", "USDT"],
	},
];

const SubmitProperty = () => {
	const isMounted = useIsMounted();

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="absolute inset-0">
				<img
					src="/assets/list-property-bg.jpg"
					alt=""
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-white/95" />
			</div>
			<div className="container max-w-6xl mx-auto px-4 relative z-10">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-logo font-light text-gray-900 mb-6">
						List Your Property on{" "}
						<span className="text-[#D4A024]">Commertize</span>
					</h2>
					<p className="text-gray-600 leading-relaxed max-w-4xl mx-auto text-base md:text-lg font-light">
						Commertize connects your commercial property to a worldwide network
						of qualified investors. Whether you're an owner, developer, or asset
						manager, our platform makes it simple to tokenize your CRE and open
						it to fractional investment. Reach a broader audience, secure
						capital faster, and retain control — all with blockchain-powered
						transparency and efficiency.
					</p>
				</div>

				<div className="mb-12">
					<h3 className="text-2xl md:text-3xl font-light font-logo mb-8 text-gray-900 text-center">
						Your Property, Our Global Marketplace
					</h3>

					<div className="mb-16">
						<div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
							{isMounted && (
								<motion.div
									className="relative"
									animate={{ rotate: 360 }}
									transition={{
										duration: 35,
										repeat: Infinity,
										ease: "linear",
									}}
								>
									{propertyTypes.map((type, index) => {
										const angle = (index / propertyTypes.length) * 360;
										const radius = 200;
										const x = Math.cos((angle * Math.PI) / 180) * radius;
										const y = Math.sin((angle * Math.PI) / 180) * radius;

										return (
											<div key={`subnet-${type.id}`}>
												<div
													className="absolute bg-[#D4A024]"
													style={{
														left: 0,
														top: 0,
														width: Math.sqrt(x * x + y * y) + "px",
														height: "1px",
														opacity: 0.4,
														transform: `rotate(${Math.atan2(y, x) * (180 / Math.PI)}deg)`,
														transformOrigin: "0 50%",
													}}
												/>

												<motion.div
													className="absolute"
													style={{
														left: x - 60,
														top: y - 18,
													}}
													animate={{ rotate: -360 }}
													transition={{
														duration: 35,
														repeat: Infinity,
														ease: "linear",
													}}
												>
													<div className="flex items-center space-x-2 bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024]/40 rounded-lg px-3 py-2 hover:from-[#D4A024]/10 hover:to-[#D4A024]/20 hover:border-[#D4A024]/60 transition-all duration-200 shadow-lg">
														<div className="w-7 h-7 rounded-full bg-[#D4A024]/20 border border-[#D4A024]/50 flex items-center justify-center">
															<type.icon className="w-4 h-4 text-[#D4A024]" />
														</div>
														<div>
															<div className="text-xs font-light text-gray-800">
																{type.name}
															</div>
														</div>
													</div>
												</motion.div>
											</div>
										);
									})}

									{propertyTypes.map((_, index) => {
										const connections: React.ReactNode[] = [];

										[1, 2, 3, 4].forEach((offset) => {
											const targetIndex =
												(index + offset) % propertyTypes.length;
											if (
												index < targetIndex ||
												index + offset >= propertyTypes.length
											) {
												const angle1 = (index / propertyTypes.length) * 360;
												const angle2 =
													(targetIndex / propertyTypes.length) * 360;
												const radius = 200;
												const x1 = Math.cos((angle1 * Math.PI) / 180) * radius;
												const y1 = Math.sin((angle1 * Math.PI) / 180) * radius;
												const x2 = Math.cos((angle2 * Math.PI) / 180) * radius;
												const y2 = Math.sin((angle2 * Math.PI) / 180) * radius;

												const deltaX = x2 - x1;
												const deltaY = y2 - y1;
												const length = Math.sqrt(
													deltaX * deltaX + deltaY * deltaY
												);
												const rotation =
													Math.atan2(deltaY, deltaX) * (180 / Math.PI);

												const opacity =
													offset === 1
														? 0.35
														: offset === 2
															? 0.25
															: offset === 3
																? 0.18
																: 0.12;

												connections.push(
													<div
														key={`inter-${index}-${targetIndex}-${offset}`}
														className="absolute bg-[#D4A024]"
														style={{
															left: x1,
															top: y1,
															width: length + "px",
															height: "1px",
															opacity: opacity,
															transform: `rotate(${rotation}deg)`,
															transformOrigin: "0 50%",
														}}
													/>
												);
											}
										});

										return (
											<div key={`connections-${index}`}>{connections}</div>
										);
									})}
								</motion.div>
							)}

							<div
								className="absolute flex items-center justify-center"
								style={{ zIndex: 2 }}
							>
								<img
									src="/assets/logo.png"
									alt="Commertize"
									className="h-6 w-auto object-contain"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Accepted Payment Methods */}
				<div className="py-16 border-t border-gray-100">
					<div className="flex items-center justify-center gap-2 mb-10">
						<div className="w-5 h-5 rounded-full border-2 border-[#D4A024] flex items-center justify-center">
							<div className="w-2 h-2 rounded-full bg-[#D4A024]" />
						</div>
						<h3 className="text-xl md:text-2xl font-light text-gray-900">
							Accepted Payment Methods
						</h3>
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
						{paymentMethods.map((method) => (
							<div
								key={method.name}
								className="flex flex-col items-center text-center"
							>
								<div className="w-16 h-16 rounded-full bg-[#FDF6E3] border-2 border-[#D4A024]/30 flex items-center justify-center mb-4">
									<method.icon className="w-7 h-7 text-[#D4A024]" />
								</div>
								<h4 className="text-lg font-medium text-gray-900 mb-1">
									{method.name}
								</h4>
								<p className="text-sm text-gray-500 mb-3">
									{method.description}
								</p>
								{method.currencies.length > 0 && (
									<div className="flex flex-wrap gap-2 justify-center">
										{method.currencies.map((currency) => (
											<span
												key={currency}
												className="px-3 py-1 text-xs font-medium text-[#D4A024] bg-[#FDF6E3] border border-[#D4A024]/30 rounded-full"
											>
												{currency}
											</span>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Submit Property CTA */}
				<div className="py-16 border-t border-gray-100 text-center">
					<p className="text-gray-600 text-lg md:text-xl font-light max-w-3xl mx-auto mb-8 leading-relaxed">
						Take advantage of Commertize's global reach—submit your property
						today and discover new opportunities for growth and success.
					</p>
					<button className="inline-flex items-center justify-center px-8 py-4 bg-[#D4A024] text-white text-base font-medium rounded-lg hover:bg-[#B8881C] transition-colors shadow-lg hover:shadow-xl">
						Submit Your Property
					</button>
				</div>
			</div>
		</section>
	);
};

// --- Latest News Section ---
interface NewsArticle {
	id: string;
	slug: string;
	title: string;
	summary: string;
	category: string;
	imageUrl?: string;
	readTime: number;
	publishedAt: string;
}

const fallbackArticles: NewsArticle[] = [
	{
		id: "1",
		title: "Tokenization Revolutionizes Commercial Real Estate",
		slug: "tokenization-revolutionizes-cre",
		summary:
			"How blockchain technology is transforming property investment and ownership.",
		category: "Tokenization",
		imageUrl:
			"https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
		readTime: 5,
		publishedAt: "Jan 15, 2025",
	},
	{
		id: "2",
		title: "The Future of Fractional Property Investment",
		slug: "future-fractional-investment",
		summary:
			"Exploring how fractional ownership is democratizing real estate access.",
		category: "Markets",
		imageUrl:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
		readTime: 4,
		publishedAt: "Jan 10, 2025",
	},
	{
		id: "3",
		title: "AI-Powered Property Valuation Models",
		slug: "ai-property-valuation",
		summary:
			"Machine learning is changing how we assess commercial property values.",
		category: "Technology",
		imageUrl:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
		readTime: 6,
		publishedAt: "Jan 5, 2025",
	},
];

const formatNewsDate = (dateString: string) => {
	try {
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return dateString;
		return date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateString;
	}
};

const LatestNews = () => {
	const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);

	useEffect(() => {
		async function fetchNews() {
			try {
				const response = await fetch("/api/news?limit=3");
				if (response.ok) {
					const result = await response.json();
					if (result.data && result.data.length > 0) {
						setArticles(result.data.slice(0, 3));
					}
				}
			} catch (error) {
				console.error("Failed to fetch news:", error);
			}
		}
		fetchNews();
	}, []);

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			CRE: "bg-[#D4A024]",
			Tokenization: "bg-purple-500",
			Markets: "bg-yellow-500",
			Technology: "bg-blue-500",
			Regulation: "bg-red-500",
			DeFi: "bg-cyan-500",
			RWA: "bg-green-500",
			Crypto: "bg-orange-500",
			Infrastructure: "bg-teal-500",
		};
		return colors[category] || "bg-gray-500";
	};

	return (
		<section className="py-24 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
			<div className="relative z-10 w-full overflow-hidden mb-6">
				<div className="relative h-12 sm:h-16 md:h-20 flex items-center overflow-hidden mb-4">
					<motion.div
						animate={{ x: [0, -800] }}
						transition={{
							duration: 16,
							repeat: Infinity,
							ease: "linear",
							repeatType: "loop",
						}}
						className="flex items-center space-x-24"
						style={{ minWidth: "1600px" }}
					>
						{[
							"Latest News & Insights",
							"Latest News & Insights",
							"Latest News & Insights",
							"Latest News & Insights",
						].map((text, index) => (
							<motion.h2
								key={`${text}-${index}`}
								className="text-3xl md:text-4xl lg:text-5xl font-logo font-light text-gray-900 flex-shrink-0"
								style={{ minWidth: "400px", textAlign: "center" }}
							>
								Latest News & <span className="text-[#D4A024]">Insights</span>
							</motion.h2>
						))}
					</motion.div>
				</div>
			</div>

			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<div className="w-24 h-1 bg-gradient-to-r from-[#D4A024] to-yellow-600 rounded-full mx-auto mb-6"></div>
						<p className="text-xl text-gray-600 font-logo font-light max-w-3xl mx-auto">
							Stay informed with the latest developments in commercial real
							estate and tokenization
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-6">
						{articles.map((article, index) => (
							<motion.article
								key={article.id}
								className="w-full group cursor-pointer"
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								viewport={{ once: true }}
							>
								<Link href={`/news/${article.slug}`}>
									<div className="bg-white rounded-xl border border-[#D4A024] hover:shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col">
										<div className="relative h-44 overflow-hidden flex-shrink-0">
											<img
												src={
													article.imageUrl ||
													"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop"
												}
												alt={article.title}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
											/>
											<div className="absolute top-3 left-3">
												<span
													className={`px-3 py-1 rounded-full text-xs font-normal text-white ${getCategoryColor(article.category)}`}
												>
													{article.category}
												</span>
											</div>
										</div>

										<div className="p-5 flex-grow flex flex-col bg-white">
											<h3 className="text-base font-normal text-gray-900 mb-2 line-clamp-2 leading-tight">
												{article.title}
											</h3>

											<p className="text-gray-500 text-sm font-light mb-4 line-clamp-3 flex-grow leading-relaxed">
												{article.summary}
											</p>

											<div className="flex items-center gap-4 text-[#D4A024] text-xs">
												<div className="flex items-center gap-1.5">
													<Calendar size={12} />
													<span>{formatNewsDate(article.publishedAt)}</span>
												</div>
												<div className="flex items-center gap-1.5">
													<Clock size={12} />
													<span>{article.readTime} min read</span>
												</div>
											</div>
										</div>
									</div>
								</Link>
							</motion.article>
						))}
					</div>

					<div className="text-center mt-12">
						<Link href="/news">
							<button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D4A024] to-yellow-600 text-white rounded-xl font-light hover:shadow-lg transition-all">
								<span>View All News & Insights</span>
								<ArrowRight size={18} />
							</button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

// --- Portal (Dashboard) Logic ---

interface SidebarItemProps {
	icon: React.ComponentType<{ size?: number }>;
	label: string;
	active: boolean;
	onClick: () => void;
}

const SidebarItem = ({
	icon: Icon,
	label,
	active,
	onClick,
}: SidebarItemProps) => (
	<button
		onClick={onClick}
		className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : styles.sidebarItemInactive}`}
	>
		<Icon size={20} />
		{label}
	</button>
);

interface PortalProps {
	onLogout: () => void;
}

const Portal = ({ onLogout }: PortalProps) => {
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className={styles.portalContainer}>
			{/* Dark Mode Sidebar */}
			<div className={styles.sidebar}>
				<div style={{ padding: "2rem" }}>
					<Logo className="text-white" theme="light" />
				</div>

				<div style={{ flex: 1, paddingRight: "1rem" }}>
					<div className={styles.sidebarSectionTitle}>Main</div>
					<SidebarItem
						icon={LayoutDashboard}
						label="Overview"
						active={activeTab === "overview"}
						onClick={() => setActiveTab("overview")}
					/>
					<SidebarItem
						icon={Building}
						label="Marketplace"
						active={activeTab === "market"}
						onClick={() => setActiveTab("market")}
					/>
					<SidebarItem
						icon={PieChart}
						label="Portfolio"
						active={activeTab === "portfolio"}
						onClick={() => setActiveTab("portfolio")}
					/>
					<SidebarItem
						icon={Activity}
						label="Secondary Market"
						active={activeTab === "secondary"}
						onClick={() => setActiveTab("secondary")}
					/>

					<div
						className={styles.sidebarSectionTitle}
						style={{ paddingTop: "1.5rem" }}
					>
						Account
					</div>
					<SidebarItem
						icon={FileText}
						label="Documents"
						active={activeTab === "docs"}
						onClick={() => setActiveTab("docs")}
					/>
					<SidebarItem
						icon={Settings}
						label="Settings"
						active={activeTab === "settings"}
						onClick={() => setActiveTab("settings")}
					/>
				</div>

				<div
					style={{
						padding: "1.5rem",
						borderTop: "1px solid rgba(255,255,255,0.1)",
					}}
				>
					<button
						onClick={onLogout}
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.75rem",
							color: "#94a3b8",
							fontSize: "0.875rem",
							fontWeight: "500",
						}}
					>
						<LogOut size={16} /> Sign Out
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div className={styles.portalContent}>
				{/* Top Bar */}
				<header className={styles.portalHeader}>
					<div className={styles.searchBar}>
						<Search className="text-slate-400" size={20} color="#94a3b8" />
						<input
							type="text"
							placeholder="Search properties, sponsors, or documents..."
							className={styles.searchInput}
						/>
					</div>
					<div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
						<button
							style={{
								position: "relative",
								padding: "0.5rem",
								color: "#94a3b8",
							}}
						>
							<Bell size={20} />
							<span
								style={{
									position: "absolute",
									top: "0.5rem",
									right: "0.5rem",
									width: "0.5rem",
									height: "0.5rem",
									backgroundColor: "#ef4444",
									borderRadius: "9999px",
									border: "1px solid white",
								}}
							></span>
						</button>
						<div
							style={{
								height: "2rem",
								width: "1px",
								backgroundColor: "#e2e8f0",
							}}
						></div>
						<div
							style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
						>
							<div
								style={{ textAlign: "right" }}
								className={styles.userInfoDesktop}
							>
								<div
									style={{
										fontSize: "0.875rem",
										fontWeight: "700",
										color: "#0f172a",
									}}
								>
									James Anderson
								</div>
								<div style={{ fontSize: "0.75rem", color: "#64748b" }}>
									Accredited Investor
								</div>
							</div>
							<div
								style={{
									width: "2.5rem",
									height: "2.5rem",
									backgroundColor: "#C59B26",
									color: "white",
									borderRadius: "9999px",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontWeight: "700",
									fontSize: "1.125rem",
									boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
								}}
							>
								J
							</div>
						</div>
					</div>
				</header>

				{/* Scrollable Dashboard Content */}
				<main className={styles.portalMain}>
					{activeTab === "overview" && (
						<div
							style={{
								maxWidth: "72rem",
								margin: "0 auto",
								display: "flex",
								flexDirection: "column",
								gap: "2rem",
							}}
						>
							{/* Financial Header */}
							<div
								className={styles.flexBetween}
								style={{ alignItems: "flex-end" }}
							>
								<div>
									<h1
										style={{
											fontSize: "1.5rem",
											fontWeight: "700",
											color: "#0f172a",
											marginBottom: "0.25rem",
										}}
									>
										Portfolio Performance
									</h1>
									<p style={{ color: "#64748b" }}>
										Last updated: Today, 09:41 AM
									</p>
								</div>
								<div style={{ display: "flex", gap: "0.75rem" }}>
									<Button
										variant="outlined"
										style={{
											backgroundColor: "white",
											borderColor: "#e2e8f0",
											color: "#475569",
										}}
									>
										Download Report
									</Button>
									<Button>Add Capital</Button>
								</div>
							</div>

							{/* Cards Row */}
							<div className={styles.dashboardGrid}>
								<div className={styles.statCard}>
									<div className={styles.statCardHeader}>
										<div
											className={`${styles.statIcon} ${styles.statIconGreen}`}
										>
											<DollarSign size={20} />
										</div>
										<span
											className={`${styles.statBadge} ${styles.statBadgeGreen}`}
										>
											+12.4%
										</span>
									</div>
									<div className={styles.statLabel}>Total Net Equity</div>
									<div className={styles.statValue}>$1,245,000.00</div>
								</div>
								<div className={styles.statCard}>
									<div className={styles.statCardHeader}>
										<div
											className={`${styles.statIcon} ${styles.statIconBlue}`}
										>
											<Building size={20} />
										</div>
										<span
											className={`${styles.statBadge} ${styles.statBadgeGray}`}
										>
											4 Active
										</span>
									</div>
									<div className={styles.statLabel}>Properties Owned</div>
									<div className={styles.statValue}>
										12,450{" "}
										<span
											style={{
												fontSize: "0.875rem",
												color: "#94a3b8",
												fontWeight: "400",
											}}
										>
											Shares
										</span>
									</div>
								</div>
								<div className={styles.statCard}>
									<div className={styles.statCardHeader}>
										<div
											className={`${styles.statIcon} ${styles.statIconPurple}`}
										>
											<Wallet size={20} />
										</div>
										<span
											className={`${styles.statBadge} ${styles.statBadgeGray}`}
										>
											Pending
										</span>
									</div>
									<div className={styles.statLabel}>Uninvested Cash</div>
									<div className={styles.statValue}>$45,000.00</div>
								</div>
							</div>

							{/* Active Listings Table Section */}
							<div className={styles.tableContainer}>
								<div className={styles.tableHeader}>
									<h3
										style={{
											fontWeight: "300",
											fontSize: "1.125rem",
											color: "#0f172a",
										}}
									>
										Upcoming Opportunities
									</h3>
									<div style={{ display: "flex", gap: "0.5rem" }}>
										<button
											style={{
												padding: "0.5rem",
												borderRadius: "0.25rem",
												color: "#94a3b8",
											}}
										>
											<Filter size={18} />
										</button>
									</div>
								</div>
								<div style={{ overflowX: "auto" }}>
									<table className={styles.table}>
										<thead>
											<tr>
												<th className={styles.th}>Property</th>
												<th className={styles.th}>Type</th>
												<th className={styles.th}>Sponsor</th>
												<th className={styles.th}>Units</th>
												<th className={styles.th}>Status</th>
												<th className={styles.th}></th>
											</tr>
										</thead>
										<tbody>
											{MOCK_PROPERTIES.map((prop) => (
												<tr key={prop.id} className={styles.tableRow}>
													<td className={styles.td}>
														<div
															style={{ fontWeight: "300", color: "#0f172a" }}
														>
															{prop.title}
														</div>
														<div
															style={{ fontSize: "0.75rem", color: "#64748b" }}
														>
															{prop.location}
														</div>
													</td>
													<td
														className={styles.td}
														style={{ fontSize: "0.875rem", color: "#475569" }}
													>
														{prop.type}
													</td>
													<td className={styles.td}>
														<span
															className={styles.financialDataNeutral}
															style={{ fontSize: "0.875rem" }}
														>
															{prop.sponsor}
														</span>
													</td>
													<td className={styles.td}>
														<span
															className={styles.financialData}
															style={{ fontSize: "0.875rem", color: "#475569" }}
														>
															{prop.units} Units
														</span>
													</td>
													<td className={styles.td}>
														<span
															style={{
																fontSize: "0.75rem",
																color: "#F59E0B",
																fontWeight: "300",
															}}
														>
															{prop.status}
														</span>
													</td>
													<td
														className={styles.td}
														style={{ textAlign: "right" }}
													>
														<button className={styles.viewDealBtn}>
															View Deal
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
					{activeTab !== "overview" && (
						<div
							style={{
								height: "100%",
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								color: "#cbd5e1",
							}}
						>
							<Building
								size={64}
								strokeWidth={1}
								style={{ marginBottom: "1rem" }}
							/>
							<div
								style={{
									fontSize: "1.25rem",
									fontWeight: "500",
									color: "#64748b",
								}}
							>
								Module Under Construction
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

// --- Main App Controller ---

export default function Home() {
	const [view, setView] = useState("landing");
	const [activeTab, setActiveTab] = useState("investors"); // For How It Works tabs

	const handleLogout = () => {
		setView("landing");
		window.scrollTo(0, 0);
	};

	if (view.includes("portal")) {
		return <Portal onLogout={handleLogout} />;
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				fontFamily: "var(--font-sans)",
				backgroundColor: "#FAFAF9",
				color: "#0f172a",
			}}
		>
			<Hero />
			<AboutUs />
			<WhyCommertize />
			<CommertizeCollection />
			<TokenizationInfo />
			<SubmitProperty />
			<LatestNews />

			{/* How It Works Section - Enhanced */}
			<section className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
				<div className="absolute inset-0 opacity-30">
					<div className="absolute top-20 left-10 w-72 h-72 bg-[#D4A024]/10 rounded-full blur-3xl" />
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4A024]/5 rounded-full blur-3xl" />
				</div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="text-center mb-16"
					>
						<span className="inline-block px-4 py-2 bg-[#D4A024]/10 text-[#D4A024] rounded-full text-sm font-medium mb-4 tracking-wider uppercase">
							The Process
						</span>
						<h2 className="text-4xl md:text-5xl font-logo font-light text-gray-900 mb-6">
							How <span className="text-[#D4A024]">Commertize</span> Works
						</h2>
						<p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
							Start investing in institutional-grade real estate in minutes, not
							months
						</p>
					</motion.div>

					<div className="flex justify-center mb-12">
						<div className="inline-flex bg-white rounded-full p-1.5 shadow-lg border border-gray-100">
							<button
								onClick={() => setActiveTab("investors")}
								className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === "investors"
									? "bg-gradient-to-r from-[#D4A024] to-yellow-500 text-white shadow-md"
									: "text-gray-600 hover:text-gray-900"
									}`}
							>
								For Investors
							</button>
							<button
								onClick={() => setActiveTab("sponsors")}
								className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${activeTab === "sponsors"
									? "bg-gradient-to-r from-[#D4A024] to-yellow-500 text-white shadow-md"
									: "text-gray-600 hover:text-gray-900"
									}`}
							>
								For Sponsors
							</button>
						</div>
					</div>

					<div className="relative">
						<div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4A024]/30 to-transparent -translate-y-1/2 z-0" />

						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
							{activeTab === "investors"
								? [
									{
										icon: ShieldCheck,
										title: "Complete KYC",
										desc: "Verify your identity and accreditation status through our secure portal",
									},
									{
										icon: Search,
										title: "Browse Properties",
										desc: "Explore vetted commercial properties across asset classes and regions",
									},
									{
										icon: Wallet,
										title: "Invest",
										desc: "Purchase fractional shares using fiat or cryptocurrency",
									},
									{
										icon: TrendingUp,
										title: "Earn Distributions",
										desc: "Receive quarterly income directly to your account or wallet",
									},
									{
										icon: ArrowLeftRight,
										title: "Trade Anytime",
										desc: "Sell shares on our regulated secondary market instantly",
									},
								].map((step, index) => (
									<motion.div
										key={step.title}
										initial={{ opacity: 0, y: 40 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className="group"
									>
										<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#D4A024]/30 transition-all duration-300 h-full relative">
											<div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#D4A024] to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
												{index + 1}
											</div>
											<div className="pt-4">
												<div className="w-14 h-14 bg-gradient-to-br from-[#D4A024]/10 to-[#D4A024]/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-[#D4A024]/20 group-hover:to-[#D4A024]/10 transition-all duration-300">
													<step.icon className="w-7 h-7 text-[#D4A024]" />
												</div>
												<h4 className="text-lg font-medium text-gray-900 text-center mb-2">
													{step.title}
												</h4>
												<p className="text-sm text-gray-500 font-light text-center leading-relaxed">
													{step.desc}
												</p>
											</div>
										</div>
									</motion.div>
								))
								: [
									{
										icon: ShieldCheck,
										title: "Complete KYC",
										desc: "Verify identity and credentials before submitting properties",
									},
									{
										icon: FileText,
										title: "Submit Property",
										desc: "Upload property details through our streamlined portal",
									},
									{
										icon: Search,
										title: "Due Diligence",
										desc: "Comprehensive compliance and verification review",
									},
									{
										icon: Globe,
										title: "List to Market",
										desc: "Go live to our network of 14,000+ accredited investors",
									},
									{
										icon: TrendingUp,
										title: "Raise Capital",
										desc: "Fund faster with fractional ownership and blockchain",
									},
								].map((step, index) => (
									<motion.div
										key={step.title}
										initial={{ opacity: 0, y: 40 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.5, delay: index * 0.1 }}
										className="group"
									>
										<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#D4A024]/30 transition-all duration-300 h-full relative">
											<div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#D4A024] to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
												{index + 1}
											</div>
											<div className="pt-4">
												<div className="w-14 h-14 bg-gradient-to-br from-[#D4A024]/10 to-[#D4A024]/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-[#D4A024]/20 group-hover:to-[#D4A024]/10 transition-all duration-300">
													<step.icon className="w-7 h-7 text-[#D4A024]" />
												</div>
												<h4 className="text-lg font-medium text-gray-900 text-center mb-2">
													{step.title}
												</h4>
												<p className="text-sm text-gray-500 font-light text-center leading-relaxed">
													{step.desc}
												</p>
											</div>
										</div>
									</motion.div>
								))}
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className="mt-16 text-center"
					>
						<div className="inline-flex items-center gap-8 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-lg border border-[#D4A024]/20">
							<div className="text-center">
								<div className="text-3xl font-light text-[#D4A024]">$1K</div>
								<div className="text-xs text-gray-500 font-light">
									Min. Investment
								</div>
							</div>
							<div className="w-px h-10 bg-gray-200" />
							<div className="text-center">
								<div className="text-3xl font-light text-[#D4A024]">5 min</div>
								<div className="text-xs text-gray-500 font-light">
									Onboarding Time
								</div>
							</div>
							<div className="w-px h-10 bg-gray-200" />
							<div className="text-center">
								<div className="text-3xl font-light text-[#D4A024]">24/7</div>
								<div className="text-xs text-gray-500 font-light">
									Trading Access
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Contact Us Section */}
			<section className="py-20 bg-white relative z-20" id="contact">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="max-w-4xl mx-auto"
					>
						<div className="text-center mb-12">
							<div className="w-14 h-14 bg-[#D4A024]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#D4A024]/20">
								<svg
									className="w-7 h-7 text-[#D4A024]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
								Contact Us
							</h2>
							<p className="text-gray-600 font-light max-w-xl mx-auto">
								Have questions about tokenized real estate or want to learn more
								about Commertize? We'd love to hear from you.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
							<div className="bg-[#FDF8F3] rounded-2xl p-6 text-center border border-[#D4A024]/10">
								<div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
									<svg
										className="w-6 h-6 text-[#D4A024]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<h3 className="text-gray-900 mb-2">Email</h3>
								<a
									href="mailto:support@commertize.com"
									className="text-[#D4A024] hover:text-[#B8860B] transition-colors"
								>
									support@commertize.com
								</a>
							</div>

							<div className="bg-[#FDF8F3] rounded-2xl p-6 text-center border border-[#D4A024]/10">
								<div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
									<svg
										className="w-6 h-6 text-[#D4A024]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<h3 className="text-gray-900 mb-2">Location</h3>
								<p className="text-gray-600 font-light">Global Operations</p>
							</div>

							<div className="bg-[#FDF8F3] rounded-2xl p-6 text-center border border-[#D4A024]/10">
								<div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
									<svg
										className="w-6 h-6 text-[#D4A024]"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<h3 className="text-gray-900 mb-2">Response Time</h3>
								<p className="text-gray-600 font-light">Within 24 hours</p>
							</div>
						</div>

						<div className="bg-gradient-to-r from-[#D4A024]/5 to-[#E6BE8A]/5 rounded-3xl p-8 md:p-10 border border-[#D4A024]/10">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
								<div>
									<h3 className="text-2xl font-light text-gray-900 mb-3">
										Get in Touch
									</h3>
									<p className="text-gray-600 font-light mb-6">
										Whether you're an investor looking to explore tokenized real
										estate opportunities or a property sponsor interested in
										tokenization, our team is here to help.
									</p>
									<div className="flex flex-wrap gap-3">
										<a
											href="mailto:support@commertize.com"
											className="inline-flex items-center gap-2 bg-[#D4A024] hover:bg-[#B8860B] text-white px-6 py-3 rounded-xl transition-colors"
										>
											<svg
												className="w-5 h-5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={1.5}
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
											Send Email
										</a>
										<Link
											href="/waitlist"
											className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-xl border border-gray-200 transition-colors"
										>
											Join Waitlist
											<ArrowRight className="w-4 h-4" />
										</Link>
									</div>
								</div>
								<div className="flex justify-center md:justify-end">
									<div className="w-48 h-48 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-[#D4A024]/10">
										<div className="text-center">
											<div className="w-16 h-16 bg-[#D4A024]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
												<Building2 className="w-8 h-8 text-[#D4A024]" />
											</div>
											<p className="text-sm text-gray-500 font-light">
												Commertize
											</p>
											<p className="text-xs text-gray-400">
												Real Estate, Tokenized
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Investment Notice */}
			<section className="py-8 bg-[#FDF8F3] border-t border-[#D4A024]/10">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="max-w-4xl mx-auto">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#D4A024]/10 flex items-center justify-center mt-1">
								<svg
									className="w-5 h-5 text-[#D4A024]"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<h4 className="text-sm font-light text-gray-900 mb-2">
									Investment Notice
								</h4>
								<p className="text-xs text-gray-600 font-light leading-relaxed">
									Investing in tokenized real estate involves risks, including
									the potential loss of principal. Past performance is not
									indicative of future results. Commertize does not provide
									investment, legal, or tax advice. All investments are subject
									to market conditions and regulatory requirements. Please
									consult with qualified professionals before making any
									investment decisions. Securities offerings, if any, are made
									only to accredited investors in compliance with applicable
									securities laws.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Enhanced Footer */}
			<footer className="bg-white relative z-20">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
					<div className="grid grid-cols-1 md:grid-cols-5 gap-8">
						{/* Column 1: Logo & Social */}
						<div>
							<div className="mb-4">
								<img
									src="/assets/logo.png"
									alt="Commertize"
									className="h-8 w-auto"
								/>
							</div>
							<p className="text-sm mb-6">
								Commercial Real Estate, Revolutionized.
								<br />
								Liquid. Transparent. Global.
							</p>
							<div className="mb-4">
								<a
									href="mailto:support@commertize.com"
									className="text-sm text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
								>
									support@commertize.com
								</a>
							</div>
							<div className="mb-6">
								<h4 className="font-semibold mb-3 text-sm text-[#D4A024]">
									Social Links
								</h4>
								<div className="flex flex-wrap gap-3">
									<a
										href="https://linkedin.com/company/commertize"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
										title="LinkedIn"
									>
										<svg
											className="h-5 w-5"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
										</svg>
									</a>
									<a
										href="https://x.com/commertize"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
										title="X"
									>
										<svg
											className="h-5 w-5"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
										</svg>
									</a>
									<a
										href="https://instagram.com/commertize"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
										title="Instagram"
									>
										<svg
											className="h-5 w-5"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
										</svg>
									</a>
									<a
										href="https://discord.gg/commertize"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
										title="Discord"
									>
										<svg
											className="h-5 w-5"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
										</svg>
									</a>
									<a
										href="https://t.me/commertize"
										target="_blank"
										rel="noopener noreferrer"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
										title="Telegram"
									>
										<svg
											className="h-5 w-5"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
										</svg>
									</a>
								</div>
							</div>
						</div>

						{/* Column 2: Quick Links */}
						<div>
							<h4 className="font-semibold mb-4 text-[#D4A024]">Quick Links</h4>
							<ul className="space-y-2">
								<li>
									<a
										href="/marketplace"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Explore Marketplace
									</a>
								</li>
								<li>
									<a
										href="/dashboard"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Submit Property
									</a>
								</li>
								<li>
									<a
										href="#about"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										About Us
									</a>
								</li>
								<li>
									<a
										href="#contact"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Contact
									</a>
								</li>
								<li>
									<a
										href="/waitlist"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Join Waitlist
									</a>
								</li>
							</ul>
						</div>

						{/* Column 3: Divisions */}
						<div>
							<h4 className="font-semibold mb-4 text-[#D4A024]">Divisions</h4>
							<ul className="space-y-2">
								<li>
									<a
										href="/marketplace"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Marketplace
									</a>
								</li>
								<li>
									<a
										href="/defi"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										DeFi & Nexus
									</a>
								</li>
								<li>
									<a
										href="/omnigrid"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										OmniGrid
									</a>
								</li>
							</ul>
						</div>

						{/* Column 4: Legal */}
						<div>
							<h4 className="font-semibold mb-4 text-[#D4A024]">Legal</h4>
							<ul className="space-y-2">
								<li>
									<a
										href="/privacy"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="/terms"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Terms of Service
									</a>
								</li>
								<li>
									<a
										href="/disclaimer"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Disclaimer
									</a>
								</li>
								<li>
									<a
										href="/aml-policy"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										AML Policy
									</a>
								</li>
								<li>
									<a
										href="/cookie-policy"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										Cookie Policy
									</a>
								</li>
								<li>
									<a
										href="/kyb-policy"
										className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors"
									>
										KYB Policy
									</a>
								</li>
							</ul>
						</div>

						{/* Column 5: Newsletter */}
						<div>
							<h4 className="font-semibold mb-4 text-[#D4A024]">Newsletter</h4>
							<p className="text-sm mb-4 text-[#D4A024]">
								Stay updated with our latest properties and news
							</p>
							<form className="flex gap-2" id="subscribe">
								<input
									type="email"
									placeholder="Enter your email"
									className="flex-1 px-3 py-2 text-black placeholder:text-black bg-[#D4A024]/10 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
								/>
								<button
									type="submit"
									className="px-4 py-2 bg-[#D4A024] text-white font-medium rounded-lg hover:bg-[#D4A024]/90 transition-colors"
								>
									Subscribe
								</button>
							</form>
						</div>
					</div>

					{/* Bottom Section */}
					<div className="border-t border-gray-200 mt-8 pt-8 space-y-4">
						<div className="text-center text-sm">
							<p>© 2025 Commertize. All rights reserved.</p>
						</div>

						{/* Legal Disclaimer Box */}
						<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
							<p className="font-semibold mb-2">
								Legal & Regulatory Compliance
							</p>
							<p className="mb-2">
								Commertize operates in compliance with the GENIUS Act (Greater
								Equity and Nondiscrimination for Investors Using Security
								Tokens). All tokenized securities offered on this platform are
								subject to federal securities laws and regulations.
							</p>
							<p className="mb-2">
								<strong>Investment Risks:</strong> Real estate investments
								involve substantial risk. Past performance does not guarantee
								future results. Investors may lose all or a portion of their
								investment. All investments are subject to market, regulatory,
								and liquidity risks.
							</p>
							<p>
								<strong>Regulatory Status:</strong> Securities offered through
								this platform are conducted in accordance with applicable
								exemptions under Regulation D (506(b)/506(c)), Regulation A+, or
								Regulation Crowdfunding. Investors must meet accreditation
								requirements where applicable.
							</p>
						</div>
					</div>
				</div>
			</footer>
			<ChatGPTWidget />
		</div>
	);
}
