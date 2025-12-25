"use client";

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { SubNavbar, PageHeader } from "@commertize/ui";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SEO
				title="Privacy Policy"
				description="Commertize Privacy Policy. How we collect, use, and protect your data."
			/>

			<main className="pt-32 pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-12 relative">
						{/* Left Sidebar */}
						<div className="hidden lg:block shrink-0 w-64">
							<SubNavbar
								variant="vertical"
								items={[
									{ id: "info", label: "1. Information" },
									{ id: "collection", label: "2. Collection" },
									{ id: "usage", label: "3. Usage" },
									{ id: "disclosure", label: "4. Disclosure" },
									{ id: "security", label: "5. Security" },
									{ id: "retention", label: "6. Retention" },
									{ id: "rights", label: "7. Rights" },
									{ id: "children", label: "8. Children" },
									{ id: "links", label: "9. Links" },
									{ id: "changes", label: "10. Changes" },
									{ id: "contact", label: "11. Contact" },
								]}
								offset={100}
							/>
						</div>

						{/* Main Content */}
						<div className="flex-1 min-w-0">
							<PageHeader
								title="Privacy Policy"
								subtitle="Last updated: July 23, 2025"
								className="mb-8"
							/>

							<div className="max-w-4xl mx-auto">
								<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
									<div className="prose prose-gray max-w-none">
										<p className="text-gray-600 font-light leading-relaxed mb-8">
											Welcome to www.commertize.com, owned by Commertize, Inc.
											We are committed to protecting your privacy. This Privacy
											Policy details how we collect, use, disclose, and
											otherwise process your Personal Information when you use
											our Website and services (&quot;Service&quot;).
										</p>

										<h2
											id="info"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											1. Information We Collect
										</h2>
										<p className="text-gray-600 font-light mb-4">
											We collect Personal Information as detailed below:
										</p>

										<div className="space-y-4 mb-8">
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
												<p className="text-gray-800 mb-1">
													Personal Identification Information
												</p>
												<p className="text-gray-600 font-light text-sm">
													Name, address, date of birth, nationality, contact
													details (email, phone), government-issued IDs for
													KYC/AML purposes.
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
												<p className="text-gray-800 mb-1">
													Financial Information
												</p>
												<p className="text-gray-600 font-light text-sm">
													Bank account details, net worth, income sources,
													transaction details.
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
												<p className="text-gray-800 mb-1">
													Business Information (KYB, if applicable)
												</p>
												<p className="text-gray-600 font-light text-sm">
													Company details, registration documents, beneficial
													ownership.
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
												<p className="text-gray-800 mb-1">
													Technical Information
												</p>
												<p className="text-gray-600 font-light text-sm">
													IP address, browser, device type, OS, referring pages,
													time/date stamps.
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
												<p className="text-gray-800 mb-1">Usage Information</p>
												<p className="text-gray-600 font-light text-sm">
													User interactions, pages visited, session duration.
												</p>
											</div>
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
												<p className="text-gray-800 mb-1">
													Communication Information
												</p>
												<p className="text-gray-600 font-light text-sm">
													Customer support communications, feedback,
													correspondence.
												</p>
											</div>
										</div>

										<h2
											id="collection"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											2. How We Collect Information
										</h2>
										<div className="space-y-4 mb-8">
											<div className="flex gap-3">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												<p className="text-gray-600 font-light">
													<span className="text-gray-800">Directly:</span>{" "}
													Information you provide (account registration,
													investment processing, customer support).
												</p>
											</div>
											<div className="flex gap-3">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												<p className="text-gray-600 font-light">
													<span className="text-gray-800">Automatically:</span>{" "}
													Through cookies, web analytics, and tracking
													technologies as you interact with our Service.
												</p>
											</div>
											<div className="flex gap-3">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												<p className="text-gray-600 font-light">
													<span className="text-gray-800">
														Third-party Sources:
													</span>{" "}
													Verification providers used for identity checks and
													compliance with KYC/AML/KYB requirements.
												</p>
											</div>
										</div>

										<h2
											id="usage"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											3. How We Use Your Information
										</h2>
										<p className="text-gray-600 font-light mb-4">
											We process your data for specific purposes, including:
										</p>
										<ul className="space-y-2 mb-8">
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Providing, operating, and improving our Service.
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Identity verification, compliance with regulatory
												requirements (AML/KYC/KYB).
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Transaction processing, investor accreditation, and
												account management.
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Communication, customer support, responding to your
												requests.
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Security monitoring, fraud detection/prevention,
												resolving technical issues.
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Marketing and promotional purposes (with your explicit
												consent where required).
											</li>
										</ul>

										<h2
											id="disclosure"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											4. Disclosure of Your Information
										</h2>
										<p className="text-gray-600 font-light mb-4">
											We may disclose your information to:
										</p>
										<ul className="space-y-2 mb-8">
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Our affiliates and subsidiaries.
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Third-party service providers (identity verification
												services, payment processors, hosting providers).
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Regulatory bodies or law enforcement agencies to comply
												with legal obligations.
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Parties involved in business transactions (e.g.,
												mergers, acquisitions, asset sales).
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Third parties when necessary to protect our rights,
												safety, property, or users.
											</li>
										</ul>

										<h2
											id="security"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											5. Data Security
										</h2>
										<p className="text-gray-600 font-light mb-8">
											Commertize employs commercially reasonable safeguards
											(secure servers, encryption, firewalls) designed to
											protect your Personal Information against unauthorized
											access, disclosure, alteration, or destruction. However,
											no internet transmission is fully secure; thus, we cannot
											guarantee absolute security.
										</p>

										<h2
											id="retention"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											6. Data Retention
										</h2>
										<p className="text-gray-600 font-light mb-8">
											We retain your Personal Information only for as long as
											necessary to fulfill the purposes for which it was
											collected, or as required by law or regulation, including
											legal, accounting, or reporting obligations.
										</p>

										<h2
											id="rights"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											7. Your Rights & Choices
										</h2>
										<p className="text-gray-600 font-light mb-4">
											Depending on your jurisdiction, you may have rights
											regarding your Personal Information, including:
										</p>
										<ul className="space-y-2 mb-6">
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Right to access your data
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Right to correct inaccuracies
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Right to delete or restrict data processing
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Right to data portability
											</li>
											<li className="flex gap-3 text-gray-600 font-light">
												<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
												Right to withdraw consent at any time
											</li>
										</ul>
										<p className="text-gray-600 font-light mb-4">
											To exercise these rights, contact us at
											support@commertize.com.
										</p>
										<p className="text-gray-600 font-light mb-8">
											<span className="text-gray-800">
												Marketing Communications:
											</span>{" "}
											You may opt out anytime via the unsubscribe link provided
											in our marketing emails.
										</p>

										<h2
											id="children"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											8. Children&apos;s Privacy
										</h2>
										<p className="text-gray-600 font-light mb-8">
											We do not knowingly collect Personal Information from
											individuals under the age of 16. If we become aware of
											such collection, we will promptly delete the information.
										</p>

										<h2
											id="links"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											9. Links to Other Websites
										</h2>
										<p className="text-gray-600 font-light mb-8">
											Our Website may link to third-party sites. We are not
											responsible for their privacy practices; please review
											their privacy policies separately.
										</p>

										<h2
											id="changes"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											10. Changes to this Privacy Policy
										</h2>
										<p className="text-gray-600 font-light mb-8">
											We reserve the right to update or modify this Privacy
											Policy at any time. If we make material changes, we will
											notify you prominently through our Website or via email.
										</p>

										<h2
											id="contact"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											11. How to Contact Us
										</h2>
										<p className="text-gray-600 font-light mb-4">
											For questions regarding this Privacy Policy or our privacy
											practices, contact us at:
										</p>
										<div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
											<p className="text-gray-800">Commertize, Inc.</p>
											<p className="text-gray-600 font-light">
												Attn: Legal – Privacy Policy
											</p>
											<p className="text-gray-600 font-light">
												20250 SW Acacia St. #130
											</p>
											<p className="text-gray-600 font-light">
												Newport Beach, California 92660
											</p>
											<p className="text-gray-600 font-light mt-2">
												Email: support@commertize.com
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-12 text-center">
								<div className="flex flex-wrap justify-center gap-4">
									<Link
										to="/terms"
										className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A024] text-white rounded-xl hover:bg-[#B8860B] transition-colors"
									>
										Terms of Service
										<ArrowRight className="w-4 h-4" />
									</Link>
									<Link
										to="/disclaimer"
										className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
									>
										Disclaimer
										<ArrowRight className="w-4 h-4" />
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
