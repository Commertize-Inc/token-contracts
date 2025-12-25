import { useState, useCallback } from "react";
import {
	OnboardingStep,
	KycStatus,
	VerificationStatus,
} from "@commertize/data/enums";

export type StepViewState = {
	current: OnboardingStep;
	steps: { id: OnboardingStep; label: string }[];
};

export interface OnboardingViewState {
	step: StepViewState;
	loading: boolean;
	success: boolean;
	submissionIntent: "finish" | "continue";
	linkToken: string | null;
	isCheckingStatus: boolean;
	modalOpen: boolean;
	kycStatus: KycStatus;
	investorStatus: VerificationStatus;
	sponsorStatus: VerificationStatus;
	alert: {
		isOpen: boolean;
		title: string;
		message: string;
		type: "success" | "error" | "info";
	};
}

export const useOnboardingState = () => {
	const [viewState, setViewState] = useState<OnboardingViewState>({
		step: {
			current: OnboardingStep.IDENTITY,
			steps: [
				{ id: OnboardingStep.IDENTITY, label: "Identity" },
				{ id: OnboardingStep.PROFILE, label: "Profile" },
				{ id: OnboardingStep.INVESTOR_PROFILE, label: "Investor" },
				{ id: OnboardingStep.SPONSOR_KYB, label: "Sponsor" },
			],
		},
		loading: false,
		success: false,
		submissionIntent: "continue",
		linkToken: null,
		isCheckingStatus: true,
		modalOpen: false,
		kycStatus: KycStatus.NOT_STARTED,
		investorStatus: VerificationStatus.UNVERIFIED,
		sponsorStatus: VerificationStatus.UNVERIFIED,
		alert: {
			isOpen: false,
			title: "",
			message: "",
			type: "success",
		},
	});

	const updateViewState = useCallback(
		(updates: Partial<OnboardingViewState>) => {
			setViewState((prev) => ({ ...prev, ...updates }));
		},
		[]
	);

	const setStep = useCallback((step: OnboardingStep) => {
		setViewState((prev) => ({
			...prev,
			step: { ...prev.step, current: step },
		}));
	}, []);

	const closeAlert = useCallback(() => {
		setViewState((prev) => ({
			...prev,
			alert: { ...prev.alert, isOpen: false },
		}));
	}, []);

	return {
		viewState,
		updateViewState,
		setStep,
		closeAlert,
	};
};
