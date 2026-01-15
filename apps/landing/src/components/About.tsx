// about section - our vision and foundations
// has the big scroll animation with logo reveal and the expandable foundation cards

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
	AnimatePresence,
	motion,
	useScroll,
	useTransform,
	useMotionTemplate,
} from "framer-motion";
import { ChevronDown } from "lucide-react";

// color constants we use throughout

const DARK_GOLD = "#DDB35F";
const LIGHT_GOLD = "#E8D8A8";
const GOLD_GRADIENT = `linear-gradient(135deg, ${DARK_GOLD} 0%, #C9A84E 100%)`;

// type for each foundation card - has the content and bullets
type Step = {
	key: string;
	label: string;
	title: string;
	expandedParagraphs: string[];
	bullets: string[];
};

// the three foundation pillars - transparency, liquidity, ownership
const STEPS: Step[] = [
	{
		key: "info-1",
		label: "TRANSPARENCY",
		title: "Clear, verifiable tokenized ownership",
		expandedParagraphs: [
			"Commertize creates a unified system of record through tokenized ownership, ensuring that asset data, ownership interests, and transaction history remain consistent and auditable across the entire lifecycle of an asset.",
			"Transparency is embedded at the token level—reducing fragmentation, reconciliation risk, and information asymmetry between sponsors and investors.",
		],
		bullets: [
			"Tokenized ownership records",
			"Cap table clarity",
			"Distribution and transaction tracking",
			"Investor reporting and disclosures",
		],
	},
	{
		key: "info-2",
		label: "LIQUIDITY",
		title: "Tokenization designed for flexibility",
		expandedParagraphs: [
			"By tokenizing ownership interests, Commertize transforms traditionally illiquid assets into programmable financial instruments. This introduces optionality across the asset lifecycle without requiring asset sales or structural complexity.",
			"Liquidity is not forced—it is enabled by design.",
		],
		bullets: [
			"Capital formation through token issuance",
			"Secondary transfer readiness",
			"Portfolio rebalancing without asset sale",
			"Financing and yield strategies",
		],
	},
	{
		key: "info-3",
		label: "OWNERSHIP",
		title: "Modern ownership through tokenized structures",
		expandedParagraphs: [
			"Commertize enables ownership models that scale across asset types and geographies through tokenization. Investors gain targeted exposure, while sponsors retain structural control and flexibility.",
			"Ownership evolves from static and siloed to modular and strategic.",
		],
		bullets: [
			"Fractionalized ownership",
			"Multi-asset exposure",
			"Geographic diversification",
			"Sponsor capital stack design",
		],
	},
];

// accordion card component for each foundation pillar
// expands on click to show more details and bullet points
function FoundationCard({
	step,
	isOpen,
	onToggle,
	isHovered,
	onHover,
	onLeave,
	isMobile,
	isActiveOnMobile,
}: {
	step: Step;
	isOpen: boolean;
	onToggle: () => void;
	isHovered: boolean;
	onHover: () => void;
	onLeave: () => void;
	isMobile: boolean;
	isActiveOnMobile: boolean;
}) {
	// mobile uses click to highlight, desktop uses hover
	const showHighlight = isMobile ? isActiveOnMobile : isHovered;

	return (
		<motion.div
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6 }}
			className={`rounded-xl shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col bg-white ${
				showHighlight
					? "border-2 border-[#DDB35F] shadow-xl"
					: "border border-[#DDB35F]/30 hover:shadow-xl"
			}`}
			onMouseEnter={!isMobile ? onHover : undefined}
			onMouseLeave={!isMobile ? onLeave : undefined}
		>
			{/* header thats always visible - click to expand */}
			<div
				className="p-8 cursor-pointer group flex-1 flex flex-col justify-center"
				onClick={onToggle}
			>
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<h3 className="text-2xl font-light tracking-widest text-gray-800 group-hover:text-[#DDB35F] transition-colors duration-300">
							{step.label}
						</h3>
						<p className="mt-2 text-[#DDB35F] font-medium text-sm md:text-base">
							{step.title}
						</p>
					</div>

					<motion.div
						className="ml-4 text-[#DDB35F] border border-[#DDB35F]/20 rounded-full p-1"
						animate={{ rotate: isOpen ? 180 : 0 }}
						transition={{ duration: 0.3 }}
					>
						<ChevronDown className="h-6 w-6" />
					</motion.div>
				</div>
			</div>

			{/* content that shows when expanded */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						className="bg-stone-50/50"
					>
						<div className="px-8 pb-8 pt-2">
							<div className="border-t border-[#DDB35F]/20 pt-4">
								{/* description paragraphs */}
								<div className="space-y-4 mb-6">
									{step.expandedParagraphs.map((para, i) => (
										<motion.p
											key={i}
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: i * 0.1 }}
											className="text-gray-700 text-sm font-light leading-relaxed"
										>
											{para}
										</motion.p>
									))}
								</div>

								{/* application bullet points */}
								<motion.h4
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="text-[#DDB35F] font-medium text-sm mb-3"
								>
									Applications
								</motion.h4>
								<ul className="space-y-3">
									{step.bullets.map((bullet, i) => (
										<motion.li
											key={i}
											initial={{ x: -10, opacity: 0 }}
											animate={{ x: 0, opacity: 1 }}
											transition={{ delay: 0.3 + i * 0.1 }}
											className="flex items-start"
										>
											<span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#DDB35F] shrink-0 mr-3" />
											<span className="text-gray-700 text-sm font-light">
												{bullet}
											</span>
										</motion.li>
									))}
								</ul>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

