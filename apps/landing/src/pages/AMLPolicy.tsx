import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

export default function AMLPolicyPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SEO
				title="AML Policy"
				description="Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) policy and compliance procedures."
			/>

			<main className="pt-32 pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center max-w-3xl mx-auto mb-16">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A024]/10 rounded-full mb-6 border-2 border-[#D4A024]/30">
							<ShieldCheck className="w-8 h-8 text-[#D4A024]" />
						</div>
						<h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
							AML Policy
						</h1>
						<p className="text-gray-500 font-light">
							Anti-Money Laundering Compliance
						</p>
						<p className="text-gray-400 font-light text-sm mt-2">
							Last updated: July 23, 2025
						</p>
					</div>

					<div className="max-w-4xl mx-auto">
						<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
							<div className="prose prose-gray max-w-none">
								<p className="text-gray-600 font-light leading-relaxed mb-8">
									Commertize, Inc. (&quot;Commertize,&quot; &quot;we,&quot;
									&quot;us,&quot; or &quot;our&quot;) is committed to the
									highest standards of Anti-Money Laundering (AML) and
									Counter-Terrorism Financing (CTF) compliance. This AML Policy
									outlines our commitment to preventing the use of our platform
									for money laundering, terrorist financing, or other financial
									crimes.
								</p>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									1. Policy Statement
								</h2>
								<p className="text-gray-600 font-light mb-8">
									Commertize maintains a zero-tolerance policy towards money
									laundering and terrorist financing. We are committed to
									complying with all applicable AML laws and regulations,
									including the Bank Secrecy Act (BSA), the USA PATRIOT Act,
									Financial Crimes Enforcement Network (FinCEN) regulations, and
									other relevant federal and state laws. Our platform is
									designed to detect, prevent, and report suspicious activities
									to the appropriate authorities.
								</p>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									2. Regulatory Framework
								</h2>
								<p className="text-gray-600 font-light mb-4">
									Our AML program is designed to comply with:
								</p>
								<ul className="space-y-2 mb-8">
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Bank Secrecy Act (BSA) of 1970
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										USA PATRIOT Act of 2001
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										FinCEN Customer Due Diligence (CDD) Rule
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Office of Foreign Assets Control (OFAC) Sanctions Programs
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Securities and Exchange Commission (SEC) regulations
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Financial Action Task Force (FATF) Recommendations
									</li>
								</ul>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									3. AML Program Components
								</h2>
								<p className="text-gray-600 font-light mb-4">
									Our AML compliance program includes the following key
									components:
								</p>

								<div className="space-y-4 mb-8">
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">
											Designation of AML Compliance Officer
										</p>
										<p className="text-gray-600 font-light text-sm">
											A qualified individual responsible for overseeing the AML
											program, ensuring compliance, and serving as the primary
											point of contact for regulatory inquiries.
										</p>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">
											Written Policies and Procedures
										</p>
										<p className="text-gray-600 font-light text-sm">
											Comprehensive internal policies and procedures designed to
											detect and prevent money laundering and terrorist
											financing activities.
										</p>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">
											Customer Due Diligence (CDD)
										</p>
										<p className="text-gray-600 font-light text-sm">
											Risk-based procedures for verifying customer identity,
											understanding the nature of customer relationships, and
											conducting ongoing monitoring.
										</p>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">Employee Training</p>
										<p className="text-gray-600 font-light text-sm">
											Regular training programs for all employees on AML
											requirements, red flags, and reporting obligations.
										</p>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">Independent Audit</p>
										<p className="text-gray-600 font-light text-sm">
											Periodic independent testing of our AML program to ensure
											its effectiveness and identify areas for improvement.
										</p>
									</div>
								</div>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									4. Customer Identification Program (CIP)
								</h2>
								<p className="text-gray-600 font-light mb-4">
									Before establishing a business relationship, we verify the
									identity of all customers through our Customer Identification
									Program, which includes:
								</p>
								<ul className="space-y-2 mb-8">
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Collection of identifying information (name, date of birth,
										address, identification number)
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Verification of identity through documentary or
										non-documentary methods
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Screening against government watchlists and sanctions
										databases
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Retention of identification records for the required period
									</li>
								</ul>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									5. Enhanced Due Diligence (EDD)
								</h2>
								<p className="text-gray-600 font-light mb-4">
									We apply enhanced due diligence measures to higher-risk
									customers, including:
								</p>
								<ul className="space-y-2 mb-8">
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Politically Exposed Persons (PEPs) and their family members
										or close associates
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Customers from high-risk jurisdictions
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Complex ownership structures or unusual business
										arrangements
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Customers with negative news or adverse media coverage
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Unusual or suspicious transaction patterns
									</li>
								</ul>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									6. Transaction Monitoring
								</h2>
								<p className="text-gray-600 font-light mb-4">
									We employ sophisticated transaction monitoring systems to
									detect suspicious activities, including:
								</p>
								<div className="space-y-4 mb-8">
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">Automated Monitoring</p>
										<p className="text-gray-600 font-light text-sm">
											Real-time and batch monitoring systems that flag unusual
											transaction patterns, velocity, and amounts.
										</p>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">Risk-Based Thresholds</p>
										<p className="text-gray-600 font-light text-sm">
											Customized thresholds based on customer risk profiles and
											expected transaction behavior.
										</p>
									</div>
									<div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
										<p className="text-gray-800 mb-1">Alert Investigation</p>
										<p className="text-gray-600 font-light text-sm">
											Trained compliance staff review and investigate flagged
											transactions to determine if suspicious activity reporting
											is required.
										</p>
									</div>
								</div>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									7. Suspicious Activity Reporting
								</h2>
								<p className="text-gray-600 font-light mb-8">
									When we detect activity that we know, suspect, or have reason
									to suspect involves funds derived from illegal activity, is
									designed to evade reporting requirements, lacks a lawful
									purpose, or involves the use of our platform to facilitate
									criminal activity, we will file a Suspicious Activity Report
									(SAR) with FinCEN within the required timeframe. We maintain
									strict confidentiality regarding SAR filings and do not
									disclose the existence of such reports to the subjects of the
									reports.
								</p>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									8. Sanctions Compliance
								</h2>
								<p className="text-gray-600 font-light mb-4">
									We maintain a comprehensive sanctions compliance program that
									includes:
								</p>
								<ul className="space-y-2 mb-8">
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Screening all customers against OFAC&apos;s Specially
										Designated Nationals (SDN) List
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Screening against other relevant sanctions lists (UN, EU,
										UK, etc.)
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Blocking transactions involving sanctioned parties or
										jurisdictions
									</li>
									<li className="flex gap-3 text-gray-600 font-light">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										Ongoing monitoring for changes to sanctions designations
									</li>
								</ul>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									9. Recordkeeping
								</h2>
								<p className="text-gray-600 font-light mb-8">
									We maintain comprehensive records of all customer
									identification information, transaction records, and
									AML-related documentation for a minimum of five years, or
									longer if required by applicable law. Records are maintained
									in a manner that allows for timely retrieval in response to
									regulatory inquiries or legal requests.
								</p>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									10. Red Flags
								</h2>
								<p className="text-gray-600 font-light mb-4">
									Our staff is trained to recognize potential red flags,
									including but not limited to:
								</p>
								<div className="space-y-4 mb-8">
									<div className="flex gap-3">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										<p className="text-gray-600 font-light">
											Reluctance to provide complete identification information
										</p>
									</div>
									<div className="flex gap-3">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										<p className="text-gray-600 font-light">
											Providing false, misleading, or substantially incorrect
											information
										</p>
									</div>
									<div className="flex gap-3">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										<p className="text-gray-600 font-light">
											Unusual transaction patterns inconsistent with stated
											purpose
										</p>
									</div>
									<div className="flex gap-3">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										<p className="text-gray-600 font-light">
											Transactions with no apparent economic or lawful purpose
										</p>
									</div>
									<div className="flex gap-3">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										<p className="text-gray-600 font-light">
											Structuring transactions to avoid reporting thresholds
										</p>
									</div>
									<div className="flex gap-3">
										<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
										<p className="text-gray-600 font-light">
											Connections to high-risk jurisdictions or sanctioned
											countries
										</p>
									</div>
								</div>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									11. Cooperation with Law Enforcement
								</h2>
								<p className="text-gray-600 font-light mb-8">
									We cooperate fully with law enforcement agencies and
									regulatory authorities in their efforts to combat money
									laundering and terrorist financing. This includes responding
									to subpoenas, court orders, and other lawful requests for
									information in a timely manner.
								</p>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									12. Policy Updates
								</h2>
								<p className="text-gray-600 font-light mb-8">
									This AML Policy is reviewed and updated periodically to
									reflect changes in regulatory requirements, industry best
									practices, and our business operations. Material updates will
									be communicated through our website.
								</p>

								<h2 className="text-2xl text-[#D4A024] mt-10 mb-6">
									13. Contact Us
								</h2>
								<p className="text-gray-600 font-light mb-4">
									For questions about our AML program or to report suspicious
									activity, please contact us at:
								</p>
								<div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
									<p className="text-gray-800">Commertize, Inc.</p>
									<p className="text-gray-600 font-light">
										Attn: AML Compliance Officer
									</p>
									<p className="text-gray-600 font-light">
										20250 SW Acacia St. #130
									</p>
									<p className="text-gray-600 font-light">
										Newport Beach, California 92660
									</p>
									<p className="text-gray-600 font-light mt-2">
										Email: compliance@commertize.com
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-12 text-center">
						<div className="flex flex-wrap justify-center gap-4">
							<Link
								to="/kyb-policy"
								className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A024] text-white rounded-xl hover:bg-[#B8860B] transition-colors"
							>
								KYB Policy
								<ArrowRight className="w-4 h-4" />
							</Link>
							<Link
								to="/privacy"
								className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
							>
								Privacy Policy
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
