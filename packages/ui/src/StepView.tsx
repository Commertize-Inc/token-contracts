import React, { ReactNode, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

export interface StepAction {
	label: string;
	onClick: () => Promise<void> | void;
	variant?: "primary" | "secondary" | "outline" | "text" | "danger";
	disabled?: boolean;
}

export interface StepViewProps {
	title: string;
	description: string;
	icon: ReactNode;
	onBack?: () => void;
	backLabel?: string;
	children: ReactNode;
	actions?: ReactNode; // Legacy support
	stepActions?: StepAction[]; // New action system
	className?: string;
}

export const StepView: React.FC<StepViewProps> = ({
	title,
	description,
	icon,
	onBack,
	backLabel = "Back",
	children,
	actions,
	stepActions,
	className = "",
}) => {
	const [tappedActionIndex, setTappedActionIndex] = useState<number | null>(
		null
	);

	const handleActionClick = async (action: StepAction, index: number) => {
		if (tappedActionIndex !== null) return; // Prevent double taps

		try {
			setTappedActionIndex(index);
			await action.onClick();
		} finally {
			setTappedActionIndex(null);
		}
	};

	const getButtonClasses = (variant: StepAction["variant"] = "primary") => {
		const base =
			"py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
		switch (variant) {
			case "primary":
				return `${base} bg-[#C59B26] text-white hover:bg-[#B08B20]`;
			case "secondary":
				return `${base} bg-slate-100 text-slate-700 hover:bg-slate-200`;
			case "outline":
				return `${base} bg-white border border-slate-200 text-slate-600 hover:bg-slate-50`;
			case "text":
				return `${base} bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50`;
			case "danger":
				return `${base} bg-white border border-red-200 text-red-600 hover:bg-red-50`;
			default:
				return `${base} bg-[#C59B26] text-white hover:bg-[#B08B20]`;
		}
	};

	return (
		<div className={`w-full ${className}`}>
			{/* Header Section */}
			<div className="text-center mb-8 relative">
				{onBack && (
					<button
						type="button"
						onClick={onBack}
						className="absolute top-0 left-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
						title={backLabel}
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
				)}

				<div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
					{icon}
				</div>
				<h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
				<p className="text-slate-600">{description}</p>
			</div>

			{/* Main Content */}
			<div className="w-full">{children}</div>

			{/* Footer Actions */}
			{(actions || stepActions) && (
				<div className="mt-6 flex items-center justify-end space-x-3">
					{actions}
					{stepActions?.map((action, idx) => (
						<button
							key={idx}
							type="button"
							onClick={() => handleActionClick(action, idx)}
							disabled={action.disabled || tappedActionIndex !== null}
							className={getButtonClasses(action.variant)}
						>
							{tappedActionIndex === idx && (
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
							)}
							{action.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
};
