import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroToAboutBridge() {
	const barRunwayRef = useRef<HTMLDivElement>(null);

	// Progress through the runway zone
	const { scrollYProgress } = useScroll({
		target: barRunwayRef,
		offset: ["start end", "end start"],
	});

	// Fill completes early, then holds while user scrolls more
	const barProgress = useTransform(scrollYProgress, [0, 0.8], [0, 1], {
		clamp: true,
	});

	// Fade in → hold → fade out (tweak to taste)
	const barOpacity = useTransform(
		scrollYProgress,
		[0.0, 0.05, 0.95, 1.0],
		[0, 1, 1, 0]
	);

	return (
		<section className="relative bg-[#FAFAF9]">
			{/* Small spacer before runway starts */}
			<div style={{ height: "8vh" }} />

			{/* Runway controls the speed/hold time */}
			<div ref={barRunwayRef} className="relative" style={{ height: "35vh" }}>
				{/* nothing here visually; it's just scroll runway */}
			</div>

			{/* Fixed bottom bar (never moves) */}
			<motion.div
				style={{ opacity: barOpacity }}
				className="fixed left-1/2 -translate-x-1/2 bottom-5 z-[9999] w-[90%] pointer-events-none"
			>
				<div className="relative h-[12px] w-full overflow-hidden rounded-sm">
					{/* Optional subtle track (remove if you want pure bar) */}
					<div className="absolute inset-0 bg-black/5" />

					{/* Fill */}
					<motion.div
						className="absolute left-0 top-0 h-full bg-[#DDB35F]"
						style={{
							scaleX: barProgress,
							originX: 0,
							width: "100%",
						}}
					/>
				</div>
			</motion.div>
		</section>
	);
}
