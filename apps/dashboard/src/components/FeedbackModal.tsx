import { createPortal } from "react-dom";
import { useEffect } from "react";
import { X } from "lucide-react";
import { ReviewFeedback } from "./ReviewFeedback";
import { EntityType } from "@commertize/data/enums";

interface FeedbackModalProps {
	isOpen: boolean;
	onClose: () => void;
	entityType: EntityType;
	entityId: string;
	title: string;
}

export function FeedbackModal({
	isOpen,
	onClose,
	entityType,
	entityId,
	title,
}: FeedbackModalProps) {
	// ESC key handler for closing modal
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
			<div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				<div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6">
					<ReviewFeedback
						entityType={entityType}
						entityId={entityId}
						title="Admin Feedback"
					/>
				</div>
			</div>
		</div>,
		document.body
	);
}
