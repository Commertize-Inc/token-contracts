/**
 * OnboardingPage - this is the main onboarding section for new users
 *
 * handles both investor and sponsor flows, shows the "who wins" carousel
 * and the network graph with all the property types we support
 *
 * theres alot going on here so i tried to break it up into sections
 */

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
	Activity,
	Wind,
	Sun,
	Building2,
	Building,
	Home as HomeIcon,
	Warehouse,
	Layers,
	DollarSign,
	Coins,
	ShieldCheck,
	Search,
	Wallet,
	TrendingUp,
	ArrowLeftRight,
	FileText,
	Globe,
} from "lucide-react";
import { useIsMounted, usePostHog } from "@commertize/utils/client";

// brand colors - keep these consistent with the rest of the site
const DARK_GOLD = "#DDB35F";
const OFF_WHITE = "#FAFAF9";
const GOLD_GRADIENT = `linear-gradient(135deg, ${DARK_GOLD} 0%, #C9A84E 100%)`;

// all the different property types we show in the network graph
// might add more later as we expand to other asset classes
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
		currencies: ["Bank Transfer", "Wire"],
	},
	{
		name: "Stablecoins",
		icon: Coins,
		description: "Digital currency",
		currencies: ["CREUSD", "USDC", "USDT"],
	},
];

