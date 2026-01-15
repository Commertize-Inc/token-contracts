import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "./lib/utils";
import { useLocation } from "react-router-dom";

export interface ScrollToTopProps {
	className?: string;
	threshold?: number;
}

/**
 * ScrollToTop component that automatically scrolls to top on route change
 * This should be placed inside the Router component
 */
export const ScrollToTop: React.FC = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
};

/**
 * ScrollToTopButton - A floating button that appears when user scrolls down
 * Allows manual scroll to top
 */
export const ScrollToTopButton: React.FC<ScrollToTopProps> = ({
	className,
	threshold = 300,
}) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			requestAnimationFrame(() => {
				if (window.scrollY > threshold) {
					setIsVisible(true);
				} else {
					setIsVisible(false);
				}
			});
		};

		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, [threshold]);

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.button
					onClick={scrollToTop}
					initial={{ opacity: 0, scale: 0.5, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.5, y: 20 }}
					transition={{ duration: 0.2 }}
					className={cn(
						"fixed bottom-24 right-8 z-50 p-3 rounded-full bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-[#D4A024] hover:border-[#D4A024] hover:shadow-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4A024] focus:ring-offset-2",
						className
					)}
					aria-label="Scroll to top"
				>
					<ArrowUp className="w-5 h-5" />
				</motion.button>
			)}
		</AnimatePresence>
	);
};
