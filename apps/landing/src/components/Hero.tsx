import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
// hero component - the static fallback hero with animated text
// shows when hero scroll isnt used or as a backup

import { GOLD } from "../constants/layout";

import CookieConsent from "./CookieConsent";

// Animated text that cycles through words
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
	const measureRef = useRef<HTMLSpanElement>(null);
	const [wordWidth, setWordWidth] = useState<number>(0);

	useEffect(() => {
		// 2 seconds interval
		const id = window.setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % prefixes.length);
		}, 2000);
		return () => window.clearInterval(id);
	}, [prefixes.length]);

	const word = prefixes[currentIndex];

	// Measure the width of the new word so the container resizes smoothly
	useEffect(() => {
		if (!measureRef.current) return;
		const w = Math.ceil(measureRef.current.getBoundingClientRect().width);
		setWordWidth(w);
	}, [word]);

	// ANIMATION PHYSICS
	// Stiffness 300 / Damping 25 = Fast, snappy, slight weight (no wobble)
	const SNAP_TRANSITION = {
		type: "spring" as const,
		stiffness: 300,
		damping: 25,
	};

	return (
		// BOSS SNIPPET STRUCTURE: Using flex & items-baseline aligns the text perfectly
		<div className="relative flex items-baseline justify-center mt-2 sm:mt-4">
			{/* Hidden word used ONLY for measuring width */}
			<span
				ref={measureRef}
				className="absolute opacity-0 pointer-events-none text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-light whitespace-nowrap"
				aria-hidden="true"
			>
				{word}
			</span>

			{/* Main Container */}
			<div className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 font-light flex items-baseline justify-center whitespace-nowrap">
				{/* The Animated Word Container with 3D Perspective */}
				<motion.span
					className="relative inline-flex flex-col items-center overflow-hidden"
					animate={{ width: wordWidth || 0 }}
					transition={SNAP_TRANSITION}
					style={{
						willChange: "width",
						// CRITICAL: Padding ensures the "g" descender is never cut off
						paddingBottom: "12px",
						marginBottom: "-12px",
						verticalAlign: "bottom",
						// 3D PERSPECTIVE for depth effect - increased for more pronounced rotation
						perspective: "1000px",
						perspectiveOrigin: "50% 50%",
					}}
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={word}
							className="block whitespace-nowrap"
							style={{
								// Enable 3D transforms with proper origin
								transformStyle: "preserve-3d",
								backfaceVisibility: "hidden",
								transformOrigin: "center center -50px",
							}}
							// 3D VERTICAL FLIP EFFECT: "Slot Machine Roll"
							// Words tumble like a rotating cylinder/slot machine
							// Enters from below, rotating from -90deg to 0deg
							// Exits upward, rotating from 0deg to 90deg
							initial={{
								y: "50%",
								rotateX: -90,
								opacity: 0,
							}}
							animate={{
								y: "0%",
								rotateX: 0,
								opacity: 1,
							}}
							exit={{
								y: "-50%",
								rotateX: 90,
								opacity: 0,
							}}
							transition={{
								...SNAP_TRANSITION,
								duration: 0.5,
							}}
						>
							{word}
						</motion.span>
					</AnimatePresence>
				</motion.span>

				{/* The static suffix */}
				<span className="inline-block whitespace-nowrap">ized.</span>
			</div>
		</div>
	);
};

// List of items to display - split into two rows
const ASSET_TYPES_ROW1 = [
	"Commercial Real Estate",
	"Green Energy",
	"Data Centers",
	"Infrastructure",
];

const ASSET_TYPES_ROW2 = ["Institutional Assets", "Universal Access"];

const Hero = () => (
	<section className="relative min-h-screen flex items-center overflow-hidden">
		{/* Background Animation */}
		<div className="absolute inset-0 pointer-events-none">
			<motion.div
				className="absolute inset-0 bg-no-repeat pointer-events-none"
				style={{
					backgroundImage: `url('/assets/hero-pattern.jpg')`,
					imageRendering: "auto",
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

		{/* Content */}
		<div className="container relative z-10 px-4 mx-auto">
			<div className="max-w-6xl mx-auto text-center flex flex-col items-center gap-4 sm:gap-6">
				{/* Main Headline */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 leading-tight">
						<span className="block font-extralight text-xl sm:text-2xl md:text-4xl mb-1 sm:mb-0">
							Real World Assets
						</span>
						<FlippingText />
					</h1>
				</motion.div>

				{/* Updated Subtext List */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="mb-20 w-full"
				>
					<div className="flex flex-col items-center gap-y-3 max-w-5xl mx-auto mt-6 px-2">
						{/* First Row */}
						<div className="flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-5">
							{ASSET_TYPES_ROW1.map((item) => (
								<div key={item} className="flex items-center">
									<span className="text-gray-700 font-light text-[15px] sm:text-lg md:text-xl whitespace-nowrap">
										{item}
									</span>
									{/* Dot Separator - always show for row 1 */}
									<span
										className="inline-block ml-3 sm:ml-5 text-[10px] sm:text-xs align-middle"
										style={{ color: GOLD }}
									>
										●
									</span>
								</div>
							))}
						</div>

						{/* Second Row */}
						<div className="flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-5">
							{ASSET_TYPES_ROW2.map((item, index) => (
								<div key={item} className="flex items-center">
									<span className="text-gray-700 font-light text-[15px] sm:text-lg md:text-xl whitespace-nowrap">
										{item}
									</span>
									{/* Dot Separator - only show between items, not after last */}
									{index !== ASSET_TYPES_ROW2.length - 1 && (
										<span
											className="inline-block ml-3 sm:ml-5 text-[10px] sm:text-xs align-middle"
											style={{ color: GOLD }}
										>
											●
										</span>
									)}
								</div>
							))}
						</div>
					</div>
				</motion.div>
			</div>
		</div>

		<CookieConsent />
	</section>
);

export default Hero;
