import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export interface ErrorModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	message: string;
}

export function ErrorModal({
	isOpen,
	onClose,
	title = "Error",
	message,
}: ErrorModalProps) {
	// Close on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			window.addEventListener("keydown", handleEscape);
		}
		return () => window.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto border border-gray-100 overflow-hidden"
						>
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-3 text-red-600">
										<div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
											<AlertCircle className="w-5 h-5" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900">
											{title}
										</h3>
									</div>
									<button
										onClick={onClose}
										className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
								<p className="text-gray-600 leading-relaxed mb-6">{message}</p>
								<div className="flex justify-end">
									<button
										onClick={onClose}
										className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
									>
										Close
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