// main about component with vision section and foundations
export default function About() {
	const [allExpanded, setAllExpanded] = useState(false);
	const [hoveredKey, setHoveredKey] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const [expandedKeys, setExpandedKeys] = useState<string[]>([]); // tracks which cards are open on mobile
	const sectionRef = useRef<HTMLElement>(null);

	// check if mobile screen size
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// scroll tracking for the animations
	// starts when section enters viewport, ends when bottom hits bottom
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "end end"],
	});

	// toggle all foundation cards at once (desktop only)
	const toggleAll = () => {
		setAllExpanded((prev) => !prev);
	};

	// content for the vision section
	const visionTitle = "Our Vision";
	const visionBody =
		"Commertize is building the leading platform for tokenizing real-world assets.\n\nWe believe commercial real estate and critical infrastructure should be digitized into compliant, programmable ownership structures—unlocking liquidity, expanding access, and enabling more efficient capital formation without sacrificing real economic value or regulatory integrity.\n\nOur vision is a global, digital-first system where real-world assets are issued, managed, and accessed through tokenization, bringing modern financial efficiency to historically illiquid markets.";

	// svg for the logo reveal animation
	const svgMaskSrc = "/assets/Commetize-alt-logo.svg";
	// gold gradient for filling in the logo
	const goldFill = useMemo(
		() =>
			"linear-gradient(180deg, rgba(255,244,214,1) 0%, rgba(232,216,168,1) 25%, rgba(197,155,38,1) 70%, rgba(160,120,20,1) 100%)",
		[]
	);

	// animation timings - bar fills first, then text and svg reveal

	// progress bar fills during first 45% of scroll
	const barProgress = useTransform(scrollYProgress, [0.0, 0.45], [0, 1]);

	// text and svg reveal happen in the second half of scroll
	const animStart = 0.5;
	const animEnd = 0.9;

	const textFillPct = useTransform(
		scrollYProgress,
		[animStart, animEnd],
		[0, 100],
		{ clamp: true }
	);
	const svgRevealPct = useTransform(
		scrollYProgress,
		[animStart, animEnd],
		[0, 100],
		{ clamp: true }
	);

	// clip path for the svg reveal effect - slides in from left
	const svgClipPath = useMotionTemplate`inset(0 ${useTransform(svgRevealPct, (v) => 100 - v)}% 0 0)`;

	// gradient that fills in the title text as you scroll
	const titleGradient = useMotionTemplate`linear-gradient(90deg, ${DARK_GOLD} 0%, ${DARK_GOLD} ${textFillPct}%, ${LIGHT_GOLD} ${textFillPct}%, ${LIGHT_GOLD} 100%)`;

	return (
		<div className="bg-stone-50 w-full relative">
			{/* vision section with scroll linked animations */}
			{/* the tall height gives us scroll room for all the animations to play */}
			<section
				id="vision"
				ref={sectionRef}
				className="relative"
				style={{ height: "150vh" }}
			>
				<div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
					{/* gold progress bar that fills as you scroll */}
					<div
						className={`${isMobile ? "relative mt-16 mb-6" : "absolute top-24 left-0 right-0"}`}
					>
						<div className="mx-auto w-[90%]">
							<div className="relative h-[8px] w-full overflow-hidden rounded-full">
								<motion.div
									className="absolute inset-0 rounded-full"
									style={{
										transformOrigin: "0% 50%",
										scaleX: barProgress,
										background: GOLD_GRADIENT,
									}}
								/>
							</div>
						</div>
					</div>

					{/* main content - completley different layout on mobile vs desktop */}
					{isMobile ? (
						// mobile: everything stacked vertically
						<div className="flex flex-col px-4 overflow-y-auto max-h-[calc(100vh-120px)]">
							{/* title with gradient fill animation */}
							<motion.h2
								className="text-4xl font-light leading-[1.05] mb-6 text-center"
								style={{
									backgroundImage: titleGradient,
									WebkitBackgroundClip: "text",
									backgroundClip: "text",
									color: "transparent",
								}}
							>
								{visionTitle}
							</motion.h2>

							{/* logo svg comes before paragraph on mobile for better visual flow */}
							<div className="w-full flex justify-center mb-6">
								<motion.div
									className="w-full flex items-center justify-center"
									style={{
										clipPath: svgClipPath,
									}}
								>
									<div
										className="flex items-center justify-center"
										style={{
											width: "280px",
											maxWidth: "100%",
											transform: "scale(0.9)",
											transformOrigin: "center",
										}}
									>
										<div
											className="w-full aspect-[3/2]"
											style={{
												backgroundImage: goldFill,
												WebkitMaskImage: `url(${svgMaskSrc})`,
												maskImage: `url(${svgMaskSrc})`,
												WebkitMaskRepeat: "no-repeat",
												maskRepeat: "no-repeat",
												WebkitMaskPosition: "center",
												maskPosition: "center",
												WebkitMaskSize: "contain",
												maskSize: "contain",
											}}
										/>
									</div>
								</motion.div>
							</div>

							{/* vision text */}
							<p className="text-sm leading-relaxed text-gray-700 px-2">
								{visionBody.split("\n\n").map((para, i) => (
									<React.Fragment key={i}>
										{para}
										{i < visionBody.split("\n\n").length - 1 && (
											<>
												<br />
												<br />
											</>
										)}
									</React.Fragment>
								))}
							</p>
						</div>
					) : (
						// desktop: side by side layout
						<div className="flex flex-col lg:flex-row px-8 md:px-16 lg:px-20 pt-16">
							{/* left side has the text content */}
							<div className="w-full lg:w-[45%] relative pr-8 md:pr-12">
								<div className="w-full max-w-[560px]">
									{/* title that fills with gold as you scroll */}
									<motion.h2
										className="text-6xl lg:text-7xl font-light leading-[1.05] mb-8"
										style={{
											backgroundImage: titleGradient,
											WebkitBackgroundClip: "text",
											backgroundClip: "text",
											color: "transparent",
										}}
									>
										{visionTitle}
									</motion.h2>

									{/* the vision body text */}
									<p className="text-base md:text-lg leading-relaxed text-gray-700">
										{visionBody.split("\n\n").map((para, i) => (
											<React.Fragment key={i}>
												{para}
												{i < visionBody.split("\n\n").length - 1 && (
													<>
														<br />
														<br />
													</>
												)}
											</React.Fragment>
										))}
									</p>
								</div>
							</div>

							{/* right side has the logo svg that reveals */}
							<div className="w-full lg:w-[55%] relative mt-8 lg:mt-0">
								<div className="w-full flex justify-center">
									<motion.div
										className="w-full flex items-center justify-center"
										style={{
											clipPath: svgClipPath,
										}}
									>
										<div
											className="flex items-center justify-center"
											style={{
												width: "740px",
												maxWidth: "100%",
												transform: "scale(0.92)",
												transformOrigin: "center",
											}}
										>
											<div
												className="w-full aspect-[3/2]"
												style={{
													backgroundImage: goldFill,
													WebkitMaskImage: `url(${svgMaskSrc})`,
													maskImage: `url(${svgMaskSrc})`,
													WebkitMaskRepeat: "no-repeat",
													maskRepeat: "no-repeat",
													WebkitMaskPosition: "center",
													maskPosition: "center",
													WebkitMaskSize: "contain",
													maskSize: "contain",
												}}
											/>
										</div>
									</motion.div>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* gradient line separator between sections */}
			<div className="w-full flex justify-center py-8">
				<div
					className="w-[90%] h-[1px]"
					style={{
						background:
							"linear-gradient(90deg, rgba(197,155,38,0) 0%, rgba(197,155,38,0.6) 50%, rgba(197,155,38,0) 100%)",
					}}
				/>
			</div>

			{/* foundations section with expandable cards */}
			<section
				id="foundations"
				className="relative w-full pb-24 px-4 md:px-10 lg:px-20"
			>
				<div className="max-w-7xl mx-auto">
					{/* section header */}
					<div className="text-center mb-12">
						<motion.h2
							className="text-5xl md:text-6xl font-light mb-4"
							style={{ color: DARK_GOLD }}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6 }}
						>
							Our Foundations
						</motion.h2>
						<motion.p
							className="text-gray-500 font-light text-lg mb-4"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							The principles behind real-world asset tokenization
						</motion.p>
						<motion.p
							className="text-gray-600 font-light text-base max-w-3xl mx-auto"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							Commertize is built on a simple premise: real-world assets should
							be tokenized in a way that is compliant, scalable, and
							economically meaningful. Our platform is designed around the core
							principles that make tokenization viable for commercial real
							estate and infrastructure at scale.
						</motion.p>
					</div>

					{/* the three foundation cards in a grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
						{STEPS.map((step) => (
							<FoundationCard
								key={step.key}
								step={step}
								isOpen={
									isMobile ? expandedKeys.includes(step.key) : allExpanded
								}
								onToggle={
									isMobile
										? () =>
												setExpandedKeys((prev) =>
													prev.includes(step.key)
														? prev.filter((k) => k !== step.key)
														: [...prev, step.key]
												)
										: toggleAll
								}
								isHovered={hoveredKey === step.key}
								onHover={() => setHoveredKey(step.key)}
								onLeave={() => setHoveredKey(null)}
								isMobile={isMobile}
								isActiveOnMobile={expandedKeys.includes(step.key)}
							/>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}
