import {
	AccreditationType,
	InvestmentExperience,
	KycStatus,
	OnboardingStep,
	RiskTolerance,
	VerificationStatus,
	InvestorType,
	AccreditationVerificationMethod,
} from "@commertize/data/enums";
import { investorProfileSchema } from "@commertize/data/schemas/investment";
import { kybSchema } from "@commertize/data/schemas/sponsor";
import { usePrivy } from "@privy-io/react-auth";
import { CheckCircle, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlaidLinkOnExit, PlaidLinkOnSuccess } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// Hooks & Components
import { IdentityStep } from "../components/onboarding/IdentityStep";
import { InvestorStep } from "../components/onboarding/InvestorStep";
import { OnboardingLayout } from "../components/onboarding/OnboardingLayout";
import { ProfileStep } from "../components/onboarding/ProfileStep";
import { SponsorStep } from "../components/onboarding/SponsorStep";
import { StatusModal } from "../components/onboarding/StatusModal";

import { useOnboardingState } from "../hooks/useOnboardingState";
import { FeedbackModal } from "../components/FeedbackModal";
import { Alert } from "@commertize/ui";
import { EntityType } from "@commertize/data/enums";

export default function KYCPage() {
	const { user, getAccessToken } = usePrivy();
	const navigate = useNavigate();
	const { viewState, updateViewState, setStep, closeAlert } =
		useOnboardingState();

	const [userId, setUserId] = useState<string | null>(null);

	// Profile Form State
	const [profileData, setProfileData] = useState({
		firstName: "",
		lastName: "",
		phoneNumber: "",
		bio: "",
		avatarUrl: "",
		username: "",
	});
	const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
		null
	);
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	// Investor Profile State
	const [investorProfile, setInvestorProfile] = useState({
		type: InvestorType.INDIVIDUAL,
		investmentExperience: InvestmentExperience.NONE,
		riskTolerance: RiskTolerance.MEDIUM,
		liquidNetWorth: "",
		taxCountry: "US",
		accreditationType: AccreditationType.REG_D,
		verificationMethod: undefined as
			| AccreditationVerificationMethod
			| undefined,
		documents: [] as string[],
	});
	const [newDocUrl, setNewDocUrl] = useState("");

	// Sponsor KYB State
	const [sponsorFormData, setSponsorFormData] = useState({
		businessName: "",
		businessType: "LLC",
		ein: "",
		address: "",
		documents: [] as string[],
		bio: "",
	});

	const [feedbackModal, setFeedbackModal] = useState({
		isOpen: false,
		entityType: EntityType.KYC,
		entityId: "",
		title: "",
	});

	// ----------------------------------------------------------------------
	// 1. Initial Data Fetch & Routing Logic
	// ----------------------------------------------------------------------
	useEffect(() => {
		const fetchStatus = async () => {
			updateViewState({ isCheckingStatus: true });
			try {
				const token = await getAccessToken();
				const data = await api.get("onboarding/status", token);

				if (data.user?.id) {
					setUserId(data.user.id);
				}

				// Pre-fill profile data if available
				setProfileData((prev) => ({
					...prev,
					firstName: data.user?.firstName || "",
					lastName: data.user?.lastName || "",
					phoneNumber: data.user?.phoneNumber || "",
					bio: data.user?.bio || "",
					avatarUrl: data.user?.avatarUrl || "",
					username: data.user?.username || "",
				}));

				const kycStatus = data.kycStatus;

				// Map API statuses to local state
				const investorStatus =
					data.investorQuestionnaire?.status || VerificationStatus.UNVERIFIED;
				const sponsorStatus =
					data.sponsor?.status || VerificationStatus.UNVERIFIED;

				updateViewState({ kycStatus, investorStatus, sponsorStatus });

				// Populate Investor Data if exists
				if (data.investorQuestionnaire) {
					setInvestorProfile({
						type: data.investorQuestionnaire.type || InvestorType.INDIVIDUAL,
						investmentExperience:
							data.investorQuestionnaire.investmentExperience ||
							InvestmentExperience.NONE,
						riskTolerance:
							data.investorQuestionnaire.riskTolerance || RiskTolerance.MEDIUM,
						liquidNetWorth: data.investorQuestionnaire.liquidNetWorth || "",
						taxCountry: data.investorQuestionnaire.taxCountry || "US",
						accreditationType:
							data.investorQuestionnaire.accreditationType ||
							AccreditationType.REG_D,
						verificationMethod:
							data.investorQuestionnaire.verificationMethod || undefined,
						documents: data.investorQuestionnaire.accreditationDocuments || [],
					});
				}

				// Populate Sponsor Data if exists
				if (data.sponsor) {
					setSponsorFormData({
						businessName: data.sponsor.businessName || "",
						businessType: data.sponsor.kybData?.businessType || "LLC",
						ein: data.sponsor.ein || "",
						address: data.sponsor.address || "",
						documents: data.sponsor.kybData?.documents || [],
						bio: data.sponsor.bio || "",
					});
				}

				// 1. Strict Prerequisite: IDV
				if (kycStatus !== KycStatus.APPROVED) {
					setStep(OnboardingStep.IDENTITY);
					if (
						kycStatus === KycStatus.PENDING ||
						kycStatus === KycStatus.REJECTED
					) {
						updateViewState({ kycStatus, modalOpen: true });
					}
					return;
				}

				// 2. Strict Prerequisite: Profile (Username)
				if (!data.user?.username) {
					setStep(OnboardingStep.PROFILE);
					return;
				}

				// Check query params for targeted navigation
				const searchParams = new URLSearchParams(window.location.search);
				const requestedStep = searchParams.get("step");

				if (requestedStep === "investor_profile") {
					setStep(OnboardingStep.INVESTOR_PROFILE);
					return;
				}

				if (requestedStep === "sponsor_kyb") {
					setStep(OnboardingStep.SPONSOR_KYB);
					return;
				}

				// 3. Check Investor Status
				if (
					!data.investorQuestionnaire ||
					investorStatus === VerificationStatus.REJECTED ||
					investorStatus === VerificationStatus.ACTION_REQUIRED
				) {
					setStep(OnboardingStep.INVESTOR_PROFILE);
					if (
						investorStatus === VerificationStatus.REJECTED ||
						investorStatus === VerificationStatus.ACTION_REQUIRED
					) {
						updateViewState({ modalOpen: true });
					}
					return;
				}

				// 4. Check Sponsor Status
				if (
					!data.sponsor ||
					sponsorStatus === VerificationStatus.REJECTED ||
					sponsorStatus === VerificationStatus.ACTION_REQUIRED
				) {
					setStep(OnboardingStep.SPONSOR_KYB);
					if (
						sponsorStatus === VerificationStatus.REJECTED ||
						sponsorStatus === VerificationStatus.ACTION_REQUIRED
					) {
						updateViewState({ modalOpen: true });
					}
					return;
				}

				// 5. All Done
				setStep(OnboardingStep.COMPLETED);
			} catch (error) {
				console.error("Error fetching onboarding status:", error);
			} finally {
				updateViewState({ isCheckingStatus: false });
			}
		};

		if (user) {
			fetchStatus();
		}
	}, [user, navigate, getAccessToken, updateViewState, setStep]);

	// ----------------------------------------------------------------------
	// 2. Username Availability Check
	// ----------------------------------------------------------------------
	useEffect(() => {
		const checkUsername = async () => {
			if (!profileData.username || profileData.username.length < 3) {
				setUsernameAvailable(null);
				return;
			}

			if (!/^[a-zA-Z0-9_-]+$/.test(profileData.username)) {
				setUsernameAvailable(null);
				setFieldErrors((prev) => ({
					...prev,
					username:
						"Invalid format. Use letters, numbers, underscores, and dashes.",
				}));
				setIsCheckingUsername(false);
				return;
			} else {
				setFieldErrors((prev) => {
					const newErrors = { ...prev };
					delete newErrors.username;
					return newErrors;
				});
			}

			setIsCheckingUsername(true);
			try {
				const token = await getAccessToken();
				const { available } = await api.get(
					`onboarding/check-username?username=${profileData.username}`,
					token
				);
				setUsernameAvailable(available);
			} catch (error) {
				console.error("Error checking username:", error);
				setUsernameAvailable(false);
			} finally {
				setIsCheckingUsername(false);
			}
		};

		const timeoutId = setTimeout(checkUsername, 500);
		return () => clearTimeout(timeoutId);
	}, [profileData.username, getAccessToken]);

	// ----------------------------------------------------------------------
	// 3. Success Redirection
	// ----------------------------------------------------------------------
	useEffect(() => {
		if (
			viewState.success &&
			viewState.step.current === OnboardingStep.COMPLETED
		) {
			const timer = setTimeout(() => {
				navigate("/");
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [viewState.success, viewState.step, navigate]);

	// ----------------------------------------------------------------------
	// 4. Plaid / Identity Logic
	// ----------------------------------------------------------------------
	const createLinkToken = useCallback(
		async (flow: "idv" | "auth") => {
			try {
				const token = await getAccessToken();
				const data = await api.post(
					`plaid/create_link_token?flow=${flow}`,
					{},
					token
				);
				updateViewState({ linkToken: data.link_token });
			} catch (error) {
				console.error("Error creating link token:", error);
			} finally {
				updateViewState({ loading: false });
			}
		},
		[getAccessToken, updateViewState]
	);

	// Cleanup link token on step change or user change
	useEffect(() => {
		if (user) {
			updateViewState({ linkToken: null });
		}
	}, [user, viewState.step, updateViewState]);

	const handleStartPlaid = () => {
		updateViewState({ loading: true });
		createLinkToken("idv");
	};

	const onKycSuccess = useCallback<PlaidLinkOnSuccess>(
		async (_: string, metadata: any) => {
			updateViewState({ loading: true });
			try {
				const token = await getAccessToken();
				const data = await api.post(
					"plaid/check_idv_status",
					{ link_session_id: metadata.link_session_id },
					token
				);

				// Fetch updated profile data
				const statusData = await api.get("onboarding/status", token);
				setProfileData((prev) => ({
					...prev,
					firstName: statusData.user?.firstName || "",
					lastName: statusData.user?.lastName || "",
					phoneNumber: statusData.user?.phoneNumber || "",
				}));

				if (data.success) {
					updateViewState({ kycStatus: data.status });
					setStep(OnboardingStep.PROFILE);
				} else {
					console.error("IDV Verification failed or pending:", data);
					updateViewState({ kycStatus: data.status, modalOpen: true });
				}
			} catch (error) {
				console.error("Error checking IDV status:", error);
			} finally {
				updateViewState({ loading: false });
			}
		},
		[getAccessToken, updateViewState, setStep]
	);

	const handlePlaidExit: PlaidLinkOnExit = useCallback(() => {
		updateViewState({ linkToken: null, loading: false });
	}, [updateViewState]);

	const handleRefreshStatus = async () => {
		updateViewState({ loading: true });
		try {
			const token = await getAccessToken();
			const data = await api.post("plaid/check_idv_status", {}, token);

			const statusData = await api.get("onboarding/status", token);
			setProfileData((prev) => ({
				...prev,
				firstName: statusData.user?.firstName || prev.firstName,
				lastName: statusData.user?.lastName || prev.lastName,
				phoneNumber: statusData.user?.phoneNumber || prev.phoneNumber,
			}));

			if (data.success) {
				updateViewState({
					modalOpen: false,
					kycStatus: data.status,
				});
				setStep(OnboardingStep.PROFILE);
			} else {
				updateViewState({ kycStatus: data.status });
			}
		} catch (error) {
			console.error("Error refreshing status:", error);
		} finally {
			updateViewState({ loading: false });
		}
	};

	// ----------------------------------------------------------------------
	// 5. Generic Form Handlers
	// ----------------------------------------------------------------------
	const handleProfileSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateViewState({ loading: true });
		setFieldErrors({});

		if (!profileData.username || profileData.username.length < 3) {
			setFieldErrors({ username: "Username must be at least 3 characters" });
			updateViewState({ loading: false });
			return;
		}

		if (usernameAvailable === false) {
			setFieldErrors({ username: "Username is already taken" });
			updateViewState({ loading: false });
			return;
		}

		try {
			const token = await getAccessToken();
			await api.post("onboarding/profile", profileData, token);
			setStep(OnboardingStep.INVESTOR_PROFILE);
		} catch (error: any) {
			console.error("Error updating profile:", error);
			if (
				error?.message?.includes("taken") ||
				error?.message?.includes("Username")
			) {
				setFieldErrors({ username: error.message });
			} else {
				updateViewState({
					alert: {
						isOpen: true,
						title: "Error",
						message: error?.message || "Failed to update profile",
						type: "error",
					},
				});
			}
		} finally {
			updateViewState({ loading: false });
		}
	};

	const handleInvestorSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateViewState({ loading: true });
		setFieldErrors({});

		const validation = investorProfileSchema.safeParse(investorProfile);
		if (!validation.success) {
			const errors: Record<string, string> = {};
			validation.error.issues.forEach((issue) => {
				if (issue.path[0]) {
					errors[issue.path[0].toString()] = issue.message;
				}
			});
			setFieldErrors(errors);
			updateViewState({ loading: false });
			return;
		}

		try {
			const token = await getAccessToken();
			const method =
				viewState.investorStatus === VerificationStatus.UNVERIFIED
					? "post"
					: "patch";

			await api[method]("onboarding/questionnaire", investorProfile, token);

			if (viewState.submissionIntent === "finish") {
				handleFinishOnboarding();
			} else {
				setStep(OnboardingStep.SPONSOR_KYB);
			}
		} catch (error) {
			console.error(error);
		} finally {
			updateViewState({ loading: false });
		}
	};

	const handleSponsorSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		updateViewState({ loading: true });
		setFieldErrors({});

		const validationResult = kybSchema.safeParse(sponsorFormData);
		if (!validationResult.success) {
			const errors: Record<string, string> = {};
			validationResult.error.issues.forEach((issue) => {
				if (issue.path[0]) {
					errors[issue.path[0].toString()] = issue.message;
				}
			});
			setFieldErrors(errors);
			updateViewState({ loading: false });
			return;
		}
		// Manual Validation for EIN length
		if (sponsorFormData.ein.length < 9) {
			setFieldErrors({ ein: "EIN must be at least 9 characters" });
			updateViewState({ loading: false });
			return;
		}

		try {
			const token = await getAccessToken();
			await api.post("sponsor/kyb/submit", sponsorFormData, token);

			updateViewState({
				alert: {
					isOpen: true,
					title: "Success",
					message: "Application Submitted! Pending Review.",
					type: "success",
				},
				success: true,
			});
			setStep(OnboardingStep.COMPLETED);
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (error: any) {
			console.error(error);
			updateViewState({
				alert: {
					isOpen: true,
					title: "Validation Error",
					message: error?.message || "Error submitting application",
					type: "error",
				},
			});
		} finally {
			updateViewState({ loading: false });
		}
	};

	const handleFinishOnboarding = () => {
		navigate("/");
	};

	// ----------------------------------------------------------------------
	// 6. Helpers (Clear/Add/Remove)
	// ----------------------------------------------------------------------
	const handleClearInvestor = () => {
		setInvestorProfile({
			type: InvestorType.INDIVIDUAL,
			investmentExperience: InvestmentExperience.NONE,
			riskTolerance: RiskTolerance.MEDIUM,
			liquidNetWorth: "",
			taxCountry: "US",
			accreditationType: AccreditationType.REG_D,
			verificationMethod: undefined,
			documents: [],
		});
	};

	const handleClearSponsor = () => {
		setSponsorFormData({
			businessName: "",
			businessType: "LLC",
			ein: "",
			address: "",
			documents: [],
			bio: "",
		});
	};

	// ----------------------------------------------------------------------
	// 7. File Upload Handler
	// ----------------------------------------------------------------------
	const handleFileUpload = async (file: File): Promise<string> => {
		const token = await getAccessToken();
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(
			`${import.meta.env.VITE_API_URL}/api/upload/document`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			}
		);

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to upload file");
		}

		const data = await response.json();
		return data.url;
	};

	// ----------------------------------------------------------------------
	// 7. Render
	// ----------------------------------------------------------------------

	if (viewState.isCheckingStatus) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
			</div>
		);
	}

	if (
		viewState.success &&
		viewState.step.current === OnboardingStep.COMPLETED
	) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-slate-50">
				<div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-8 h-8 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-slate-900 mb-2">
						You&apos;re all set!
					</h2>
					<p className="text-slate-600">
						Your account has been fully verified. Redirecting you to the
						dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<OnboardingLayout
			stepState={viewState.step}
			onStepClick={setStep}
			success={viewState.success}
		>
			<StatusModal
				isOpen={viewState.modalOpen}
				status={
					viewState.step.current === OnboardingStep.IDENTITY
						? viewState.kycStatus
						: viewState.step.current === OnboardingStep.INVESTOR_PROFILE
							? viewState.investorStatus
							: viewState.step.current === OnboardingStep.SPONSOR_KYB
								? viewState.sponsorStatus
								: viewState.kycStatus
				}
				title={
					viewState.step.current === OnboardingStep.INVESTOR_PROFILE
						? viewState.investorStatus === VerificationStatus.ACTION_REQUIRED
							? "Action Required on Investor Profile"
							: "Investor Profile Rejected"
						: viewState.step.current === OnboardingStep.SPONSOR_KYB
							? viewState.sponsorStatus === VerificationStatus.ACTION_REQUIRED
								? "Action Required on Sponsor Application"
								: "Sponsor Verification Rejected"
							: undefined
				}
				message={
					viewState.step.current === OnboardingStep.INVESTOR_PROFILE
						? viewState.investorStatus === VerificationStatus.ACTION_REQUIRED
							? "Your investor profile requires additional information. Please view the feedback."
							: "Your investor profile needs attention. Please view the feedback and update your information."
						: viewState.step.current === OnboardingStep.SPONSOR_KYB
							? viewState.sponsorStatus === VerificationStatus.ACTION_REQUIRED
								? "Your sponsor application requires additional information. Please view the feedback."
								: "Your sponsor application was not approved. Please review the feedback and make necessary changes."
							: undefined
				}
				onClose={() => updateViewState({ modalOpen: false })}
				onRefresh={handleRefreshStatus}
				onViewFeedback={() => {
					if (viewState.step.current === OnboardingStep.INVESTOR_PROFILE) {
						setFeedbackModal({
							isOpen: true,
							entityType: EntityType.INVESTOR,
							entityId: userId || "",
							title: "Investor Profile Feedback",
						});
					} else if (viewState.step.current === OnboardingStep.SPONSOR_KYB) {
						setFeedbackModal({
							isOpen: true,
							entityType: EntityType.SPONSOR,
							entityId: userId || "",
							title: "Sponsor Application Feedback",
						});
					}
				}}
				onEdit={() => updateViewState({ modalOpen: false })}
				loading={viewState.loading}
				userId={userId}
				privyUserId={user?.id}
			/>
			<FeedbackModal
				isOpen={feedbackModal.isOpen}
				onClose={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
				entityType={feedbackModal.entityType}
				entityId={feedbackModal.entityId}
				title={feedbackModal.title}
			/>

			{viewState.step.current === OnboardingStep.IDENTITY && (
				<IdentityStep
					linkToken={viewState.linkToken}
					onSuccess={onKycSuccess}
					onExit={handlePlaidExit}
					onStartPlaid={handleStartPlaid}
					loading={viewState.loading}
				/>
			)}

			{viewState.step.current === OnboardingStep.PROFILE && (
				<ProfileStep
					profileData={profileData}
					fieldErrors={fieldErrors}
					usernameAvailable={usernameAvailable}
					isCheckingUsername={isCheckingUsername}
					loading={viewState.loading}
					onChange={(e) =>
						setProfileData((prev) => ({
							...prev,
							[e.target.name]: e.target.value,
						}))
					}
					onSubmit={handleProfileSubmit}
				/>
			)}

			{viewState.step.current === OnboardingStep.INVESTOR_PROFILE && (
				<InvestorStep
					investorProfile={investorProfile}
					fieldErrors={fieldErrors}
					newDocUrl={newDocUrl}
					loading={viewState.loading}
					onChange={(e) =>
						setInvestorProfile((prev) => ({
							...prev,
							[e.target.name]: e.target.value,
						}))
					}
					onSubmit={handleInvestorSubmit}
					onClear={handleClearInvestor}
					onAddDocument={() => {
						if (newDocUrl) {
							setInvestorProfile((prev) => ({
								...prev,
								documents: [...prev.documents, newDocUrl],
							}));
							setNewDocUrl("");
						}
					}}
					onRemoveDocument={(idx) => {
						setInvestorProfile((prev) => ({
							...prev,
							documents: prev.documents.filter((_, i) => i !== idx),
						}));
					}}
					setNewDocUrl={setNewDocUrl}
					submissionIntent={viewState.submissionIntent}
					setSubmissionIntent={(intent) =>
						updateViewState({ submissionIntent: intent })
					}
					onSkipToSponsor={() => setStep(OnboardingStep.SPONSOR_KYB)}
					onSkip={handleFinishOnboarding}
					onUploadFile={handleFileUpload}
				/>
			)}

			{viewState.step.current === OnboardingStep.SPONSOR_KYB && (
				<SponsorStep
					sponsorFormData={sponsorFormData}
					fieldErrors={fieldErrors}
					newDocUrl={newDocUrl}
					loading={viewState.loading}
					onChange={(e) =>
						setSponsorFormData((prev) => ({
							...prev,
							[e.target.name]: e.target.value,
						}))
					}
					onSubmit={handleSponsorSubmit}
					onClear={handleClearSponsor}
					onSkip={handleFinishOnboarding}
					onAddDocument={() => {
						if (newDocUrl) {
							setSponsorFormData((prev) => ({
								...prev,
								documents: [...prev.documents, newDocUrl],
							}));
							setNewDocUrl("");
						}
					}}
					onRemoveDocument={(idx) => {
						setSponsorFormData((prev) => ({
							...prev,
							documents: prev.documents.filter((_, i) => i !== idx),
						}));
					}}
					setNewDocUrl={setNewDocUrl}
					onUploadFile={handleFileUpload}
				/>
			)}
			<Alert
				isOpen={viewState.alert.isOpen}
				onClose={closeAlert}
				title={viewState.alert.title}
				message={viewState.alert.message}
				type={viewState.alert.type}
			/>
		</OnboardingLayout>
	);
}
