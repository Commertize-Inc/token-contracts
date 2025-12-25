import React from "react";
import { Navbar } from "../Navbar";
import { CheckCircle } from "lucide-react";
import { OnboardingStep } from "@commertize/data/enums";
import { StepViewState } from "../../hooks/useOnboardingState";

interface OnboardingLayoutProps {
	stepState: StepViewState;
	onStepClick: (stepId: OnboardingStep) => void;
	success?: boolean;
	children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
	stepState,
	onStepClick,
	success,
	children,
}) => {
	return (
		<div className="min-h-screen bg-slate-50">
			<div className="relative z-[100]">
				<Navbar />
			</div>
			<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
				{/* Progress Steps */}
				<div className="mb-8 mt-8">
					<div className="flex items-center justify-center space-x-4">
						{stepState.steps.map((s, idx) => {
							const currentStepIndex = stepState.steps.findIndex(
								(stepItem) => stepItem.id === stepState.current
							);
							const isCompleted = success || currentStepIndex > idx;
							const isActive = stepState.current === s.id;

							return (
								<div key={idx} className="flex items-center">
									<div
										onClick={() => {
											if (isCompleted) {
												onStepClick(s.id);
											}
										}}
										className={`flex items-center space-x-2 ${
											isActive
												? "text-blue-600"
												: isCompleted
													? "text-green-600 cursor-pointer"
													: "text-slate-400"
										}`}
									>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
												isActive
													? "border-blue-600 bg-blue-50"
													: isCompleted
														? "border-green-600 bg-green-50"
														: "border-slate-200 bg-white"
											}`}
										>
											{isCompleted ? (
												<CheckCircle className="w-5 h-5" />
											) : (
												<span className="font-bold">{idx + 1}</span>
											)}
										</div>
										<span className="font-medium hidden sm:inline">
											{s.label}
										</span>
									</div>
									{idx < stepState.steps.length - 1 && (
										<div className="w-4 sm:w-8 h-0.5 bg-slate-200 mx-2" />
									)}
								</div>
							);
						})}
					</div>
				</div>

				{children}
			</main>
		</div>
	);
};
