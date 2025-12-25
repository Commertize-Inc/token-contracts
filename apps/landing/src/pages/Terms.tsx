import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { SubNavbar, PageHeader } from "@commertize/ui";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SEO
				title="Terms of Service"
				description="Terms and Conditions for using the Commertize platform."
			/>

			<main className="pt-32 pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-12 relative">
						{/* Left Sidebar */}
						<div className="hidden lg:block shrink-0 w-64">
							<SubNavbar
								variant="vertical"
								items={[
									{ id: "acceptance", label: "1. Acceptance" },
									{ id: "eligibility", label: "2. Eligibility" },
									{ id: "accounts", label: "3. Accounts" },
									{ id: "privacy", label: "4. Privacy" },
									{ id: "ip", label: "5. IP" },
									{ id: "transactions", label: "6. Transactions" },
									{ id: "security", label: "7. Security" },
									{ id: "disclaimers", label: "8. Disclaimers" },
									{ id: "indemnity", label: "9. Indemnity" },
									{ id: "disputes", label: "10. Disputes" },
									{ id: "misc", label: "11. Misc" },
									{ id: "contact", label: "12. Contact" },
									{ id: "changes", label: "13. Changes" },
								]}
								offset={100}
							/>
						</div>

						{/* Main Content */}
						<div className="flex-1 min-w-0">
							<PageHeader
								title="Terms of Service"
								subtitle="Effective Date: January 2025"
								className="mb-8"
							/>

							<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
								<div className="prose prose-gray max-w-none">
									<p className="text-gray-600 font-light leading-relaxed mb-8">
										Welcome to www.Commertize.com, owned by Commertize, Inc.
										these Terms of Service govern your use of our Website,
										products, and services (collectively, the
										&quot;Service&quot;). By accessing or using the Service, you
										agree to be bound by these Terms, and you represent that you
										have read and understood them. If you do not agree, you may
										not access or use the Service.
									</p>

									<h2
										id="acceptance"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										1. Acceptance of These Terms
									</h2>
									<p className="text-gray-600 font-light mb-4">
										By creating an account, submitting any information, or
										otherwise engaging with our Website, you acknowledge and
										agree that you have read, understood, and agree to be bound
										by these Terms and all other referenced agreements
										(including our Privacy Policy). You also agree that you have
										the authority to enter into these Terms personally, or on
										behalf of the entity you represent, and to bind that entity
										to these Terms.
									</p>
									<p className="text-gray-600 font-light mb-8">
										We reserve the right to modify these Terms at any time. If
										we do so, we will post the updated Terms and update the
										&quot;Effective Date&quot; at the top of this document. Your
										continued use of the Service after any such modification
										constitutes your acceptance of the revised Terms.
									</p>

									<h2
										id="eligibility"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										2. Eligibility and User Conduct
									</h2>
									<div className="space-y-4 mb-8">
										<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
											<p className="text-gray-800 mb-1">Eligibility</p>
											<p className="text-gray-600 font-light text-sm">
												You must be at least 18 years old (or the applicable age
												of majority in your jurisdiction) to use our Service.
											</p>
										</div>
										<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
											<p className="text-gray-800 mb-1">Accurate Information</p>
											<p className="text-gray-600 font-light text-sm">
												You agree to provide accurate, current, and complete
												information when creating an account or otherwise
												interacting with the Service.
											</p>
										</div>
										<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
											<p className="text-gray-800 mb-2">Prohibited Conduct</p>
											<p className="text-gray-600 font-light text-sm mb-2">
												You agree not to use the Service in any manner that:
											</p>
											<ul className="space-y-1 text-gray-600 font-light text-sm">
												<li className="flex gap-2">
													<span className="text-[#D4A024]">•</span> Violates any
													applicable local, state, national, or international
													law or regulation
												</li>
												<li className="flex gap-2">
													<span className="text-[#D4A024]">•</span> Infringes
													upon the rights of others, including intellectual
													property rights or privacy rights
												</li>
												<li className="flex gap-2">
													<span className="text-[#D4A024]">•</span> Could harm
													or attempt to harm our systems or any third
													party&apos;s systems
												</li>
												<li className="flex gap-2">
													<span className="text-[#D4A024]">•</span> Distributes
													spam, viruses, or other harmful software
												</li>
												<li className="flex gap-2">
													<span className="text-[#D4A024]">•</span> Attempts to
													gain unauthorized access to any part of the Service or
													underlying infrastructure
												</li>
											</ul>
										</div>
									</div>

									<h2
										id="accounts"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										3. User Accounts
									</h2>
									<div className="space-y-4 mb-8">
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Account Creation:</span>{" "}
												You may be required to create an account to access
												certain features of the Service. You are responsible for
												maintaining the confidentiality of your login
												credentials.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Responsibility:</span>{" "}
												You are fully responsible for all activities that occur
												under your account. If you suspect any unauthorized use
												of your account, you must notify Commertize immediately
												at support@commertize.com.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">
													Account Termination:
												</span>{" "}
												Commertize reserves the right to suspend or terminate
												your account or restrict access to the Service at any
												time, with or without notice, for any or no reason.
											</p>
										</div>
									</div>

									<h2
										id="privacy"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										4. Use of Personal Information
									</h2>
									<p className="text-gray-600 font-light mb-8">
										Commertize may collect, use, and disclose personal
										information from users as needed to provide the Service and
										for other lawful purposes. Please review our Privacy Policy
										for details on how we handle your personal information. By
										using the Service, you consent to the collection and use of
										this information in accordance with our Privacy Policy.
									</p>

									<h2
										id="ip"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										5. Intellectual Property
									</h2>
									<div className="space-y-4 mb-8">
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Ownership:</span> The
												Service (including text, graphics, logos, images, and
												software) is owned or licensed by Commertize and is
												protected by applicable intellectual property laws.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Limited License:</span>{" "}
												Subject to your compliance with these Terms, Commertize
												grants you a non-exclusive, non-transferable, revocable
												license to access and use the Service for your personal
												or internal business use.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Restrictions:</span> You
												may not modify, copy, distribute, reproduce, publish,
												license, create derivative works from, or sell any
												content obtained from the Service without explicit prior
												written permission from Commertize.
											</p>
										</div>
									</div>

									<h2
										id="transactions"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										6. Transaction Information and Third Parties
									</h2>
									<div className="space-y-4 mb-8">
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">
													Transaction Processing:
												</span>{" "}
												Certain features of the Service may enable you to invest
												in or otherwise engage in transactions with
												&quot;issuers&quot; through Commertize&apos;s
												technology. You agree that Commertize is not responsible
												for the actions or omissions of any issuer or third
												party.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Broker-Dealers:</span>{" "}
												Some investment opportunities available via the Service
												may be offered by a broker-dealer (an affiliate of
												Commertize or an unaffiliated third party). Any personal
												or transactional information shared with a broker-dealer
												is subject to the broker-dealer&apos;s own privacy and
												data handling policies.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">
													Third-Party Services:
												</span>{" "}
												The Service may link to or integrate with third-party
												websites, products, or services. You acknowledge that
												Commertize does not endorse nor assume responsibility
												for any third-party content or practices.
											</p>
										</div>
									</div>

									<h2
										id="security"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										7. Confidentiality and Security
									</h2>
									<div className="space-y-4 mb-8">
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">
													Security Measures:
												</span>{" "}
												Commertize employs physical, administrative, and
												technological safeguards to protect your data. However,
												no system is completely secure, and Commertize cannot
												guarantee the absolute security of its systems.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">
													Children&apos;s Privacy:
												</span>{" "}
												The Service is not intended for use by individuals under
												16 years of age. If you believe we have inadvertently
												collected information from someone under 16, please
												contact privacy@commertize.io, and we will take prompt
												action to delete it.
											</p>
										</div>
									</div>

									<h2
										id="disclaimers"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										8. Disclaimers and Limitation of Liability
									</h2>
									<div className="bg-amber-50 rounded-xl p-6 border border-[#D4A024]/30 mb-8">
										<p className="text-gray-700 mb-4 uppercase text-sm">
											Disclaimer of Warranties: THE SERVICE IS PROVIDED &quot;AS
											IS&quot; AND &quot;AS AVAILABLE.&quot; COMMERTIZE
											DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING
											ANY IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A
											PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
										</p>
										<p className="text-gray-700 mb-4 uppercase text-sm">
											No Guarantee: COMMERTIZE MAKES NO GUARANTEES THAT THE
											SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR
											THAT ANY CONTENT WILL BE ACCURATE OR RELIABLE.
										</p>
										<p className="text-gray-700 mb-4 text-sm">
											Investment Risks: Any investment or financial opportunity
											listed or referenced on the Service carries inherent
											risks. Commertize is not responsible for any losses or
											damages incurred as a result of your investment decisions.
										</p>
										<p className="text-gray-700 uppercase text-sm">
											Limitation of Liability: TO THE MAXIMUM EXTENT PERMITTED
											BY LAW, COMMERTIZE AND ITS AFFILIATES, DIRECTORS,
											OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
											DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
											PUNITIVE DAMAGES, OR ANY OTHER DAMAGES OF ANY KIND,
											ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE,
											WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER
											LEGAL THEORY.
										</p>
									</div>

									<h2
										id="indemnity"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										9. Indemnification
									</h2>
									<p className="text-gray-600 font-light mb-4">
										You agree to defend, indemnify, and hold harmless Commertize
										and its affiliates, officers, directors, employees, and
										agents from and against any and all claims, damages,
										obligations, losses, liabilities, costs, or debt, and
										expenses (including attorneys&apos; fees) arising out of or
										related to:
									</p>
									<ul className="space-y-2 mb-8">
										<li className="flex gap-3 text-gray-600 font-light">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											Your use of or access to the Service
										</li>
										<li className="flex gap-3 text-gray-600 font-light">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											Your violation of any term in these Terms
										</li>
										<li className="flex gap-3 text-gray-600 font-light">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											Your violation of any third-party right, including
											intellectual property or privacy rights
										</li>
									</ul>

									<h2
										id="disputes"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										10. Governing Law and Dispute Resolution
									</h2>
									<div className="space-y-4 mb-8">
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Governing Law:</span>{" "}
												These Terms are governed by and construed in accordance
												with the laws of the State of Texas, without regard to
												its conflict of law principles.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Arbitration:</span> Any
												dispute or claim arising out of or in connection with
												these Terms shall be resolved by final and binding
												arbitration administered by a recognized arbitration
												center in Houston, Texas, unless otherwise mutually
												agreed upon in writing by both parties.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">
													Injunctive Relief:
												</span>{" "}
												Nothing in this section prevents either party from
												seeking injunctive or other equitable relief from a
												court of competent jurisdiction to prevent or curtail a
												breach of these Terms.
											</p>
										</div>
									</div>

									<h2
										id="misc"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										11. Miscellaneous
									</h2>
									<div className="space-y-4 mb-8">
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Entire Agreement:</span>{" "}
												These Terms, along with any other agreements or policies
												referenced herein, constitute the entire agreement
												between you and Commertize regarding your use of the
												Service.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Severability:</span> If
												any portion of these Terms is held to be invalid, the
												remaining provisions shall remain in full force.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">Assignment:</span> You
												may not assign or transfer your rights or obligations
												under these Terms without Commertize&apos;s prior
												written consent.
											</p>
										</div>
										<div className="flex gap-3">
											<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
											<p className="text-gray-600 font-light">
												<span className="text-gray-800">No Waiver:</span>{" "}
												Commertize&apos;s failure to enforce any provision of
												these Terms shall not be deemed a waiver of that
												provision.
											</p>
										</div>
									</div>

									<h2
										id="contact"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										12. How to Contact Us
									</h2>
									<p className="text-gray-600 font-light mb-4">
										If you have any questions about these Terms or our data
										practices, please contact us at:
									</p>
									<div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
										<p className="text-gray-800">Commertize, Inc.</p>
										<p className="text-gray-600 font-light">
											Attn: Legal – Terms of Service
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

									<h2
										id="changes"
										className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
									>
										13. Changes to These Terms
									</h2>
									<p className="text-gray-600 font-light mb-8">
										We may modify these Terms at any time. If we make material
										changes, we will notify you by updating the &quot;Effective
										Date&quot; above and posting the revised Terms on the
										Website. We may also provide another method of notification
										(e.g., email). Any modifications become effective upon
										posting (or as otherwise indicated), and your continued use
										of the Service signifies acceptance of the updated Terms.
									</p>
								</div>
							</div>

							<div className="mt-12 text-center">
								<div className="flex flex-wrap justify-center gap-4">
									<Link
										to="/privacy"
										className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A024] text-white rounded-xl hover:bg-[#B8860B] transition-colors"
									>
										Privacy Policy
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
