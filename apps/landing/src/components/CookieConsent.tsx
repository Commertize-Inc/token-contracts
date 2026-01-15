import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
// styles import removed

const CookieConsent = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line
		setHasMounted(true);
		const timer = setTimeout(() => setIsVisible(true), 1000);
		return () => clearTimeout(timer);
	}, []);

	if (!hasMounted || !isVisible) return null;

	return (
		<AnimatePresence>
			<motion.div
				className="fixed bottom-6 left-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
				initial={{ opacity: 0, y: 20, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 20, scale: 0.95 }}
				transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
			>
				<button
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
					onClick={() => setIsVisible(false)}
				>
					<X size={14} />
				</button>
				<div className="flex items-center gap-3 mb-3">
					<div className="w-8 h-8 bg-[#DDB35F]/10 rounded-full flex items-center justify-center">
						<Cookie size={16} className="text-[#DDB35F]" />
					</div>
					<h4 className="font-medium text-gray-900">Cookie Preferences</h4>
				</div>
				<p className="text-sm text-gray-500 mb-5 leading-relaxed font-light">
					We use cookies to enhance your browsing experience, serve personalized
					content, and analyze our traffic. Please choose your preference.
				</p>
				<div className="flex gap-3">
					<button
						className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
						onClick={() => setIsVisible(false)}
					>
						Reject All
					</button>
					<button
						className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#DDB35F] hover:bg-[#C9A84E] rounded-lg transition-colors shadow-sm"
						onClick={() => setIsVisible(false)}
					>
						Accept All
					</button>
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CookieConsent;
