import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
	Send,
	Mail,
	User,
	MessageSquare,
	AlertCircle,
	Building2,
	UserPlus,
	CheckCircle2,
} from "lucide-react";
import { Button, ErrorModal } from "@commertize/ui";
import { api } from "../lib/api";
import {
	contactInvestorSchema,
	contactSponsorSchema,
} from "@commertize/data/schemas/contact";
import { useLocation } from "react-router-dom";
import { usePostHog } from "@commertize/utils/client";

// Schema types
type InvestorFormData = z.infer<typeof contactInvestorSchema>;
type SponsorFormData = z.infer<typeof contactSponsorSchema>;

type TabType = "general" | "investor" | "sponsor";

export default function ContactForm() {
	const location = useLocation();
	const posthog = usePostHog();
	const [activeTab, setActiveTab] = useState<TabType>("general");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [errorModalOpen, setErrorModalOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Watch for hash changes to switch tabs
	useEffect(() => {
		if (location.hash === "#contact-investor") {
			setActiveTab("investor");
			const element = document.getElementById("contact");
			if (element) element.scrollIntoView({ behavior: "smooth" });
		} else if (location.hash === "#contact-sponsor") {
			setActiveTab("sponsor");
			const element = document.getElementById("contact");
			if (element) element.scrollIntoView({ behavior: "smooth" });
		}
	}, [location.hash]);

	useEffect(() => {
		if (posthog) {
			posthog.capture("contact_tab_viewed", { tab: activeTab });
		}
	}, [activeTab, posthog]);

	// General Inquiry State
	const [generalFormData, setGeneralFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});

	// Investor Form
	const investorForm = useForm<InvestorFormData>({
		resolver: zodResolver(contactInvestorSchema),
	});

	// Sponsor Form
	const sponsorForm = useForm<SponsorFormData>({
		resolver: zodResolver(contactSponsorSchema),
	});

	const handleGeneralChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setGeneralFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleGeneralSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// Construct mailto link
		const { name, email, subject, message } = generalFormData;
		const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
		const mailtoLink = `mailto:support@commertize.com?subject=${encodeURIComponent(
			subject || "Contact from Landing Page"
		)}&reply-to=${encodeURIComponent(email)}&body=${encodeURIComponent(body)}`;

		// Open email client
		window.location.href = mailtoLink;

		if (posthog) {
			posthog.capture("contact_form_submitted", {
				form_type: "general",
				subject: subject,
			});
		}

		// Reset state after a brief delay
		setTimeout(() => {
			setIsSubmitting(false);
		}, 1000);
	};

	const handleApiError = (error: any) => {
		console.error("Error submitting form:", error);
		let message = "Something went wrong. Please try again later.";
		if (error?.response?.data?.message) {
			message = error.response.data.message;
		} else if (error?.message) {
			message = error.message;
		}
		setErrorMessage(message);
		setErrorModalOpen(true);
	};

	const onInvestorSubmit = async (data: InvestorFormData) => {
		setIsSubmitting(true);
		try {
			await api.post("/contact", { ...data, type: "investor" });
			if (posthog) {
				posthog.capture("waitlist_form_submitted", {
					form_type: "investor",
					investment_amount: data.investmentAmount,
					property_types: data.propertyTypes,
				});
			}
			setSubmitSuccess(true);
			investorForm.reset();
		} catch (error) {
			handleApiError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSponsorSubmit = async (data: SponsorFormData) => {
		setIsSubmitting(true);
		try {
			await api.post("/contact", { ...data, type: "sponsor" });
			if (posthog) {
				posthog.capture("waitlist_form_submitted", {
					form_type: "sponsor",
					estimated_value: data.estimatedValue,
					asset_type: data.assetType,
				});
			}
			setSubmitSuccess(true);
			sponsorForm.reset();
		} catch (error) {
			handleApiError(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitSuccess) {
		return (
			<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 md:p-12 text-center">
				<div className="w-20 h-20 bg-[#DDB35F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
					<CheckCircle2 className="w-10 h-10 text-[#DDB35F]" />
				</div>
				<h2 className="text-3xl font-light text-gray-900 mb-4">Thank You!</h2>
				<p className="text-gray-600 mb-8">
					We have received your information and will be in touch soon with
					exclusive opportunities.
				</p>
				<Button
					onClick={() => setSubmitSuccess(false)}
					className="bg-[#DDB35F] text-white hover:bg-[#B8860B]"
				>
					Send Another Message
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
			<ErrorModal
				isOpen={errorModalOpen}
				onClose={() => setErrorModalOpen(false)}
				message={errorMessage}
				title="Submission Failed"
			/>

			{/* Decorative background elements */}
			<div className="absolute top-0 right-0 w-32 h-32 bg-[#DDB35F]/5 rounded-bl-full pointer-events-none z-0" />
			<div className="absolute bottom-0 left-0 w-24 h-24 bg-[#DDB35F]/5 rounded-tr-full pointer-events-none z-0" />

			{/* Tabs */}
			<div className="flex border-b border-gray-100 relative z-10">
				<button
					onClick={() => setActiveTab("general")}
					className={`flex-1 py-6 text-sm md:text-base font-medium transition-all duration-300 relative ${activeTab === "general"
							? "text-[#DDB35F] bg-white"
							: "text-gray-500 bg-gray-50 hover:bg-gray-100"
						}`}
				>
					<span className="flex items-center justify-center gap-2">
						<MessageSquare size={18} />
						General Inquiry
					</span>
					{activeTab === "general" && (
						<motion.div
							layoutId="activeTab"
							className="absolute bottom-0 left-0 right-0 h-1 bg-[#DDB35F]"
						/>
					)}
				</button>
				<button
					onClick={() => setActiveTab("investor")}
					className={`flex-1 py-6 text-sm md:text-base font-medium transition-all duration-300 relative ${activeTab === "investor"
							? "text-[#DDB35F] bg-white"
							: "text-gray-500 bg-gray-50 hover:bg-gray-100"
						}`}
				>
					<span className="flex items-center justify-center gap-2">
						<UserPlus size={18} />
						For Investors
					</span>
					{activeTab === "investor" && (
						<motion.div
							layoutId="activeTab"
							className="absolute bottom-0 left-0 right-0 h-1 bg-[#DDB35F]"
						/>
					)}
				</button>
				<button
					onClick={() => setActiveTab("sponsor")}
					className={`flex-1 py-6 text-sm md:text-base font-medium transition-all duration-300 relative ${activeTab === "sponsor"
							? "text-[#DDB35F] bg-white"
							: "text-gray-500 bg-gray-50 hover:bg-gray-100"
						}`}
				>
					<span className="flex items-center justify-center gap-2">
						<Building2 size={18} />
						For Sponsors
					</span>
					{activeTab === "sponsor" && (
						<motion.div
							layoutId="activeTab"
							className="absolute bottom-0 left-0 right-0 h-1 bg-[#DDB35F]"
						/>
					)}
				</button>
			</div>

			<div className="p-8 md:p-12 relative z-10">
				<AnimatePresence mode="wait">
					{activeTab === "general" && (
						<motion.div
							key="general"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
						>
							<div className="text-center mb-8">
								<h3 className="text-2xl font-light text-gray-800 mb-2">
									Get in Touch
								</h3>
								<p className="text-gray-500">
									Have a question? Send us a message and we&apos;ll reply
									shortly.
								</p>
							</div>

							<form onSubmit={handleGeneralSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
											<User size={16} className="text-[#DDB35F]" />
											Your Name
										</label>
										<input
											type="text"
											name="name"
											required
											value={generalFormData.name}
											onChange={handleGeneralChange}
											className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											placeholder="John Doe"
										/>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
											<Mail size={16} className="text-[#DDB35F]" />
											Email Address
										</label>
										<input
											type="email"
											name="email"
											required
											value={generalFormData.email}
											onChange={handleGeneralChange}
											className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											placeholder="john@example.com"
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
										<AlertCircle size={16} className="text-[#DDB35F]" />
										Subject
									</label>
									<input
										type="text"
										name="subject"
										required
										value={generalFormData.subject}
										onChange={handleGeneralChange}
										className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
										placeholder="Investment Inquiry"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium text-gray-700 flex items-center gap-2">
										<MessageSquare size={16} className="text-[#DDB35F]" />
										Message
									</label>
									<textarea
										name="message"
										required
										rows={5}
										value={generalFormData.message}
										onChange={handleGeneralChange}
										className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white resize-none"
										placeholder="How can we help you?"
									/>
								</div>

								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-full py-4 text-base font-medium bg-[#DDB35F] hover:bg-[#B8860B] text-white rounded-xl shadow-lg shadow-[#DDB35F]/20 transition-all hover:shadow-[#DDB35F]/30"
								>
									<span className="flex items-center justify-center gap-2">
										{isSubmitting ? "Opening Email App..." : "Send Message"}
										{!isSubmitting && <Send size={18} />}
									</span>
								</Button>
							</form>
						</motion.div>
					)}

					{activeTab === "investor" && (
						<motion.div
							key="investor"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
						>
							<div className="text-center mb-8">
								<h3 className="text-2xl font-light text-gray-800 mb-2">
									Join as Investor
								</h3>
								<p className="text-gray-500">
									Get early access to premium tokenized commercial real estate.
								</p>
							</div>

							<form
								onSubmit={investorForm.handleSubmit(onInvestorSubmit)}
								className="space-y-6"
							>
								<div className="space-y-6">
									<h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3">
										Personal Information
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												First Name *
											</label>
											<input
												{...investorForm.register("firstName")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="First name"
											/>
											{investorForm.formState.errors.firstName && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.firstName.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Last Name *
											</label>
											<input
												{...investorForm.register("lastName")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="Last name"
											/>
											{investorForm.formState.errors.lastName && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.lastName.message}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Email Address *
											</label>
											<input
												{...investorForm.register("email")}
												type="email"
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="john@example.com"
											/>
											{investorForm.formState.errors.email && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.email.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Phone Number *
											</label>
											<input
												{...investorForm.register("phone")}
												type="tel"
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="+1 (555) 123-4567"
											/>
											{investorForm.formState.errors.phone && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.phone.message}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Country *
											</label>
											<select
												{...investorForm.register("country")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Select country</option>
												<option value="US">United States</option>
												<option value="CA">Canada</option>
												<option value="UK">United Kingdom</option>
												<option value="AU">Australia</option>
												<option value="other">Other</option>
											</select>
											{investorForm.formState.errors.country && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.country.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												City *
											</label>
											<input
												{...investorForm.register("city")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="City"
											/>
											{investorForm.formState.errors.city && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.city.message}
												</p>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3">
										Investment Preferences
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Investment Amount *
											</label>
											<select
												{...investorForm.register("investmentAmount")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Select range</option>
												<option value="1000-5000">$1,000 - $5,000</option>
												<option value="5000-25000">$5,000 - $25,000</option>
												<option value="25000-100000">$25,000 - $100,000</option>
												<option value="100000-500000">
													$100,000 - $500,000
												</option>
												<option value="500000+">$500,000+</option>
											</select>
											{investorForm.formState.errors.investmentAmount && (
												<p className="text-red-500 text-xs">
													{
														investorForm.formState.errors.investmentAmount
															.message
													}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Timeframe *
											</label>
											<select
												{...investorForm.register("investmentTimeframe")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">
													When are you looking to invest?
												</option>
												<option value="immediately">Immediately</option>
												<option value="1-3months">1-3 months</option>
												<option value="3-6months">3-6 months</option>
												<option value="6-12months">6-12 months</option>
												<option value="researching">Just researching</option>
											</select>
											{investorForm.formState.errors.investmentTimeframe && (
												<p className="text-red-500 text-xs">
													{
														investorForm.formState.errors.investmentTimeframe
															.message
													}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Property Types *
											</label>
											<select
												{...investorForm.register("propertyTypes")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Select types</option>
												<option value="office">Office Buildings</option>
												<option value="datacenters">Datacenters</option>
												<option value="multifamily">
													Multifamily/Apartments
												</option>
												<option value="retail">Retail Centers</option>
												<option value="industrial">
													Industrial/Warehouses
												</option>
												<option value="hotel">Hotels</option>
												<option value="all">All Property Types</option>
											</select>
											{investorForm.formState.errors.propertyTypes && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.propertyTypes.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Experience *
											</label>
											<select
												{...investorForm.register("experience")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Your experience level</option>
												<option value="beginner">
													New to real estate investing
												</option>
												<option value="some">
													Some real estate experience
												</option>
												<option value="experienced">
													Experienced investor
												</option>
												<option value="professional">
													Professional/Institutional
												</option>
											</select>
											{investorForm.formState.errors.experience && (
												<p className="text-red-500 text-xs">
													{investorForm.formState.errors.experience.message}
												</p>
											)}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											How did you hear about us? *
										</label>
										<select
											{...investorForm.register("hearAboutUs")}
											className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
										>
											<option value="">Select an option</option>
											<option value="social">Social Media</option>
											<option value="search">Search Engine</option>
											<option value="referral">Referral</option>
											<option value="news">News/Article</option>
											<option value="other">Other</option>
										</select>
										{investorForm.formState.errors.hearAboutUs && (
											<p className="text-red-500 text-xs">
												{investorForm.formState.errors.hearAboutUs.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											Additional Message (Optional)
										</label>
										<textarea
											{...investorForm.register("message")}
											className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white resize-none h-24"
											placeholder="Tell us more about your investment goals..."
										/>
									</div>
								</div>

								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-full py-4 text-base font-medium bg-[#DDB35F] hover:bg-[#B8860B] text-white rounded-xl shadow-lg shadow-[#DDB35F]/20 transition-all hover:shadow-[#DDB35F]/30"
								>
									{isSubmitting ? "Submitting..." : "Join Investor Waitlist"}
								</Button>
							</form>
						</motion.div>
					)}

					{activeTab === "sponsor" && (
						<motion.div
							key="sponsor"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
						>
							<div className="text-center mb-8">
								<h3 className="text-2xl font-light text-gray-800 mb-2">
									Join as Sponsor
								</h3>
								<p className="text-gray-500">
									Tokenize your property and access global capital.
								</p>
							</div>

							<form
								onSubmit={sponsorForm.handleSubmit(onSponsorSubmit)}
								className="space-y-6"
							>
								<div className="space-y-6">
									<h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3">
										Contact Information
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Full Name *
											</label>
											<input
												{...sponsorForm.register("fullName")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="Full name"
											/>
											{sponsorForm.formState.errors.fullName && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.fullName.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Company *
											</label>
											<input
												{...sponsorForm.register("company")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="Company name"
											/>
											{sponsorForm.formState.errors.company && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.company.message}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Email Address *
											</label>
											<input
												{...sponsorForm.register("email")}
												type="email"
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="john@company.com"
											/>
											{sponsorForm.formState.errors.email && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.email.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Phone Number *
											</label>
											<input
												{...sponsorForm.register("phone")}
												type="tel"
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="+1 (555) 123-4567"
											/>
											{sponsorForm.formState.errors.phone && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.phone.message}
												</p>
											)}
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-3">
										Property Information
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Property Name *
											</label>
											<input
												{...sponsorForm.register("propertyName")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="Property name"
											/>
											{sponsorForm.formState.errors.propertyName && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.propertyName.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Location *
											</label>
											<input
												{...sponsorForm.register("propertyLocation")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
												placeholder="City, State/Country"
											/>
											{sponsorForm.formState.errors.propertyLocation && (
												<p className="text-red-500 text-xs">
													{
														sponsorForm.formState.errors.propertyLocation
															.message
													}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Asset Type *
											</label>
											<select
												{...sponsorForm.register("assetType")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Select asset type</option>
												<option value="office">Office</option>
												<option value="multifamily">Multifamily</option>
												<option value="retail">Retail</option>
												<option value="industrial">Industrial</option>
												<option value="hotel">Hotel/Hospitality</option>
												<option value="mixed">Mixed Use</option>
												<option value="datacenter">Data Center</option>
												<option value="other">Other</option>
											</select>
											{sponsorForm.formState.errors.assetType && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.assetType.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Estimated Value *
											</label>
											<select
												{...sponsorForm.register("estimatedValue")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Select value range</option>
												<option value="1-5M">$1M - $5M</option>
												<option value="5-10M">$5M - $10M</option>
												<option value="10-25M">$10M - $25M</option>
												<option value="25-50M">$25M - $50M</option>
												<option value="50-100M">$50M - $100M</option>
												<option value="100M+">$100M+</option>
											</select>
											{sponsorForm.formState.errors.estimatedValue && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.estimatedValue.message}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Capital Needed *
											</label>
											<select
												{...sponsorForm.register("capitalNeeded")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">Select range</option>
												<option value="500K-1M">$500K - $1M</option>
												<option value="1-5M">$1M - $5M</option>
												<option value="5-10M">$5M - $10M</option>
												<option value="10-25M">$10M - $25M</option>
												<option value="25M+">$25M+</option>
											</select>
											{sponsorForm.formState.errors.capitalNeeded && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.capitalNeeded.message}
												</p>
											)}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Timeline *
											</label>
											<select
												{...sponsorForm.register("timeline")}
												className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
											>
												<option value="">When do you need capital?</option>
												<option value="immediately">Immediately</option>
												<option value="1-3months">1-3 months</option>
												<option value="3-6months">3-6 months</option>
												<option value="6-12months">6-12 months</option>
											</select>
											{sponsorForm.formState.errors.timeline && (
												<p className="text-red-500 text-xs">
													{sponsorForm.formState.errors.timeline.message}
												</p>
											)}
										</div>
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											How did you hear about us? *
										</label>
										<select
											{...sponsorForm.register("hearAboutUs")}
											className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white"
										>
											<option value="">Select an option</option>
											<option value="social">Social Media</option>
											<option value="search">Search Engine</option>
											<option value="referral">Referral</option>
											<option value="news">News/Article</option>
											<option value="other">Other</option>
										</select>
										{sponsorForm.formState.errors.hearAboutUs && (
											<p className="text-red-500 text-xs">
												{sponsorForm.formState.errors.hearAboutUs.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<label className="text-sm font-medium text-gray-700">
											Message (Optional)
										</label>
										<textarea
											{...sponsorForm.register("additionalInfo")}
											className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#DDB35F] focus:ring-1 focus:ring-[#DDB35F] outline-none transition-all bg-gray-50/50 focus:bg-white resize-none h-24"
											placeholder="Any additional details..."
										/>
									</div>
								</div>

								<Button
									type="submit"
									disabled={isSubmitting}
									className="w-full py-4 text-base font-medium bg-[#DDB35F] hover:bg-[#B8860B] text-white rounded-xl shadow-lg shadow-[#DDB35F]/20 transition-all hover:shadow-[#DDB35F]/30"
								>
									{isSubmitting ? "Submitting..." : "Join Sponsor Waitlist"}
								</Button>
							</form>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
