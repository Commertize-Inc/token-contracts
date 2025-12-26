import { useState } from "react";
import Hero from "../components/Hero";
import AboutUs from "../components/AboutUs";
import WhyCommertize from "../components/WhyCommertize";
import ComparisonSection from "../components/ComparisonSection";
// CommertizeCollection import removed
import TokenizationInfo from "../components/TokenizationInfo";
import SubmitProperty from "../components/SubmitProperty";

import ChatGPTWidget from "../components/ChatGPTWidget";
import ContactForm from "../components/ContactForm";
import { motion } from "framer-motion";
import {
	ShieldCheck,
	Search,
	Wallet,
	TrendingUp,
	ArrowLeftRight,
	FileText,
	Globe,
} from "lucide-react";
import SEO from "../components/SEO";
// styles import removed

// Re-implementing the "How It Works" section here as it was inside Home in the original file
// and didn't seem to be a separate component.

export default function Landing() {
	const [activeTab, setActiveTab] = useState("investors");

	return (
		<div className="font-sans bg-[#FAFAF9] text-gray-900">
			<SEO />
			<Hero />
			<AboutUs />
			<WhyCommertize />
			<ComparisonSection />
			{/* CommertizeCollection removed */}
			<TokenizationInfo />
			<SubmitProperty />


			{/* How It Works Section - Enhanced */}
			<section className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
				<div className="absolute inset-0 opacity-30 pointer-events-none">
					<div className="absolute top-20 left-10 w-72 h-72 bg-[#D4A024]/10 rounded-full blur-3xl" />
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4A024]/5 rounded-full blur-3xl" />
				</div>

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="text-center mb-16"
					>
						<span className="inline-block px-4 py-2 bg-[#D4A024]/10 text-[#D4A024] rounded-full text-sm font-medium mb-4 tracking-wider uppercase">
							The Process
						</span>
						<h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
							How <span className="text-[#D4A024]">Commertize</span> Works
						</h2>
						<p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
							Start investing in institutional-grade real estate in minutes, not
							months
						</p>
					</motion.div>

					<div className="flex justify-center mb-12">
						<div className="inline-flex bg-white rounded-full p-1.5 shadow-lg border border-gray-100">
							<button
								onClick={() => setActiveTab("investors")}
								className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
									activeTab === "investors"
										? "bg-gradient-to-r from-[#D4A024] to-yellow-500 text-white shadow-md"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								For Investors
							</button>
							<button
								onClick={() => setActiveTab("sponsors")}
								className={`px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
									activeTab === "sponsors"
										? "bg-gradient-to-r from-[#D4A024] to-yellow-500 text-white shadow-md"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								For Sponsors
							</button>
						</div>
					</div>

					<div className="relative">
						<div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4A024]/30 to-transparent -translate-y-1/2 z-0" />

						<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10">
							{activeTab === "investors"
								? [
										{
											icon: ShieldCheck,
											title: "Complete KYC",
											desc: "Verify your identity and accreditation status through our secure portal",
										},
										{
											icon: Search,
											title: "Browse listings",
											desc: "Explore vetted commercial listings across asset classes and regions",
										},
										{
											icon: Wallet,
											title: "Invest",
											desc: "Purchase fractional shares using fiat or cryptocurrency",
										},
										{
											icon: TrendingUp,
											title: "Earn Distributions",
											desc: "Receive quarterly income directly to your account or wallet",
										},
										{
											icon: ArrowLeftRight,
											title: "Trade Anytime",
											desc: "Sell shares on our regulated secondary market instantly",
										},
									].map((step, index) => (
										<motion.div
											key={step.title}
											initial={{ opacity: 0, y: 40 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
											className="group"
										>
											<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#D4A024]/30 transition-all duration-300 h-full relative">
												<div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#D4A024] to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
													{index + 1}
												</div>
												<div className="pt-4">
													<div className="w-14 h-14 bg-gradient-to-br from-[#D4A024]/10 to-[#D4A024]/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-[#D4A024]/20 group-hover:to-[#D4A024]/10 transition-all duration-300">
														<step.icon className="w-7 h-7 text-[#D4A024]" />
													</div>
													<h4 className="text-lg font-medium text-gray-900 text-center mb-2">
														{step.title}
													</h4>
													<p className="text-sm text-gray-500 font-light text-center leading-relaxed">
														{step.desc}
													</p>
												</div>
											</div>
										</motion.div>
									))
								: [
										{
											icon: ShieldCheck,
											title: "Complete KYC",
											desc: "Verify identity and credentials before submitting listings",
										},
										{
											icon: FileText,
											title: "Submit Property",
											desc: "Upload property details through our streamlined portal",
										},
										{
											icon: Search,
											title: "Due Diligence",
											desc: "Comprehensive compliance and verification review",
										},
										{
											icon: Globe,
											title: "List to Market",
											desc: "Go live to our network of 14,000+ accredited investors",
										},
										{
											icon: TrendingUp,
											title: "Raise Capital",
											desc: "Fund faster with fractional ownership and blockchain",
										},
									].map((step, index) => (
										<motion.div
											key={step.title}
											initial={{ opacity: 0, y: 40 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
											className="group"
										>
											<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#D4A024]/30 transition-all duration-300 h-full relative">
												<div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-[#D4A024] to-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
													{index + 1}
												</div>
												<div className="pt-4">
													<div className="w-14 h-14 bg-gradient-to-br from-[#D4A024]/10 to-[#D4A024]/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-[#D4A024]/20 group-hover:to-[#D4A024]/10 transition-all duration-300">
														<step.icon className="w-7 h-7 text-[#D4A024]" />
													</div>
													<h4 className="text-lg font-medium text-gray-900 text-center mb-2">
														{step.title}
													</h4>
													<p className="text-sm text-gray-500 font-light text-center leading-relaxed">
														{step.desc}
													</p>
												</div>
											</div>
										</motion.div>
									))}
						</div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.5 }}
						className="mt-16 text-center"
					>
						<div className="inline-flex items-center gap-8 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-5 shadow-lg border border-[#D4A024]/20">
							<div className="text-center">
								<div className="text-3xl font-light text-[#D4A024]">$1K</div>
								<div className="text-xs text-gray-500 font-light">
									Min. Investment
								</div>
							</div>
							<div className="w-px h-10 bg-gray-200" />
							<div className="text-center">
								<div className="text-3xl font-light text-[#D4A024]">5 min</div>
								<div className="text-xs text-gray-500 font-light">
									Onboarding Time
								</div>
							</div>
							<div className="w-px h-10 bg-gray-200" />
							<div className="text-center">
								<div className="text-3xl font-light text-[#D4A024]">24/7</div>
								<div className="text-xs text-gray-500 font-light">
									Trading Access
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Contact Us Section */}
			<section className="py-20 bg-white relative z-20" id="contact">
				{/* ... (Kept simple for now, can port full SVGs if needed or use Lucide) ... */}
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
							Contact Us
						</h2>
						<p className="text-gray-600 font-light max-w-xl mx-auto">
							Have questions? We would love to hear from you.
						</p>
					</div>
					<ContactForm />
				</div>
			</section>

			<ChatGPTWidget />
		</div>
	);
}
