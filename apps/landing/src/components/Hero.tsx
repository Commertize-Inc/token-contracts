import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CookieConsent from "./CookieConsent";

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
		// eslint-disable-next-line
		setHasMounted(true);
	}, []);

	useEffect(() => {
		if (!hasMounted) return;
		const interval = setInterval(() => {
			setAnimationKey((prev) => prev + 1);
			setCurrentIndex((prev) => (prev + 1) % prefixes.length);
		}, 2500);
		return () => clearInterval(interval);
	}, [hasMounted, prefixes.length]);

	return (
		<div className="relative h-12 sm:h-16 md:h-20 lg:h-24 flex items-center justify-center mt-4">
			<div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 font-light flex items-baseline justify-center">
				<span
					key={hasMounted ? animationKey : "initial"}
					className={
						hasMounted ? "inline-block animate-flip-up" : "inline-block"
					}
					style={{
						animation: hasMounted
							? "flipUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards"
							: "none",
					}}
				>
					{prefixes[currentIndex]}
				</span>
				<span>ized.</span>
			</div>
			<style>{`
                @keyframes flipUp {
                    from { transform: rotateX(90deg) translateZ(20px); opacity: 0; }
                    to { transform: rotateX(0deg) translateZ(0); opacity: 1; }
                }
            `}</style>
		</div>
	);
};

const Hero = () => (
	<section className="relative min-h-screen flex items-center overflow-hidden">
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

		<div className="container relative z-10 px-4 pt-32 sm:pt-40 md:pt-48 mx-auto">
			<div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4 sm:gap-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900">
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
					<p className="max-w-3xl mx-auto text-gray-800 drop-shadow-sm text-base sm:text-lg md:text-xl font-light px-4">
						Your Gateway to Commercial Real Estate&apos;s Digital Future.
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
								className="inline h-4 sm:h-5 w-auto ml-1"
								style={{
									verticalAlign: "baseline",
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
						to="/marketplace"
						className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#D4A024] rounded-[0.75rem] text-sm sm:text-base font-light border-2 border-[#D4A024] hover:bg-[#D4A024]/5 transition-colors hover:scale-[1.02] active:scale-[0.98]"
					>
						Explore Marketplace
					</Link>
					<a
						href="/waitlist"
						className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D4A024] text-white rounded-[0.75rem] text-sm sm:text-base font-light hover:bg-[#B8881C] transition-colors hover:scale-[1.02] active:scale-[0.98]"
					>
						Join Waitlist
					</a>
				</motion.div>
			</div>
		</div>

		<CookieConsent />
	</section>
);

export default Hero;
