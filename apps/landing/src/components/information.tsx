// information section - shows the product cards and tokenization features
// this is the main content section below the hero that explains what we do
// has sticky scroll cards and the infrastructure section

import React, { useRef, forwardRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { OFF_WHITE, GOLD } from "../constants/layout";

const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD} 0%, #C9A84E 100%)`;

// type for each product card - has all the content and display options
interface PageItem {
	id: number;
	headline: string;
	subhead: string;
	body: string;
	stats: { label: string; value: string }[];
	linkUrl: string | null;
	linkText: string;
	isExternal: boolean;
	lottieSrc: string;
	useTextLink?: boolean;
	speed?: number;
	bullets?: string[];
	footnote?: string;
}

// content for the two main product cards - these are investor focused
const PAGES: PageItem[] = [
	{
		id: 1,
		// first card - capital structures and how we tokenize them
		headline: "Tokenized Capital Structures",
		subhead: "Equity, Debt, and Lending in One Protocol",
		body: "Allow real-world assets to be issued across equity and debt through programmable ownership models, enabling more precise, flexible, and scalable capital design than traditional real estate frameworks.",
		stats: [
			{ label: "Instruments", value: "Equity & Debt" },
			{ label: "Utility", value: "Collateral" },
		],
		linkUrl: null,
		linkText: "",
		isExternal: false,
		// lottie animation for this card
		lottieSrc:
			"https://lottie.host/31a76ec5-ae5c-4688-9c87-c23629fd8e6a/Jz6m7fzcCN.lottie",
	},
	{
		id: 3,
		// second card - liquidity and nexus platform
		headline: "Liquidity Without Selling",
		subhead:
			"Unlock capital from tokenized commercial real estate—without exiting your position.",
		body: "Traditional real estate locks capital for years. By tokenizing ownership on Commertize, assets become programmable—enabling liquidity and yield options not previously possible in private markets.\n\nThrough Commertize's Nexus layer, tokenized real estate can be used to access liquidity or generate yield while preserving long-term ownership. This introduces flexibility across the asset lifecycle without forcing asset sales, refinancing, or structural complexity.",
		stats: [
			{ label: "Liquidity Layer", value: "Nexus" },
			{ label: "Access", value: "On-demand" },
		],
		linkUrl: "/nexus",
		linkText: "Explore Liquidity Options",
		isExternal: false,
		useTextLink: true,
		// nexus lottie
		lottieSrc:
			"https://lottie.host/ddc6529f-2d56-4fab-9110-ce839aae2cda/iYvisbCLTz.lottie",
		speed: 1,
	},
];

// carousel images for the building slideshow (if we use it)
const CAROUSEL_IMAGES = [
	{
		src: "/assets/boardwalk-suites-lafayette.jpg",
		alt: "Boardwalk Suites Lafayette",
	},
	{ src: "/assets/building-curved.jpg", alt: "Curved Building" },
	{ src: "/assets/building-modern.jpg", alt: "Modern Building" },
	{ src: "/assets/building-tall.jpg", alt: "Tall Building" },
];