// content for the "who wins" carousel - each card shows a different user type
// and how tokenization benifits them specifically
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
			"Access top-tier listings with $100-$1,000 minimums",
			"Portfolio diversification beyond stocks and bonds",
			"Passive income through automated rental distributions",
		],
	},
	{
		title: "Family Offices",
		description: "Multi-Generational Wealth Management Simplified",
		details: [
			"Easier estate planning and inheritance distribution through tokens",
			"Diversification across multiple listings with smaller capital per asset",
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

/**
 * MarqueeCard - individual card in the who wins carousel
 *
 * on mobile it expands when you tap it, on desktop it expands on hover
 * the gold border shows which one is currently selected
 */
function MarqueeCard({
	section,
	index,
	isMobile,
	isExpanded,
	isHighlighted,
	onToggle,
}: {
	section: (typeof tokenizationSections)[number];
	index: number;
	isMobile?: boolean;
	isExpanded?: boolean;
	isHighlighted?: boolean; // Only this card has gold border when all expanded
	onToggle?: () => void;
}) {
	// mobile vs desktop have diffrent behaviors here
	// on mobile the border shows when its highlighted, desktop uses css hover
	const showGoldBorder = isMobile ? isHighlighted : false;
	const showTitle = isMobile ? isHighlighted : false;

	return (
		<div
			className={`marquee-card flex-shrink-0 mx-3 transition-all duration-300 ease-out ${
				isMobile ? "w-[280px]" : "w-[320px]"
			} ${isMobile && isHighlighted ? "transform -translate-y-1 z-50" : ""}`}
			data-index={index}
			onClick={isMobile ? onToggle : undefined}
		>
			<div
				className={`marquee-card-inner bg-white border-2 rounded-xl shadow-lg transition-all duration-300 overflow-hidden h-full ${
					showGoldBorder ? "border-[#C59B26] shadow-xl" : "border-transparent"
				}`}
				style={{
					borderColor: showGoldBorder ? DARK_GOLD : "rgba(197,155,38,0.2)",
				}}
			>
				{/* card header with title and description */}
				<div className="p-5">
					<h3
						className={`marquee-card-title text-base font-medium mb-2 transition-colors duration-300 ${
							showTitle ? "text-[#C59B26]" : ""
						}`}
					>
						{section.title}
					</h3>
					<p className="text-sm text-gray-600 font-light leading-relaxed">
						{section.description}
					</p>
				</div>

				{/* the details section that expands - uses css on desktop, state on mobile */}
				<div
					className={`overflow-hidden transition-all duration-300 ease-out ${
						isMobile
							? isExpanded
								? "max-h-[300px] opacity-100"
								: "max-h-0 opacity-0"
							: "marquee-card-details"
					}`}
				>
					<div className="px-5 pb-5">
						<div
							className="border-t pt-4"
							style={{ borderColor: `${DARK_GOLD}30` }}
						>
							<ul className="space-y-2">
								{section.details.map((detail, i) => (
									<li key={i} className="flex items-start">
										<span
											className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 mr-2.5"
											style={{ backgroundColor: DARK_GOLD }}
										/>
										<span className="text-gray-700 text-xs font-light leading-relaxed">
											{detail}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * NetworkGraph - the spinning circle thing with all the property types
 *
 * shows all the diffrent asset classes we support with a nice animation
 * shrinks down on mobile so it fits the screen better
 */
function NetworkGraph() {
	const isMounted = useIsMounted();
	const [isMobileGraph, setIsMobileGraph] = useState(false);

	useEffect(() => {
		const checkMobile = () => setIsMobileGraph(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	if (!isMounted) return <div className="h-[650px] w-full" />;

	// gotta make it smaller on mobile or it goes off screen
	const RADIUS = isMobileGraph ? 140 : 270;

	return (
		<div
			className={`relative w-full flex items-center justify-center overflow-hidden ${isMobileGraph ? "h-[380px]" : "h-[650px]"}`}
		>
			<motion.div
				className="relative"
				animate={{ rotate: 360 }}
				transition={{
					duration: 50,
					repeat: Infinity,
					ease: "linear",
				}}
			>
				{propertyTypes.map((type, index) => {
					const angle = (index / propertyTypes.length) * 360;
					const x = Math.cos((angle * Math.PI) / 180) * RADIUS;
					const y = Math.sin((angle * Math.PI) / 180) * RADIUS;

					return (
						<div key={`subnet-${type.id}`}>
							{/* the line connecting each node to the center */}
							<div
								className="absolute"
								style={{
									left: 0,
									top: 0,
									width: Math.sqrt(x * x + y * y) + "px",
									height: "1px",
									background: `linear-gradient(90deg, ${DARK_GOLD} 0%, transparent 100%)`,
									opacity: 0.4,
									transform: `rotate(${Math.atan2(y, x) * (180 / Math.PI)}deg)`,
									transformOrigin: "0 50%",
								}}
							/>

							{/* the actual property type node with icon - scales down on mobile */}
							<motion.div
								className="absolute"
								style={{
									left: isMobileGraph ? x - 35 : x - 52,
									top: isMobileGraph ? y - 10 : y - 14,
								}}
								animate={{ rotate: -360 }}
								transition={{
									duration: 50,
									repeat: Infinity,
									ease: "linear",
								}}
							>
								<div
									className={`flex items-center rounded-md transition-all duration-200 shadow-sm border bg-white ${
										isMobileGraph
											? "space-x-1 px-1 py-1"
											: "space-x-1.5 px-2 py-1.5"
									}`}
									style={{
										borderColor: DARK_GOLD,
									}}
								>
									<div
										className={`rounded-full flex items-center justify-center ${isMobileGraph ? "w-3 h-3" : "w-5 h-5"}`}
										style={{
											backgroundColor: DARK_GOLD,
										}}
									>
										<type.icon
											className={
												isMobileGraph
													? "w-1.5 h-1.5 text-white"
													: "w-2.5 h-2.5 text-white"
											}
										/>
									</div>
									<div>
										<div
											className={`font-semibold uppercase tracking-wide ${isMobileGraph ? "text-[6px]" : "text-[10px]"}`}
											style={{ color: DARK_GOLD }}
										>
											{type.name}
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					);
				})}

				{/* all the little lines between nodes - creates that web effect */}
				{propertyTypes.map((_, index) => {
					const connections: React.ReactNode[] = [];
					[1, 2, 3].forEach((offset) => {
						const targetIndex = (index + offset) % propertyTypes.length;
						if (index < targetIndex || index + offset >= propertyTypes.length) {
							const angle1 = (index / propertyTypes.length) * 360;
							const angle2 = (targetIndex / propertyTypes.length) * 360;
							const x1 = Math.cos((angle1 * Math.PI) / 180) * RADIUS;
							const y1 = Math.sin((angle1 * Math.PI) / 180) * RADIUS;
							const x2 = Math.cos((angle2 * Math.PI) / 180) * RADIUS;
							const y2 = Math.sin((angle2 * Math.PI) / 180) * RADIUS;

							const deltaX = x2 - x1;
							const deltaY = y2 - y1;
							const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
							const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

							connections.push(
								<div
									key={`inter-${index}-${targetIndex}-${offset}`}
									className="absolute"
									style={{
										left: x1,
										top: y1,
										width: length + "px",
										height: "1px",
										opacity: 0.2,
										backgroundColor: DARK_GOLD,
										transform: `rotate(${rotation}deg)`,
										transformOrigin: "0 50%",
									}}
								/>
							);
						}
					});
					return <div key={`connections-${index}`}>{connections}</div>;
				})}
			</motion.div>

			{/* commertize logo in the center of the graph */}
			<div
				className={`absolute flex items-center justify-center bg-white rounded-full shadow-md border z-10 ${isMobileGraph ? "p-1" : "p-2"}`}
				style={{ borderColor: `${DARK_GOLD}40` }}
			>
				<img
					src="/assets/logo.png"
					alt="Commertize"
					className={
						isMobileGraph
							? "h-3 w-auto object-contain"
							: "h-5 w-auto object-contain"
					}
				/>
			</div>
		</div>
	);
}

// content that changes based on wether the user is an investor or sponsor
// keeps everything in one place so its easy to update
const sectionOneContent = {
	investors: {
		heading: "Invest in the Future with",
		subheading: "Your Capital, Global Opportunities",
		body: "Commertize connects you to a worldwide marketplace of institutional-grade real estate. Whether you're an accredited individual or a family office, our platform makes it simple to access fractionalized CRE. Diversify your holdings, secure ownership on-chain, and trade 24/7 with complete transparency.",
		cta: "Start Investing",
	},
	sponsors: {
		heading: "List Your Property on",
		subheading: "Your Property, Our Global Marketplace",
		body: "Commertize connects your commercial property to a worldwide network of qualified investors. Whether you're an owner, developer, or asset manager, our platform makes it simple to tokenize your CRE and open it to fractional investment.",
		cta: "Submit Your Property",
	},
};

/**
 * SectionOne - the "list your property" or "invest" section
 *
 * content changes dynamicly based on which tab is selected
 * also has the network graph and payment methods
 */
function SectionOne({ activeTab }: { activeTab: "investors" | "sponsors" }) {
	const content = sectionOneContent[activeTab];
	const posthog = usePostHog();

	return (
		<div
			className="py-20 relative overflow-hidden"
			style={{ backgroundColor: OFF_WHITE }}
		>
			<div className="container max-w-7xl mx-auto px-4 relative z-10">
				<div className="text-center mb-16">
					<motion.h2
						key={`heading-${activeTab}`}
						className="text-4xl md:text-5xl font-light text-gray-900 mb-6"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						{content.heading}{" "}
						<span style={{ color: DARK_GOLD }}>Commertize</span>
					</motion.h2>
					<motion.p
						key={`body-${activeTab}`}
						className="text-gray-600 leading-relaxed max-w-3xl mx-auto text-lg font-light"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
					>
						{content.body}
					</motion.p>
				</div>

				<div className="mb-12">
					<motion.h3
						key={`subheading-${activeTab}`}
						className="text-2xl font-light mb-8 text-gray-500 text-center uppercase tracking-widest"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						{content.subheading}
					</motion.h3>
					<NetworkGraph />
				</div>

				{/* shows what payment methods we accept - fiat and crypto */}
				<div className="py-12 border-t border-gray-200/60 max-w-4xl mx-auto">
					<div className="flex items-center justify-center gap-3 mb-10">
						<span className="h-px w-12 bg-gray-300"></span>
						<h3 className="text-lg font-light text-gray-500 uppercase tracking-widest">
							Accepted Payment Methods
						</h3>
						<span className="h-px w-12 bg-gray-300"></span>
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-12">
						{paymentMethods.map((method) => (
							<div
								key={method.name}
								className="flex flex-col items-center text-center group"
							>
								<div
									className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border transition-all duration-300 group-hover:shadow-md"
									style={{
										backgroundColor: "#fff",
										borderColor: `${DARK_GOLD}40`,
									}}
								>
									<method.icon
										className="w-6 h-6"
										style={{ color: DARK_GOLD }}
									/>
								</div>
								<h4 className="text-lg font-medium text-gray-900 mb-1">
									{method.name}
								</h4>
								<div className="flex flex-wrap gap-2 justify-center mt-2">
									{method.currencies.length > 0
										? method.currencies.map((currency) => (
												<span
													key={currency}
													className="px-2 py-0.5 text-[10px] font-bold rounded border uppercase tracking-wide"
													style={{
														color: DARK_GOLD,
														borderColor: `${DARK_GOLD}40`,
													}}
												>
													{currency}
												</span>
											))
										: null}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* main call to action button */}
				<div className="py-12 text-center">
					<motion.a
						href={
							activeTab === "investors"
								? "/#contact-investor"
								: "/#contact-sponsor"
						}
						key={`cta-${activeTab}`}
						className="inline-flex items-center gap-2 px-6 py-3 border-2 rounded-full font-medium transition-colors duration-300"
						style={{
							borderColor: DARK_GOLD,
							color: DARK_GOLD,
							backgroundColor: "transparent",
						}}
						onClick={(e) => {
							if (posthog) {
								posthog.capture("onboarding_cta_clicked", {
									tab: activeTab,
									cta_text: content.cta,
								});
							}

							// If we are already on the home page, smooth scroll to contact
							// Otherwise allow default navigation to /#hash
							if (window.location.pathname === "/") {
								e.preventDefault();
								const hash =
									activeTab === "investors"
										? "#contact-investor"
										: "#contact-sponsor";
								window.history.pushState(null, "", hash);
								window.location.hash = hash;

								const element = document.getElementById("contact");
								if (element) {
									element.scrollIntoView({ behavior: "smooth" });
								}
							}
						}}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						{content.cta}
					</motion.a>
				</div>
			</div>
		</div>
	);
}

/**
 * SectionTwo - the "how commertize works" section with the step cards
 *
 * has a toggle between investor and sponsor views
 * on mobile the cards light up when you scroll past them
 */
function SectionTwo({
	activeTab,
	setActiveTab,
}: {
	activeTab: "investors" | "sponsors";
	setActiveTab: (tab: "investors" | "sponsors") => void;
}) {
	const [isMobileSection, setIsMobileSection] = useState(false);
	const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
	const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const checkMobile = () => setIsMobileSection(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// this makes the steps light up as you scroll past them on mobile
	// uses intersection observer to detect when each step is visible
	useEffect(() => {
		if (!isMobileSection) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = stepRefs.current.findIndex(
							(ref) => ref === entry.target
						);
						if (index !== -1) {
							setActiveStepIndex(index);
						}
					}
				});
			},
			{ threshold: 0.6, rootMargin: "-20% 0px -20% 0px" }
		);

		stepRefs.current.forEach((ref) => {
			if (ref) observer.observe(ref);
		});

		return () => observer.disconnect();
	}, [isMobileSection, activeTab]);

	const investorSteps = [
		{
			icon: ShieldCheck,
			title: "Complete KYC",
			desc: "Verify your identity and accreditation status through our secure portal",
		},
		{
			icon: Search,
			title: "Browse listings",
			desc: "Explore vetted commercial listings across asset classes and regions",
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
	];

	const sponsorSteps = [
		{
			icon: ShieldCheck,
			title: "Complete KYC",
			desc: "Verify identity and credentials before submitting listings",
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
	];

	const steps = activeTab === "investors" ? investorSteps : sponsorSteps;

	return (
		<div className="relative py-24" style={{ backgroundColor: OFF_WHITE }}>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
					className="text-center mb-12"
				>
					<h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
						How <span style={{ color: DARK_GOLD }}>Commertize</span> Works
					</h2>
					<p className="text-lg text-gray-500 font-light max-w-2xl mx-auto">
						Tokenize real-world assets or invest in tokenized opportunities
						through a single platform built for institutional participation.
					</p>
				</motion.div>

				{/* investor / sponsor toggle buttons */}
				<div className="flex justify-center mb-16">
					<div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200">
						<button
							data-tab="investors"
							onClick={() => setActiveTab("investors")}
							className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
								activeTab === "investors"
									? "text-white shadow-md"
									: "text-gray-500 hover:text-gray-900"
							}`}
							style={
								activeTab === "investors" ? { background: GOLD_GRADIENT } : {}
							}
						>
							For Investors
						</button>
						<button
							data-tab="sponsors"
							onClick={() => setActiveTab("sponsors")}
							className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
								activeTab === "sponsors"
									? "text-white shadow-md"
									: "text-gray-500 hover:text-gray-900"
							}`}
							style={
								activeTab === "sponsors" ? { background: GOLD_GRADIENT } : {}
							}
						>
							For Sponsors
						</button>
					</div>
				</div>

				{/* the actual step cards - styled similar to the foundations section */}
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
					{steps.map((step, index) => {
						const isActiveOnMobile =
							isMobileSection && activeStepIndex === index;
						return (
							<motion.div
								key={step.title}
								ref={(el) => {
									stepRefs.current[index] = el;
								}}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
								className={`bg-white border rounded-xl shadow-sm transition-all duration-300 group overflow-hidden h-full flex flex-col ${
									isActiveOnMobile
										? "shadow-xl border-[#C59B26]"
										: "hover:shadow-xl"
								}`}
								style={{
									borderColor: isActiveOnMobile
										? "#C59B26"
										: "rgba(197,155,38,0.2)",
								}}
							>
								<div className="p-6 flex-1 flex flex-col items-center text-center">
									{/* step number badge */}
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-6 text-white"
										style={{ background: GOLD_GRADIENT }}
									>
										{index + 1}
									</div>

									<step.icon
										className={`w-10 h-10 mb-4 transition-colors duration-300 ${
											isActiveOnMobile
												? "text-[#C59B26]"
												: "text-gray-400 group-hover:text-[#C59B26]"
										}`}
									/>

									<h3
										className={`text-lg font-medium transition-colors duration-300 mb-3 ${
											isActiveOnMobile
												? "text-[#C59B26]"
												: "text-gray-800 group-hover:text-[#C59B26]"
										}`}
									>
										{step.title}
									</h3>

									<p className="text-sm text-gray-500 font-light leading-relaxed">
										{step.desc}
									</p>
								</div>
								{/* Bottom Gold Line on Hover or Active */}
								<div
									className={`h-1 bg-[#C59B26] transition-all duration-500 mx-auto ${
										isActiveOnMobile ? "w-full" : "w-0 group-hover:w-full"
									}`}
								/>
							</motion.div>
						);
					})}
				</div>

				{/* Stats Bar - always horizontal, smaller on mobile */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.5 }}
					className="mt-20 text-center"
				>
					<div className="inline-flex flex-row items-center gap-4 md:gap-16 bg-white rounded-2xl px-4 md:px-12 py-4 md:py-8 shadow-sm border border-gray-100">
						<div className="text-center">
							<div
								className="text-xl md:text-4xl font-light mb-1"
								style={{ color: DARK_GOLD }}
							>
								$1K
							</div>
							<div className="text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">
								Min. Investment
							</div>
						</div>
						<div className="w-px h-8 md:h-12 bg-gray-100" />
						<div className="text-center">
							<div
								className="text-xl md:text-4xl font-light mb-1"
								style={{ color: DARK_GOLD }}
							>
								5 min
							</div>
							<div className="text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">
								Onboarding Time
							</div>
						</div>
						<div className="w-px h-8 md:h-12 bg-gray-100" />
						<div className="text-center">
							<div
								className="text-xl md:text-4xl font-light mb-1"
								style={{ color: DARK_GOLD }}
							>
								24/7
							</div>
							<div className="text-[8px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">
								Trading Access
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

// --- SECTION 3: WHO WINS (MARQUEE) ---
function SectionThree() {
	const [isMobileMarquee, setIsMobileMarquee] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false); // All cards expand together
	const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null); // Which card has gold border
	const [isPaused, setIsPaused] = useState(false); // Pause auto-scroll on interaction
	const [_centerCardIndex, setCenterCardIndex] = useState(0); // Track center card for highlight
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

	// Desktop drag state
	const desktopScrollRef = useRef<HTMLDivElement>(null);
	const [isDesktopDragging, setIsDesktopDragging] = useState(false);
	const [desktopDragStartX, setDesktopDragStartX] = useState(0);
	const [desktopScrollLeft, setDesktopScrollLeft] = useState(0);
	const [isDesktopHovering, setIsDesktopHovering] = useState(false);
	const desktopAutoScrollRef = useRef<NodeJS.Timeout | null>(null);

	// Triple the sections for seamless infinite loop
	const loopedSections = [
		...tokenizationSections,
		...tokenizationSections,
		...tokenizationSections,
	];
	const tripleDesktopSections = [
		...tokenizationSections,
		...tokenizationSections,
		...tokenizationSections,
	];
	const cardWidth = 344;
	const mobileCardWidth = 292; // 280px + 12px margin

	useEffect(() => {
		const checkMobile = () => setIsMobileMarquee(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Set initial scroll position to the middle set for seamless bidirectional looping
	useEffect(() => {
		if (!isMobileMarquee) return;
		const container = scrollContainerRef.current;
		if (!container) return;

		// Start at the middle set
		const singleSetWidth = mobileCardWidth * tokenizationSections.length;
		container.scrollLeft = singleSetWidth;
	}, [isMobileMarquee]);

	// Auto-scroll for mobile
	useEffect(() => {
		if (!isMobileMarquee || isPaused) return;

		const container = scrollContainerRef.current;
		if (!container) return;

		autoScrollRef.current = setInterval(() => {
			container.scrollLeft += 1;

			// Loop back to middle set when reaching the end of second set
			const singleSetWidth = mobileCardWidth * tokenizationSections.length;
			if (container.scrollLeft >= singleSetWidth * 2) {
				container.scrollLeft = singleSetWidth;
			}
		}, 30);

		return () => {
			if (autoScrollRef.current) clearInterval(autoScrollRef.current);
		};
	}, [isMobileMarquee, isPaused]);

	// Detect center card on horizontal scroll + bidirectional looping
	useEffect(() => {
		if (!isMobileMarquee) return;

		const container = scrollContainerRef.current;
		if (!container) return;

		const handleHorizontalScroll = () => {
			const containerCenter = container.scrollLeft + container.clientWidth / 2;
			const centerIndex =
				Math.round(containerCenter / mobileCardWidth) %
				tokenizationSections.length;
			setCenterCardIndex(centerIndex);

			// When user scrolls, if paused and expanded, update highlight to center card
			if (isPaused && isExpanded) {
				setHighlightedIndex(centerIndex);
			}

			// Bidirectional looping
			const singleSetWidth = mobileCardWidth * tokenizationSections.length;

			// If scrolled past the second set (going right), jump back to first set
			if (container.scrollLeft >= singleSetWidth * 2) {
				container.scrollLeft = singleSetWidth;
			}
			// If scrolled before the first set (going left), jump to second set
			if (container.scrollLeft <= 0) {
				container.scrollLeft = singleSetWidth;
			}
		};

		container.addEventListener("scroll", handleHorizontalScroll, {
			passive: true,
		});
		return () =>
			container.removeEventListener("scroll", handleHorizontalScroll);
	}, [isMobileMarquee, isPaused, isExpanded]);

	// Close cards on vertical scroll (window scroll)
	useEffect(() => {
		if (!isMobileMarquee || !isExpanded) return;

		const handleVerticalScroll = () => {
			setIsExpanded(false);
			setHighlightedIndex(null);
			setIsPaused(false); // Resume auto-scroll
		};

		window.addEventListener("scroll", handleVerticalScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleVerticalScroll);
	}, [isMobileMarquee, isExpanded]);

	// Handle card click
	const handleCardClick = (index: number) => {
		if (!isMobileMarquee) return;

		const actualIndex = index % tokenizationSections.length;

		if (isExpanded && highlightedIndex === actualIndex) {
			// Toggle off if clicking same card
			setIsExpanded(false);
			setHighlightedIndex(null);
			setIsPaused(false);
		} else {
			// Expand all, highlight clicked card, pause auto-scroll
			setIsExpanded(true);
			setHighlightedIndex(actualIndex);
			setIsPaused(true);
		}
	};

	// Handle click outside to close
	const handleContainerClick = (e: React.MouseEvent) => {
		if (!isMobileMarquee || !isExpanded) return;

		// Check if click was on a card
		const target = e.target as HTMLElement;
		if (!target.closest(".marquee-card")) {
			setIsExpanded(false);
			setHighlightedIndex(null);
			setIsPaused(false);
		}
	};

	// Handle touch start to pause auto-scroll while swiping
	const handleTouchStart = () => {
		if (isMobileMarquee && !isExpanded) {
			setIsPaused(true);
		}
	};

	// Handle touch end to resume auto-scroll if not expanded
	const handleTouchEnd = () => {
		if (isMobileMarquee && !isExpanded) {
			// Small delay before resuming
			setTimeout(() => setIsPaused(false), 2000);
		}
	};

	// Desktop: Set initial scroll position to middle set for bidirectional looping
	useEffect(() => {
		if (isMobileMarquee) return;
		const container = desktopScrollRef.current;
		if (!container) return;

		// Start at the middle set
		const singleSetWidth = cardWidth * tokenizationSections.length;
		container.scrollLeft = singleSetWidth;
	}, [isMobileMarquee]);

	// Desktop: Auto-scroll when not dragging and not hovering
	useEffect(() => {
		if (isMobileMarquee) return;

		const container = desktopScrollRef.current;
		if (!container) return;

		// Clear any existing interval
		if (desktopAutoScrollRef.current) {
			clearInterval(desktopAutoScrollRef.current);
			desktopAutoScrollRef.current = null;
		}

		// Don't auto-scroll if dragging or hovering
		if (isDesktopDragging || isDesktopHovering) return;

		desktopAutoScrollRef.current = setInterval(() => {
			container.scrollLeft += 1;

			// Bidirectional looping
			const singleSetWidth = cardWidth * tokenizationSections.length;
			if (container.scrollLeft >= singleSetWidth * 2) {
				container.scrollLeft = singleSetWidth;
			}
		}, 30);

		return () => {
			if (desktopAutoScrollRef.current)
				clearInterval(desktopAutoScrollRef.current);
		};
	}, [isMobileMarquee, isDesktopDragging, isDesktopHovering]);

	// Desktop: Handle scroll for bidirectional looping
	useEffect(() => {
		if (isMobileMarquee) return;

		const container = desktopScrollRef.current;
		if (!container) return;

		const handleDesktopScroll = () => {
			const singleSetWidth = cardWidth * tokenizationSections.length;

			// If scrolled past the second set (going right), jump back to middle
			if (container.scrollLeft >= singleSetWidth * 2) {
				container.scrollLeft = singleSetWidth;
			}
			// If scrolled before the first set (going left), jump to middle
			if (container.scrollLeft <= 0) {
				container.scrollLeft = singleSetWidth;
			}
		};

		container.addEventListener("scroll", handleDesktopScroll, {
			passive: true,
		});
		return () => container.removeEventListener("scroll", handleDesktopScroll);
	}, [isMobileMarquee]);

	// Desktop: Mouse drag handlers
	const handleDesktopMouseDown = (e: React.MouseEvent) => {
		const container = desktopScrollRef.current;
		if (!container) return;

		setIsDesktopDragging(true);
		setDesktopDragStartX(e.pageX - container.offsetLeft);
		setDesktopScrollLeft(container.scrollLeft);
		container.style.cursor = "grabbing";
	};

	const handleDesktopMouseMove = (e: React.MouseEvent) => {
		if (!isDesktopDragging) return;

		const container = desktopScrollRef.current;
		if (!container) return;

		e.preventDefault();
		const x = e.pageX - container.offsetLeft;
		const walk = (x - desktopDragStartX) * 2; // Multiply for faster scrolling
		container.scrollLeft = desktopScrollLeft - walk;
	};

	const handleDesktopMouseUp = () => {
		const container = desktopScrollRef.current;
		if (container) {
			container.style.cursor = "grab";
		}
		setIsDesktopDragging(false);
	};

	const handleDesktopMouseLeave = () => {
		const container = desktopScrollRef.current;
		if (container) {
			container.style.cursor = "grab";
		}
		setIsDesktopDragging(false);
		setIsDesktopHovering(false);
	};

	const handleDesktopMouseEnter = () => {
		setIsDesktopHovering(true);
	};

	return (
		<div
			className="relative w-full py-16"
			style={{ backgroundColor: OFF_WHITE }}
		>
			<style>{`
        .marquee-container-onboarding .marquee-card-inner {
          border-color: rgba(197, 155, 38, 0.2);
        }

        .marquee-container-onboarding .marquee-card-title {
          color: #1A1A1A;
        }

        .marquee-container-onboarding .marquee-card-details {
          max-height: 0px;
          opacity: 0;
        }

        .marquee-container-onboarding:hover .marquee-card-details {
          max-height: 300px;
          opacity: 1;
        }

        .marquee-container-onboarding .marquee-card:hover {
          transform: translateY(-5px);
          z-index: 50;
        }

        .marquee-container-onboarding .marquee-card:hover .marquee-card-inner {
          border-color: ${DARK_GOLD};
          box-shadow: 0 15px 30px -5px rgba(197, 155, 38, 0.15);
        }

        .marquee-container-onboarding .marquee-card:hover .marquee-card-title {
          color: ${DARK_GOLD};
        }

        /* Hide scrollbar for desktop drag scroll */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

			{/* Header */}
			<div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mb-16 pt-8">
				<div className="text-center">
					<motion.h2
						className="text-4xl md:text-6xl font-light mb-6"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<span className="text-gray-900">From Concrete to Capital — </span>
						<span style={{ color: DARK_GOLD }}>Who Wins</span>
					</motion.h2>
					<motion.p
						className="text-gray-500 font-light text-lg max-w-3xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						From unlocking liquidity to global investor access, tokenization
						changes the game for everyone in CRE.
					</motion.p>
				</div>
			</div>

			{/* Marquee Container - horizontal scroll on mobile, auto-scroll on desktop */}
			{isMobileMarquee ? (
				// Mobile: Auto-scrolling with swipe control, looped
				<div
					ref={scrollContainerRef}
					className="relative overflow-x-auto py-4 scrollbar-hide"
					style={{ WebkitOverflowScrolling: "touch" }}
					onClick={handleContainerClick}
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
				>
					<div
						className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
						style={{
							background: `linear-gradient(to right, ${OFF_WHITE}, transparent)`,
						}}
					/>
					<div
						className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
						style={{
							background: `linear-gradient(to left, ${OFF_WHITE}, transparent)`,
						}}
					/>
					<div className="flex px-4" style={{ width: "fit-content" }}>
						{loopedSections.map((section, rawIndex) => {
							const actualIndex = rawIndex % tokenizationSections.length;
							const isHighlighted = highlightedIndex === actualIndex;
							return (
								<MarqueeCard
									key={`mobile-${section.title}-${rawIndex}`}
									section={section}
									index={rawIndex}
									isMobile={true}
									isExpanded={isExpanded}
									isHighlighted={isHighlighted}
									onToggle={() => handleCardClick(rawIndex)}
								/>
							);
						})}
					</div>
				</div>
			) : (
				// Desktop: Draggable scrolling marquee with auto-scroll
				<div
					ref={desktopScrollRef}
					className="marquee-container-onboarding relative overflow-x-auto py-4 scrollbar-hide"
					style={{
						WebkitOverflowScrolling: "touch",
						cursor: isDesktopDragging ? "grabbing" : "grab",
					}}
					onMouseDown={handleDesktopMouseDown}
					onMouseMove={handleDesktopMouseMove}
					onMouseUp={handleDesktopMouseUp}
					onMouseLeave={handleDesktopMouseLeave}
					onMouseEnter={handleDesktopMouseEnter}
				>
					<div
						className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
						style={{
							background: `linear-gradient(to right, ${OFF_WHITE}, transparent)`,
						}}
					/>
					<div
						className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
						style={{
							background: `linear-gradient(to left, ${OFF_WHITE}, transparent)`,
						}}
					/>
					<div className="flex" style={{ width: "fit-content" }}>
						{tripleDesktopSections.map((section, index) => (
							<MarqueeCard
								key={`desktop-${section.title}-${index}`}
								section={section}
								index={index}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

// --- MAIN PAGE COMPONENT ---
export default function OnboardingPage() {
	const sectionRef = useRef<HTMLElement>(null);

	// Lifted state: controls both SectionTwo toggle and SectionOne content
	const [activeTab, setActiveTab] = useState<"investors" | "sponsors">(
		"investors"
	);

	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start 90%", "start 30%"],
	});

	// Bar fills from CENTER outward
	const barScaleX = useTransform(scrollYProgress, [0, 0.6], [0, 1], {
		clamp: true,
	});

	return (
		<section
			id="investor"
			ref={sectionRef}
			className="relative w-full min-h-screen"
			style={{ backgroundColor: OFF_WHITE }}
		>
			{/* HEADER SECTION (Bar + Title) - At the top */}
			<div className="pt-10 pb-4 px-[5%] text-center">
				{/* Animated Bar - Full width, fills from CENTER */}
				<div className="mb-5 relative h-[6px] w-full overflow-hidden rounded-full">
					<motion.div
						className="absolute inset-0 rounded-full"
						style={{
							transformOrigin: "50% 50%", // Center origin for middle-out effect
							scaleX: barScaleX,
							background: GOLD_GRADIENT,
						}}
					/>
				</div>
			</div>

			{/* SECTION 1: How Commertize Works */}
			<SectionTwo activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* Divider Line between sections */}
			<div className="w-full flex justify-center py-8">
				<div
					className="w-[90%] h-[1px]"
					style={{
						background:
							"linear-gradient(90deg, rgba(197,155,38,0) 0%, rgba(197,155,38,0.6) 50%, rgba(197,155,38,0) 100%)",
					}}
				/>
			</div>

			{/* SECTION 2: From Concrete to Capital (Who Wins) */}
			<SectionThree />

			{/* Divider Line */}
			<div className="w-full flex justify-center py-8">
				<div
					className="w-[90%] h-[1px]"
					style={{
						background:
							"linear-gradient(90deg, rgba(197,155,38,0) 0%, rgba(197,155,38,0.6) 50%, rgba(197,155,38,0) 100%)",
					}}
				/>
			</div>

			{/* SECTION 3: List Your Property / Invest (Dynamic based on toggle) */}
			<SectionOne activeTab={activeTab} />
		</section>
	);
}
