import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
	type?: AlertType;
	duration?: number; // Auto close after duration (ms)
}

const getIcon = (type: AlertType) => {
	switch (type) {
		case "success":
			return <CheckCircle className="w-6 h-6 text-green-500" />;
		case "error":
			return <AlertCircle className="w-6 h-6 text-red-500" />;
		case "warning":
			return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
		case "info":
		default:
			return <Info className="w-6 h-6 text-blue-500" />;
	}
};

const getBorderColor = (type: AlertType) => {
	switch (type) {
		case "success":
			return "border-green-200";
		case "error":
			return "border-red-200";
		case "warning":
			return "border-yellow-200";
		case "info":
		default:
			return "border-blue-200";
	}
};

const Alert: React.FC<AlertProps> = ({
	isOpen,
	onClose,
	title,
	message,
	type = "info",
	duration,
}) => {
	useEffect(() => {
		if (isOpen && duration) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [isOpen, duration, onClose]);

	// Prevent scrolling when alert is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-black/20 backdrop-blur-sm"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", duration: 0.3 }}
						className={`
              relative w-full max-w-sm bg-white rounded-2xl shadow-xl
              border ${getBorderColor(type)} p-6
              flex flex-col gap-4 overflow-hidden
            `}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-gray-50 rounded-full">
									{getIcon(type)}
								</div>
								<h3 className="text-lg font-medium text-gray-900">{title}</h3>
							</div>
							<button
								onClick={onClose}
								className="text-gray-400 hover:text-gray-500 transition-colors"
							>
								<X size={20} />
							</button>
						</div>

						<p className="text-gray-600 font-light leading-relaxed pl-1">
							{message}
						</p>

						<div className="flex justify-end pt-2">
							<button
								onClick={onClose}
								className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
							>
								Dismiss
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
};

export default Alert;