// backup marquee component - not currently used but keeping just in case we need it later
// @ts-expect-error - intentionally unused, kept for future use
function _BackupImageMarquee() {
	const duplicatedImages = [...CAROUSEL_IMAGES, ...CAROUSEL_IMAGES];
	// Slightly wider cards for better visibility
	const cardWidth = 340;
	const totalWidth = cardWidth * CAROUSEL_IMAGES.length;

	return (
		<div className="relative w-full h-full overflow-hidden select-none image-marquee-container">
			<style>{`
        @keyframes image-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${totalWidth}px); }
        }
        .image-marquee-track {
          animation: image-marquee 45s linear infinite;
        }
        .image-marquee-container:hover .image-marquee-track {
          animation-play-state: paused;
        }
      `}</style>

			{/* edge fade effect using css masks - works on any background color */}
			<div
				className="absolute inset-0 z-10"
				style={{
					background: "transparent",
					maskImage:
						"linear-gradient(to right, black 0%, transparent 5%, transparent 95%, black 100%)",
					WebkitMaskImage:
						"linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)",
				}}
			/>

			{/* the actual scrolling track */}
			<div className="image-marquee-container h-full flex items-center">
				<div
					className="image-marquee-track flex items-center gap-8"
					style={{ width: "fit-content" }}
				>
					{duplicatedImages.map((image, idx) => (
						<div
							key={`${image.alt}-${idx}`}
							className="flex-shrink-0 w-[300px] h-[400px] rounded-2xl overflow-hidden shadow-xl grayscale-[20%] hover:grayscale-0 transition-all duration-700 ease-out"
						>
							<img
								src={image.src}
								alt={image.alt}
								className="w-full h-full object-cover"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

// asset lifecycle diagram - shows the 4 steps of tokenization
// static display, no fancy animations per boss request
function AssetLifecycleDiagram() {
	const steps = [
		{
			label: "Tokenization",
			description: "Convert ownership into digital securities",
		},
		{
			label: "Capital Formation",
			description: "Issue and distribute to qualified investors",
		},
		{
			label: "Investor Management",
			description: "Cap tables, reporting, and compliance",
		},
		{
			label: "Liquidity & Yield",
			description: "Secondary transfers and yield strategies",
		},
	];

	return (
		<div className="relative bg-white rounded-xl md:rounded-2xl border border-gray-300 p-5 sm:p-6 md:p-8 shadow-md">
			<div
				className="absolute top-0 left-0 w-full h-1 rounded-t-xl md:rounded-t-2xl"
				style={{ background: GOLD_GRADIENT }}
			/>

			<h4
				className="text-xs sm:text-sm font-bold uppercase tracking-widest mb-4 md:mb-6"
				style={{ color: GOLD }}
			>
				Asset Lifecycle
			</h4>

			<div className="space-y-0">
				{steps.map((step, index) => (
					<div key={step.label} className="relative">
						{/* Step Content */}
						<div className="flex items-start gap-3 md:gap-4 py-3 md:py-4">
							{/* Circle and Line */}
							<div className="flex flex-col items-center">
								<div
									className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 flex-shrink-0"
									style={{ borderColor: GOLD, backgroundColor: GOLD }}
								/>
								{index < steps.length - 1 && (
									<div
										className="w-0.5 h-8 md:h-12 mt-1"
										style={{ backgroundColor: GOLD }}
									/>
								)}
							</div>

							{/* Text */}
							<div className="flex-1 -mt-0.5 md:-mt-1">
								<h5 className="text-sm md:text-base font-medium text-gray-900">
									{step.label}
								</h5>
								<p className="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
									{step.description}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

// platform capabilities for the infrastructure section
const PLATFORM_CAPABILITIES = [
	"Equity, preferred, and mortgage token issuance",
	"On-chain cap tables and investor lifecycle management",
	"Automated distributions, reporting, and compliance workflows",
	"Institutional onboarding for accredited and qualified investors",
];

// product card component - handles both mobile and desktop layouts
// on desktop it does the sticky scroll thing, on mobile its just stacked cards
function ProductSection({
	page,
	index,
	isLast,
}: {
	page: PageItem;
	index: number;
	isLast: boolean;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isMobile, setIsMobile] = React.useState(false);

	// check screen size to decide mobile vs desktop layout
	React.useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// track scroll for the scale/fade effect on desktop
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end start"],
	});

	// card shrinks and fades as you scroll past it
	const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
	const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);

	// mobile layout - just simple stacked cards, no sticky scroll stuff
	if (isMobile) {
		return (
			<div className="relative px-4 py-8">
				{/* the actual card container */}
				<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
					{/* gold bar at top */}
					<div
						className="h-[3px] w-16 rounded-full"
						style={{ backgroundColor: GOLD }}
					/>

					{/* text content comes first on mobile so its easier to read */}
					<div className="space-y-4">
						<h3 className="text-2xl sm:text-3xl font-medium text-[#1A1A1A] tracking-tight">
							{page.headline}
						</h3>

						<p className="text-base sm:text-lg text-[#404040] font-light">
							{page.subhead}
						</p>

						<p className="text-sm sm:text-base text-[#505050] leading-relaxed whitespace-pre-line">
							{page.body}
						</p>

						{page.bullets && (
							<ul className="space-y-2">
								{page.bullets.map((bullet, i) => (
									<li
										key={i}
										className="flex items-start gap-2 text-sm text-[#505050]"
									>
										<span style={{ color: GOLD }} className="mt-0.5">
											•
										</span>
										<span>{bullet}</span>
									</li>
								))}
							</ul>
						)}

						{page.footnote && (
							<p className="text-xs text-[#707070] italic">{page.footnote}</p>
						)}

						{/* stats in a row */}
						<div className="flex gap-8 pt-2">
							{page.stats.map((stat, i) => (
								<div key={i}>
									<div className="text-[9px] uppercase tracking-widest mb-0.5 font-medium text-gray-400">
										{stat.label}
									</div>
									<div className="text-lg font-light text-[#505050]">
										{stat.value}
									</div>
								</div>
							))}
						</div>

						{/* link if there is one */}
						{page.linkUrl && (
							<div className="pt-2">
								{page.useTextLink ? (
									<Link
										to={page.linkUrl}
										className="inline-flex items-center gap-2 font-semibold text-sm transition-all"
										style={{ color: GOLD }}
									>
										{page.linkText}
										<span>→</span>
									</Link>
								) : page.isExternal ? (
									<a
										href={page.linkUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-5 py-2.5 border-2 rounded-full font-medium text-sm transition-colors duration-300"
										style={{ borderColor: GOLD, color: GOLD }}
									>
										{page.linkText}
									</a>
								) : (
									<Link
										to={page.linkUrl}
										className="inline-flex items-center gap-2 px-5 py-2.5 border-2 rounded-full font-medium text-sm transition-colors duration-300"
										style={{ borderColor: GOLD, color: GOLD }}
									>
										{page.linkText}
									</Link>
								)}
							</div>
						)}
					</div>

					{/* lottie animation visual - below text on mobile with max height */}
					<div
						className="w-full rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg"
						style={{
							backgroundColor: "#FFFFFF",
							height: "200px", // Capped height on mobile
						}}
					>
						{page.lottieSrc ? (
							<div className="w-full h-full">
								<DotLottieReact
									src={page.lottieSrc}
									loop
									autoplay
									speed={page.speed || 1}
									style={{ width: "100%", height: "100%" }}
								/>
							</div>
						) : (
							<span className="text-gray-400 text-lg font-medium tracking-widest z-10 uppercase">
								VISUAL {page.id}
							</span>
						)}
						<div className="absolute inset-0 pointer-events-none bg-black/5" />
					</div>
				</div>
			</div>
		);
	}

	// desktop layout - does the cool sticky scroll thing where cards stack on top of eachother
	return (
		<div
			ref={containerRef}
			className="relative"
			style={{
				height: "150vh",
				zIndex: index,
			}}
		>
			<div className="sticky top-0 h-screen flex flex-col justify-start pt-[12vh] overflow-hidden">
				{/* card that scales and fades as you scroll */}
				<motion.div
					className="flex w-full justify-center"
					style={{
						backgroundColor: OFF_WHITE,
						...(isLast ? {} : { scale, opacity }),
					}}
				>
					<div className="flex w-full max-w-7xl mx-auto items-start px-[5%]">
						{/* left side text content */}
						<div className="w-[45%] pr-16 pt-8">
							<motion.div
								className="h-[3px] mb-8"
								style={{ backgroundColor: GOLD }}
								initial={{ scaleX: 0 }}
								whileInView={{ scaleX: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, ease: "circOut" }}
							/>

							<h3 className="text-4xl lg:text-6xl font-medium text-[#1A1A1A] mb-6 tracking-tight">
								{page.headline}
							</h3>

							<p className="text-xl text-[#404040] font-light mb-8">
								{page.subhead}
							</p>

							<p className="text-base text-[#505050] leading-relaxed mb-6 max-w-md whitespace-pre-line">
								{page.body}
							</p>

							{page.bullets && (
								<ul className="mb-6 max-w-md space-y-2">
									{page.bullets.map((bullet, i) => (
										<li
											key={i}
											className="flex items-start gap-2 text-base text-[#505050]"
										>
											<span style={{ color: GOLD }} className="mt-1">
												•
											</span>
											<span>{bullet}</span>
										</li>
									))}
								</ul>
							)}

							{page.footnote && (
								<p className="text-sm text-[#707070] italic mb-6 max-w-md">
									{page.footnote}
								</p>
							)}

							<div className="flex gap-12 mb-10">
								{page.stats.map((stat, i) => (
									<div key={i}>
										<div className="text-[10px] uppercase tracking-widest mb-1 font-medium text-gray-400">
											{stat.label}
										</div>
										<div className="text-xl font-light text-[#505050]">
											{stat.value}
										</div>
									</div>
								))}
							</div>

							{page.linkUrl &&
								(page.useTextLink ? (
									// Text-style link like OmniGrid
									<Link
										to={page.linkUrl}
										className="inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
										style={{ color: GOLD }}
									>
										{page.linkText}
										<span>→</span>
									</Link>
								) : page.isExternal ? (
									<a
										href={page.linkUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-6 py-3 border-2 rounded-full font-medium transition-colors duration-300"
										style={{ borderColor: GOLD, color: GOLD }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = GOLD;
											e.currentTarget.style.color = "#FFFFFF";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = "transparent";
											e.currentTarget.style.color = GOLD;
										}}
									>
										{page.linkText}
										<span>→</span>
									</a>
								) : (
									<Link
										to={page.linkUrl}
										className="inline-flex items-center gap-2 px-6 py-3 border-2 rounded-full font-medium transition-colors duration-300"
										style={{ borderColor: GOLD, color: GOLD }}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = GOLD;
											e.currentTarget.style.color = "#FFFFFF";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = "transparent";
											e.currentTarget.style.color = GOLD;
										}}
									>
										{page.linkText}
										<span>→</span>
									</Link>
								))}
						</div>

						{/* right side lottie visual */}
						<div className="w-[55%] pl-8">
							<div
								className="w-full rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl"
								style={{
									backgroundColor: "#FFFFFF",
									height: "65vh",
								}}
							>
								{page.lottieSrc ? (
									<div className="w-full h-full">
										<DotLottieReact
											src={page.lottieSrc}
											loop
											autoplay
											speed={page.speed || 1}
											style={{ width: "100%", height: "100%" }}
										/>
									</div>
								) : (
									<span className="text-gray-400 text-2xl font-medium tracking-widest z-10 uppercase">
										VISUAL {page.id}
									</span>
								)}

								<div className="absolute inset-0 pointer-events-none bg-black/5" />
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}

// main information section component
// uses forwardRef so parent can access the element if needed
const Information = forwardRef<HTMLElement, object>(
	function Information(_props, forwardedRef) {
		const internalRef = useRef<HTMLDivElement>(null);

		// helper to merge the forwarded ref with our internal one
		const mergeRefs = (el: HTMLDivElement | null) => {
			(internalRef as React.MutableRefObject<HTMLDivElement | null>).current =
				el;
			if (typeof forwardedRef === "function") {
				forwardedRef(el);
			} else if (forwardedRef) {
				(forwardedRef as React.MutableRefObject<HTMLElement | null>).current =
					el;
			}
		};

		// scroll progress for the entry animations
		const { scrollYProgress: entryProgress } = useScroll({
			target: internalRef,
			offset: ["start 90%", "start 30%"],
		});

		// progress bar fills as you scroll into view
		const barScaleX = useTransform(entryProgress, [0, 0.6], [0, 1], {
			clamp: true,
		});

		return (
			<section
				ref={mergeRefs}
				className="relative w-full"
				style={{
					backgroundColor: OFF_WHITE,
					marginTop: "5vh",
				}}
				data-section="information"
			>
				<div className="relative z-10">
					{/* Progress bar only - removed THE DIGITAL STANDARD text */}
					<div
						id="digital-standard"
						className="pt-6 md:pt-10 pb-4 px-4 md:px-[5%]"
					>
						<div className="mb-3 md:mb-5 relative h-[4px] md:h-[6px] w-full overflow-hidden rounded-full">
							<motion.div
								className="absolute inset-0 rounded-full"
								style={{
									transformOrigin: "0% 50%",
									scaleX: barScaleX,
									background: GOLD_GRADIENT,
								}}
							/>
						</div>
					</div>

					{/* ===== SECTION 1: Institutional-Grade Tokenization ===== */}
					<div
						id="tokenization"
						className="relative w-full pb-16 md:pb-24 pt-8 md:pt-12"
					>
						{/* section header */}
						<div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mb-8 md:mb-12">
							<div className="text-center">
								<motion.h2
									className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-3 md:mb-4"
									style={{ color: GOLD }}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.6 }}
								>
									Institutional-Grade Tokenization for Real-World Assets
								</motion.h2>
								<motion.p
									className="text-gray-600 font-light text-sm sm:text-base md:text-lg max-w-3xl mx-auto"
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.6, delay: 0.1 }}
								>
									Digitize ownership. Program capital. Unlock liquidity—without
									compromising compliance.
								</motion.p>
							</div>
						</div>

						{/* Main Description */}
						<div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mb-8 md:mb-12">
							<motion.p
								className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed text-center max-w-4xl mx-auto"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.2 }}
							>
								Commertize is a full-stack digital capital markets platform
								purpose-built for bringing commercial real estate and
								infrastructure assets on-chain. We transform real-world value
								into programmable financial instruments while maintaining
								sponsor control and regulatory integrity.
							</motion.p>
						</div>

						{/* ===== SECTION 2: Real Assets. Digital Infrastructure. ===== */}
						<div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20">
							<div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
								{/* left side - text content and cta buttons */}
								<div className="w-full lg:w-[55%] flex flex-col gap-6 lg:gap-8">
									{/* core value prop section */}
									<motion.div
										className="space-y-3 md:space-y-4"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6 }}
									>
										<h3 className="text-xl sm:text-2xl md:text-3xl text-gray-900 font-medium">
											Real Assets. Digital Infrastructure.
										</h3>
										<p className="text-sm sm:text-base text-gray-600 leading-relaxed">
											Commertize enables asset owners and sponsors to issue,
											manage, and scale tokenized real-world assets through a
											regulated, end-to-end platform.
										</p>
									</motion.div>

									{/* platform capabilities list */}
									<motion.div
										className="space-y-3 md:space-y-4"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6, delay: 0.1 }}
									>
										<p
											className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
											style={{ color: GOLD }}
										>
											Platform capabilities include:
										</p>
										<ul className="space-y-2 md:space-y-3">
											{PLATFORM_CAPABILITIES.map((capability, index) => (
												<li
													key={index}
													className="flex items-start gap-2 md:gap-3"
												>
													<span
														className="w-1.5 h-1.5 rounded-full mt-1.5 md:mt-2 flex-shrink-0"
														style={{ backgroundColor: GOLD }}
													/>
													<span className="text-sm sm:text-base text-gray-700">
														{capability}
													</span>
												</li>
											))}
										</ul>
									</motion.div>

									{/* closing statement */}
									<motion.p
										className="text-sm sm:text-base text-gray-700 font-medium italic"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6, delay: 0.2 }}
									>
										Assets remain tangible. Ownership becomes programmable.
										Capital becomes global.
									</motion.p>

									{/* cta buttons */}
									<motion.div
										className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4"
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ duration: 0.6, delay: 0.3 }}
									>
										<a
											href={`${import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003"}/listings/new`}
											className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 border-2 rounded-full font-medium text-sm md:text-base transition-colors duration-300"
											style={{ borderColor: GOLD, color: GOLD }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = GOLD;
												e.currentTarget.style.color = "#FFFFFF";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "transparent";
												e.currentTarget.style.color = GOLD;
											}}
										>
											Launch an Offering
										</a>
										<a
											href={`${import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3003"}/marketplace`}
											className="inline-flex items-center justify-center px-5 py-2.5 md:px-6 md:py-3 border-2 rounded-full font-medium text-sm md:text-base transition-colors duration-300"
											style={{ borderColor: GOLD, color: GOLD }}
											onMouseEnter={(e) => {
												e.currentTarget.style.backgroundColor = GOLD;
												e.currentTarget.style.color = "#FFFFFF";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.backgroundColor = "transparent";
												e.currentTarget.style.color = GOLD;
											}}
										>
											View Live Assets
										</a>
									</motion.div>
								</div>

								{/* right side - the lifecycle diagram */}
								<motion.div
									className="w-full lg:w-[45%]"
									initial={{ opacity: 0, x: 20 }}
									whileInView={{ opacity: 1, x: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.6, delay: 0.2 }}
								>
									<AssetLifecycleDiagram />
								</motion.div>
							</div>
						</div>

						{/* ===== SECTION 3: OmniGrid ===== */}
						<div
							id="omnigrid"
							className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mt-10 md:mt-16"
						>
							<motion.div
								className="p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm relative overflow-hidden"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								{/* green accent bar at top */}
								<div
									className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
									style={{ backgroundColor: "#3d7a5a" }}
								/>

								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
									<div className="flex-1">
										<div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 md:mb-3">
											<span
												className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5 sm:mt-0"
												style={{ backgroundColor: "#3d7a5a" }}
											/>
											<h3 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900">
												OmniGrid — Sustainable Infrastructure On-Chain
											</h3>
										</div>
										<p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 md:mb-4 max-w-2xl">
											OmniGrid is Commertize&apos;s dedicated vertical for
											renewable energy, data centers, and climate-aligned
											infrastructure assets. Using the same institutional-grade
											tokenization and capital markets infrastructure, OmniGrid
											enables tokenization of energy assets, sustainable yield
											strategies, and access to global capital for
											next-generation infrastructure.
										</p>
										<Link
											to="/omnigrid"
											className="inline-flex items-center gap-2 font-semibold text-sm sm:text-base transition-all hover:gap-3"
											style={{ color: "#3d7a5a" }}
										>
											Explore OmniGrid Assets <span>→</span>
										</Link>
									</div>
								</div>
							</motion.div>
						</div>

						{/* credibility line */}
						<div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mt-8 md:mt-12">
							<motion.div
								className="text-center"
								initial={{ opacity: 0, y: 10 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								<p className="text-xs sm:text-sm text-gray-500 font-light">
									Built for sponsors, family offices, and institutional
									investors
								</p>
								<p className="text-[10px] sm:text-xs text-gray-400 mt-1">
									Modern infrastructure for the world&apos;s most valuable asset
									classes.
								</p>
							</motion.div>
						</div>
					</div>

					{/* ===== SECTIONS 4 & 5: Tokenized Capital Structures & Liquidity ===== */}
					{/* gold gradient separator line before product cards */}
					<div className="w-full flex justify-center py-8 md:py-12">
						<div
							className="w-[90%] h-[1px]"
							style={{
								background: `linear-gradient(90deg, rgba(197,155,38,0) 0%, rgba(197,155,38,0.6) 50%, rgba(197,155,38,0) 100%)`,
							}}
						/>
					</div>

					{/* The Commertize Capital Layer header */}
					<div
						id="capital-layer"
						className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 mb-8 md:mb-12"
					>
						<div className="text-center">
							<motion.h2
								className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-3 md:mb-4"
								style={{ color: GOLD }}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								The Commertize Capital Layer
							</motion.h2>
						</div>
					</div>

					<div id="assets" className="relative w-full">
						{PAGES.map((page, index) => (
							<ProductSection
								key={page.id}
								page={page}
								index={index}
								isLast={index === PAGES.length - 1}
							/>
						))}
					</div>

					<div className="h-[5vh]" />
				</div>
			</section>
		);
	}
);

export default Information;
