"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
	Star,
	Building2,
	Target,
	CheckCircle2,
	UserPlus,
	ArrowRight,
	ArrowLeft,
	Building,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const investorSchema = z.object({
	firstName: z.string().min(2, "First name must be at least 2 characters"),
	lastName: z.string().min(2, "Last name must be at least 2 characters"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(10, "Please enter a valid phone number"),
	country: z.string().min(2, "Please select your country"),
	city: z.string().min(2, "City is required"),
	investmentAmount: z.string().min(1, "Please specify your investment amount"),
	investmentTimeframe: z
		.string()
		.min(1, "Please select your investment timeframe"),
	propertyTypes: z
		.string()
		.min(1, "Please select property types you're interested in"),
	experience: z.string().min(1, "Please select your investment experience"),
	hearAboutUs: z.string().min(1, "Please let us know how you heard about us"),
	message: z.string().optional(),
});

const sponsorSchema = z.object({
	fullName: z.string().min(2, "Full name must be at least 2 characters"),
	company: z.string().min(2, "Company/Ownership Entity is required"),
	email: z.string().email("Please enter a valid email address"),
	phone: z.string().min(10, "Please enter a valid phone number"),
	propertyName: z.string().min(2, "Property name is required"),
	propertyLocation: z.string().min(2, "Property location is required"),
	assetType: z.string().min(1, "Please select an asset type"),
	estimatedValue: z.string().min(1, "Please enter estimated property value"),
	capitalNeeded: z.string().min(1, "Please enter capital needed"),
	timeline: z.string().min(1, "Please select a timeline"),
	hearAboutUs: z.string().min(1, "Please let us know how you heard about us"),
	additionalInfo: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorSchema>;
type SponsorFormData = z.infer<typeof sponsorSchema>;
type FormType = "investor" | "sponsor" | null;

export default function Waitlist() {
	const [selectedForm, setSelectedForm] = useState<FormType>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);

	const investorForm = useForm<InvestorFormData>({
		resolver: zodResolver(investorSchema),
	});

	const sponsorForm = useForm<SponsorFormData>({
		resolver: zodResolver(sponsorSchema),
	});

	const onInvestorSubmit = async (data: InvestorFormData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/waitlist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...data, type: "investor" }),
			});

			if (response.ok) {
				setSubmitSuccess(true);
				investorForm.reset();
			}
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onSponsorSubmit = async (data: SponsorFormData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/waitlist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...data, type: "sponsor" }),
			});

			if (response.ok) {
				setSubmitSuccess(true);
				sponsorForm.reset();
			}
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitSuccess) {
		return (
			<>
				<Navbar />
				<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white pt-16">
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="text-center max-w-lg mx-auto px-4"
					>
						<div className="w-20 h-20 bg-[#D4A024]/10 rounded-full flex items-center justify-center mx-auto mb-6">
							<CheckCircle2 className="w-10 h-10 text-[#D4A024]" />
						</div>
						<h1 className="text-3xl font-light text-gray-900 mb-4">
							Welcome to the Waitlist!
						</h1>
						<p className="text-gray-600 mb-8">
							Thank you for joining Commertize. We'll be in touch soon with
							exclusive opportunities.
						</p>
						<button
							onClick={() => {
								setSubmitSuccess(false);
								setSelectedForm(null);
							}}
							className="px-6 py-3 bg-[#D4A024] text-white rounded-lg hover:bg-[#B8860B] transition-colors"
						>
							Back to Home
						</button>
					</motion.div>
				</div>
				<Footer />
			</>
		);
	}

	if (selectedForm === null) {
		return (
			<>
				<Navbar />
				<div className="min-h-screen relative overflow-hidden">
					<div className="absolute inset-0 overflow-hidden pointer-events-none">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: "url(/assets/waitlist-bg.jpg)",
								backgroundSize: "cover",
								backgroundPosition: "center top",
								filter: "brightness(1.1) contrast(0.95)",
							}}
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-white/90" />
					</div>

					<div className="relative z-10 pt-24">
						<section className="py-16 px-4">
							<div className="container max-w-7xl mx-auto">
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8 }}
									className="text-center mb-16"
								>
									<div className="inline-flex items-center gap-3 bg-[#D4A024]/20 text-[#D4A024] px-6 py-3 rounded-full text-sm font-medium mb-8 border border-[#D4A024]/40 backdrop-blur-sm">
										<Star className="w-4 h-4" />
										Join Commertize — Investors & Sponsors Welcome
									</div>
									<h1 className="text-3xl md:text-5xl font-light mb-6 text-gray-900 leading-tight">
										Join the Future of Commercial Real Estate
										<br />
										<span className="font-medium text-[#D4A024]">
											Tokenize. Invest. Grow.
										</span>
									</h1>
									<p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed mb-12 font-light">
										Whether you're an investor seeking exclusive opportunities
										or a property owner ready to unlock liquidity, Commertize
										puts you at the center of the tokenized CRE revolution.
									</p>
								</motion.div>
							</div>
						</section>

						<section className="py-12 px-4">
							<div className="container max-w-7xl mx-auto">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
									<motion.div
										initial={{ opacity: 0, x: -40 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.7, delay: 0.2 }}
									>
										<div
											className="group h-full cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 border-transparent hover:border-[#D4A024]/50 bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
											onClick={() => {
												setSelectedForm("investor");
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
										>
											<div className="text-center pb-6 pt-8 px-8">
												<div className="w-20 h-20 bg-gradient-to-br from-[#D4A024]/20 to-[#D4A024]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
													<UserPlus className="w-10 h-10 text-[#D4A024]" />
												</div>
												<h3 className="text-2xl font-semibold text-gray-800 mb-3">
													I'm an Investor
												</h3>
												<p className="text-gray-600 text-base leading-relaxed">
													Unlock access to premium tokenized commercial real
													estate with institutional-grade structures.
												</p>
											</div>
											<div className="text-center px-8 pb-8">
												<div className="space-y-3 mb-8">
													<div className="flex items-center justify-center gap-3 text-gray-600">
														<CheckCircle2 className="w-5 h-5 text-[#D4A024] flex-shrink-0" />
														<span className="text-sm">
															Early access to prime properties
														</span>
													</div>
													<div className="flex items-center justify-center gap-3 text-gray-600">
														<CheckCircle2 className="w-5 h-5 text-[#D4A024] flex-shrink-0" />
														<span className="text-sm">
															Fractional ownership from $1,000
														</span>
													</div>
													<div className="flex items-center justify-center gap-3 text-gray-600">
														<CheckCircle2 className="w-5 h-5 text-[#D4A024] flex-shrink-0" />
														<span className="text-sm">
															AI-powered insights & global diversification
														</span>
													</div>
												</div>
												<button className="w-full h-12 text-base font-medium bg-[#D4A024] text-white rounded-lg hover:bg-[#B8860B] transition-colors flex items-center justify-center gap-2">
													Join Investor Waitlist
													<ArrowRight className="w-5 h-5" />
												</button>
											</div>
										</div>
									</motion.div>

									<motion.div
										initial={{ opacity: 0, x: 40 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.7, delay: 0.3 }}
									>
										<div
											className="group h-full cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 border-2 border-transparent hover:border-[#D4A024]/50 bg-white/90 backdrop-blur-sm hover:bg-white rounded-2xl"
											onClick={() => {
												setSelectedForm("sponsor");
												window.scrollTo({ top: 0, behavior: "smooth" });
											}}
										>
											<div className="text-center pb-6 pt-8 px-8">
												<div className="w-20 h-20 bg-gradient-to-br from-[#D4A024]/20 to-[#D4A024]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
													<Building className="w-10 h-10 text-[#D4A024]" />
												</div>
												<h3 className="text-2xl font-semibold text-gray-800 mb-3">
													I'm a Sponsor / Property Owner
												</h3>
												<p className="text-gray-600 text-base leading-relaxed">
													Raise capital faster by tokenizing your property on
													Commertize's marketplace.
												</p>
											</div>
											<div className="text-center px-8 pb-8">
												<div className="space-y-3 mb-8">
													<div className="flex items-center justify-center gap-3 text-gray-600">
														<CheckCircle2 className="w-5 h-5 text-[#D4A024] flex-shrink-0" />
														<span className="text-sm">
															Access a global pool of accredited investors
														</span>
													</div>
													<div className="flex items-center justify-center gap-3 text-gray-600">
														<CheckCircle2 className="w-5 h-5 text-[#D4A024] flex-shrink-0" />
														<span className="text-sm">
															Flexible liquidity solutions
														</span>
													</div>
													<div className="flex items-center justify-center gap-3 text-gray-600">
														<CheckCircle2 className="w-5 h-5 text-[#D4A024] flex-shrink-0" />
														<span className="text-sm">
															AI-driven deal analysis
														</span>
													</div>
												</div>
												<button className="w-full h-12 text-base font-medium border-2 border-[#D4A024] text-[#D4A024] rounded-lg hover:bg-[#D4A024] hover:text-white transition-colors flex items-center justify-center gap-2">
													Join Sponsor Waitlist
													<ArrowRight className="w-5 h-5" />
												</button>
											</div>
										</div>
									</motion.div>
								</div>
							</div>
						</section>

						<section className="py-20 bg-white/70 backdrop-blur-sm">
							<div className="container max-w-6xl mx-auto px-4">
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.8, delay: 0.4 }}
									className="text-center"
								>
									<h2 className="text-4xl font-light text-gray-900 mb-4">
										Why Join Early?
									</h2>
									<p className="text-xl text-gray-600 mb-16 font-light">
										Secure your place in the next era of real estate investing.
									</p>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
										<div className="text-center group">
											<div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4A024]/20 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300 border border-[#D4A024]/40">
												<Target className="w-10 h-10 text-[#D4A024]" />
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">
												Exclusive Access
											</h3>
											<p className="text-gray-600 leading-relaxed">
												Get first entry into premium tokenized commercial real
												estate deals before they reach the public marketplace.
											</p>
										</div>
										<div className="text-center group">
											<div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4A024]/20 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300 border border-[#D4A024]/40">
												<Building2 className="w-10 h-10 text-[#D4A024]" />
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">
												Institutional Quality
											</h3>
											<p className="text-gray-600 leading-relaxed">
												Invest in top-tier commercial properties once reserved
												only for major funds and institutions.
											</p>
										</div>
										<div className="text-center group">
											<div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4A024]/20 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300 border border-[#D4A024]/40">
												<Star className="w-10 h-10 text-[#D4A024]" />
											</div>
											<h3 className="text-xl font-semibold text-gray-900 mb-4">
												Priority Benefits
											</h3>
											<p className="text-gray-600 leading-relaxed">
												Unlock reduced fees, early deal access, and proprietary
												market insights from our AI research team.
											</p>
										</div>
									</div>
								</motion.div>
							</div>
						</section>
					</div>
				</div>
				<Footer />
			</>
		);
	}

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24">
				<div className="container max-w-4xl mx-auto px-4 py-12">
					<div className="mb-8">
						<button
							onClick={() => setSelectedForm(null)}
							className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Options
						</button>
					</div>

					{selectedForm === "investor" && (
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<div className="bg-white rounded-2xl shadow-xl border-2 border-[#D4A024]/30 overflow-hidden">
								<div className="text-center py-10 px-8 bg-gradient-to-br from-[#D4A024]/5 to-white">
									<div className="w-16 h-16 bg-[#D4A024]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<UserPlus className="w-8 h-8 text-[#D4A024]" />
									</div>
									<h1 className="text-3xl font-light text-gray-800 mb-2">
										Investor Waitlist
									</h1>
									<p className="text-gray-600">
										Join our exclusive investor community
									</p>
								</div>

								<form
									onSubmit={investorForm.handleSubmit(onInvestorSubmit)}
									className="p-8 space-y-8"
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="Enter your first name"
												/>
												{investorForm.formState.errors.firstName && (
													<p className="text-red-500 text-sm">
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="Enter your last name"
												/>
												{investorForm.formState.errors.lastName && (
													<p className="text-red-500 text-sm">
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="your@email.com"
												/>
												{investorForm.formState.errors.email && (
													<p className="text-red-500 text-sm">
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="+1 (555) 123-4567"
												/>
												{investorForm.formState.errors.phone && (
													<p className="text-red-500 text-sm">
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">Select your country</option>
													<option value="US">United States</option>
													<option value="CA">Canada</option>
													<option value="UK">United Kingdom</option>
													<option value="AU">Australia</option>
													<option value="other">Other</option>
												</select>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													City *
												</label>
												<input
													{...investorForm.register("city")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="Enter your city"
												/>
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">Select your investment range</option>
													<option value="1000-5000">$1,000 - $5,000</option>
													<option value="5000-25000">$5,000 - $25,000</option>
													<option value="25000-100000">
														$25,000 - $100,000
													</option>
													<option value="100000-500000">
														$100,000 - $500,000
													</option>
													<option value="500000+">$500,000+</option>
												</select>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Investment Timeframe *
												</label>
												<select
													{...investorForm.register("investmentTimeframe")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
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
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Property Types of Interest *
												</label>
												<select
													{...investorForm.register("propertyTypes")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">
														Which property types interest you?
													</option>
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
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Investment Experience *
												</label>
												<select
													{...investorForm.register("experience")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">
														Your real estate investment experience
													</option>
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
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												How did you hear about us? *
											</label>
											<select
												{...investorForm.register("hearAboutUs")}
												className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
											>
												<option value="">Select an option</option>
												<option value="social">Social Media</option>
												<option value="search">Search Engine</option>
												<option value="referral">Referral</option>
												<option value="news">News/Article</option>
												<option value="other">Other</option>
											</select>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Additional Message (Optional)
											</label>
											<textarea
												{...investorForm.register("message")}
												className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent resize-none"
												placeholder="Tell us more about your investment goals..."
											/>
										</div>
									</div>

									<button
										type="submit"
										disabled={isSubmitting}
										className="w-full h-14 bg-[#D4A024] text-white text-lg font-medium rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{isSubmitting ? "Submitting..." : "Join Investor Waitlist"}
										{!isSubmitting && <ArrowRight className="w-5 h-5" />}
									</button>
								</form>
							</div>
						</motion.div>
					)}

					{selectedForm === "sponsor" && (
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<div className="bg-white rounded-2xl shadow-xl border-2 border-[#D4A024]/30 overflow-hidden">
								<div className="text-center py-10 px-8 bg-gradient-to-br from-[#D4A024]/5 to-white">
									<div className="w-16 h-16 bg-[#D4A024]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
										<Building className="w-8 h-8 text-[#D4A024]" />
									</div>
									<h1 className="text-3xl font-light text-gray-800 mb-2">
										Sponsor Waitlist
									</h1>
									<p className="text-gray-600">
										Tokenize your property with Commertize
									</p>
								</div>

								<form
									onSubmit={sponsorForm.handleSubmit(onSponsorSubmit)}
									className="p-8 space-y-8"
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="Enter your full name"
												/>
												{sponsorForm.formState.errors.fullName && (
													<p className="text-red-500 text-sm">
														{sponsorForm.formState.errors.fullName.message}
													</p>
												)}
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Company/Entity *
												</label>
												<input
													{...sponsorForm.register("company")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="Company or ownership entity"
												/>
												{sponsorForm.formState.errors.company && (
													<p className="text-red-500 text-sm">
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="your@email.com"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Phone Number *
												</label>
												<input
													{...sponsorForm.register("phone")}
													type="tel"
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="+1 (555) 123-4567"
												/>
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
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="Name of the property"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Property Location *
												</label>
												<input
													{...sponsorForm.register("propertyLocation")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
													placeholder="City, State/Country"
												/>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Asset Type *
												</label>
												<select
													{...sponsorForm.register("assetType")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
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
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Estimated Property Value *
												</label>
												<select
													{...sponsorForm.register("estimatedValue")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">Select value range</option>
													<option value="1-5M">$1M - $5M</option>
													<option value="5-10M">$5M - $10M</option>
													<option value="10-25M">$10M - $25M</option>
													<option value="25-50M">$25M - $50M</option>
													<option value="50-100M">$50M - $100M</option>
													<option value="100M+">$100M+</option>
												</select>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Capital Needed *
												</label>
												<select
													{...sponsorForm.register("capitalNeeded")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">Select capital range</option>
													<option value="500K-1M">$500K - $1M</option>
													<option value="1-5M">$1M - $5M</option>
													<option value="5-10M">$5M - $10M</option>
													<option value="10-25M">$10M - $25M</option>
													<option value="25M+">$25M+</option>
												</select>
											</div>
											<div className="space-y-2">
												<label className="text-sm font-medium text-gray-700">
													Timeline *
												</label>
												<select
													{...sponsorForm.register("timeline")}
													className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
												>
													<option value="">When do you need capital?</option>
													<option value="immediately">Immediately</option>
													<option value="1-3months">1-3 months</option>
													<option value="3-6months">3-6 months</option>
													<option value="6-12months">6-12 months</option>
													<option value="exploring">Just exploring</option>
												</select>
											</div>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												How did you hear about us? *
											</label>
											<select
												{...sponsorForm.register("hearAboutUs")}
												className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent"
											>
												<option value="">Select an option</option>
												<option value="social">Social Media</option>
												<option value="search">Search Engine</option>
												<option value="referral">Referral</option>
												<option value="news">News/Article</option>
												<option value="conference">Conference/Event</option>
												<option value="other">Other</option>
											</select>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium text-gray-700">
												Additional Information (Optional)
											</label>
											<textarea
												{...sponsorForm.register("additionalInfo")}
												className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A024] focus:border-transparent resize-none"
												placeholder="Tell us more about your property or goals..."
											/>
										</div>
									</div>

									<button
										type="submit"
										disabled={isSubmitting}
										className="w-full h-14 bg-[#D4A024] text-white text-lg font-medium rounded-lg hover:bg-[#B8860B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
									>
										{isSubmitting ? "Submitting..." : "Join Sponsor Waitlist"}
										{!isSubmitting && <ArrowRight className="w-5 h-5" />}
									</button>
								</form>
							</div>
						</motion.div>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
}
