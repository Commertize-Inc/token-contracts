import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
	"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop", // Modern white building
	"https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=2670&auto=format&fit=crop", // Abstract curves
	"https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=2670&auto=format&fit=crop", // Glass facade
];

export default function BackgroundSlider() {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((prev) => (prev + 1) % images.length);
		}, 8000); // Change image every 8 seconds

		return () => clearInterval(timer);
	}, []);

	return (
		<div className="fixed inset-0 z-0 overflow-hidden bg-black">
			<AnimatePresence initial={false}>
				<motion.div
					key={index}
					className="absolute inset-0 bg-cover bg-center"
					style={{
						backgroundImage: `url(${images[index]})`,
					}}
					initial={{ opacity: 0, scale: 1.1 }}
					animate={{ opacity: 0.6, scale: 1 }} // Fade in to 60% opacity for better text contrast
					exit={{ opacity: 0, zIndex: -1 }} // Fade out
					transition={{
						opacity: { duration: 2 },
						scale: { duration: 8, ease: "linear" }, // Slow zoom effect
					}}
				/>
			</AnimatePresence>
			{/* Overlay gradient for extra readability */}
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 pointer-events-none" />
		</div>
	);
}
