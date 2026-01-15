import { motion, useScroll, useTransform } from "framer-motion";
import { RefObject } from "react";
import { OFF_WHITE } from "../constants/layout";

interface BackgroundLayerProps {
	containerRef: RefObject<HTMLDivElement>;
}

/**
 * BackgroundLayer - Global background controller
 *
 * Creates a smooth, continuous off-white background throughout the page.
 * Previously transitioned to gold for the Information section, but now
 * maintains a consistent off-white aesthetic across all sections.
 */
export default function BackgroundLayer({
	containerRef,
}: BackgroundLayerProps) {
	const { scrollYProgress } = useScroll({
		target: containerRef,
		offset: ["start start", "end end"],
	});

	// Keep consistent off-white throughout entire scroll
	const backgroundColor = useTransform(
		scrollYProgress,
		[0, 1],
		[OFF_WHITE, OFF_WHITE]
	);

	return (
		<motion.div
			className="fixed inset-0 z-0 pointer-events-none"
			style={{
				backgroundColor,
			}}
		/>
	);
}
