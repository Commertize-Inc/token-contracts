import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { SubNavbar, PageHeader } from "@commertize/ui";

export default function DisclaimerPage() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SEO
				title="Disclaimer"
				description="Important disclaimers regarding investment risks, forward-looking statements, and no legal advice."
			/>

			<main className="pt-32 pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col lg:flex-row gap-12 relative">
						{/* Left Sidebar */}
						<div className="hidden lg:block shrink-0 w-64">
							<SubNavbar
								items={[
									{ id: "risks", label: "1. Risks" },
									{ id: "advice", label: "2. No Advice" },
									{ id: "forward", label: "3. Outlook" },
									{ id: "third-party", label: "4. Third Party" },
									{ id: "returns", label: "5. Returns" },
									{ id: "regulatory", label: "6. Regulatory" },
									{ id: "blockchain", label: "7. Blockchain" },
									{ id: "liability", label: "8. Liability" },
									{ id: "changes", label: "9. Changes" },
									{ id: "contact", label: "10. Contact" },
								]}
								offset={100}
							/>
						</div>

						{/* Main Content */}
						<div className="flex-1 min-w-0">
							<PageHeader
								title="Disclaimer"
								subtitle="Last updated: July 23, 2025"
								className="mb-8"
							/>

							<div className="mx-auto">
								<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
									<div className="prose prose-gray max-w-none">
										<div className="bg-amber-50 rounded-xl p-6 border border-[#D4A024]/30 mb-10">
											<p className="text-gray-700 text-sm">
												Please read this disclaimer carefully before using any
												information or services provided by Commertize, Inc.
												This disclaimer governs your use of our website,
												platform, and all related services.
											</p>
										</div>

										<h2
											id="risks"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Investment Risks
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Investing in commercial real estate involves substantial
												risks, including illiquidity, market volatility, and
												potential loss of principal. Investment values can
												fluctuate significantly, and investors may lose their
												entire investment. Carefully consider your financial
												situation and risk tolerance before investing.
											</p>
										</div>

										<h2
											id="advice"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											No Investment Advice & User Responsibility
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Commertize does not provide investment, legal,
												financial, or tax advice. All information on our
												platform is for informational purposes only. Users are
												solely responsible for conducting their own thorough due
												diligence and should consult qualified professionals
												before making investment decisions.
											</p>
										</div>

										<h2
											id="forward"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Forward-Looking Statements
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Any projections, estimates, or forward-looking
												statements provided are based on current expectations
												and assumptions which may prove incorrect or imprecise.
												Actual outcomes may differ significantly from
												expectations.
											</p>
										</div>

										<h2
											id="third-party"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Third-Party Information & Links
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Commertize accepts no responsibility or liability
												concerning content, accuracy, or security of third-party
												websites, services, or information linked from our
												platform. Users access third-party content at their own
												risk.
											</p>
										</div>

										<h2
											id="returns"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											No Guarantee of Returns
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Past performance is not indicative of future results.
												There is no guarantee that any investment will achieve
												its objectives, generate positive returns, or avoid
												losses. Any historical returns, expected returns, or
												probability projections are for illustrative purposes
												only.
											</p>
										</div>

										<h2
											id="regulatory"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Regulatory Compliance
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Investments offered through Commertize may be subject to
												securities regulations and are available only to
												eligible investors as defined by applicable laws. It is
												the responsibility of each investor to ensure compliance
												with their local jurisdiction&apos;s laws and
												regulations.
											</p>
										</div>

										<h2
											id="blockchain"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Blockchain & Technology Risks
										</h2>
										<div className="pl-6">
											<div className="space-y-4 mb-8">
												<div className="flex gap-3">
													<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
													<p className="text-gray-600 font-light">
														Tokenized assets are subject to blockchain
														technology risks, including but not limited to smart
														contract vulnerabilities, network congestion, and
														regulatory changes.
													</p>
												</div>
												<div className="flex gap-3">
													<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
													<p className="text-gray-600 font-light">
														Digital assets and tokens may be subject to high
														volatility and may not be suitable for all
														investors.
													</p>
												</div>
												<div className="flex gap-3">
													<div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
													<p className="text-gray-600 font-light">
														The regulatory landscape for tokenized securities
														continues to evolve, which may impact the value,
														transferability, or legality of tokens in certain
														jurisdictions.
													</p>
												</div>
											</div>
										</div>

										<h2
											id="liability"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Limitation of Liability
										</h2>
										<div className="pl-6">
											<div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
												<p className="text-gray-600 font-light">
													TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMMERTIZE,
													INC., ITS AFFILIATES, DIRECTORS, OFFICERS,
													EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE
													FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
													OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
													REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY,
													OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER
													INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR
													USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
												</p>
											</div>
										</div>

										<h2
											id="changes"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Changes to This Disclaimer
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-8">
												Commertize reserves the right to modify this disclaimer
												at any time. Changes will be effective immediately upon
												posting on our website. Your continued use of our
												services constitutes acceptance of any modifications.
											</p>
										</div>

										<h2
											id="contact"
											className="text-2xl text-[#D4A024] mt-10 mb-6 px-4 pt-20 -mt-20"
										>
											Contact Information
										</h2>
										<div className="pl-6">
											<p className="text-gray-600 font-light mb-4">
												For questions regarding this Disclaimer, please contact
												us at:
											</p>
											<div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
												<p className="text-gray-800">Commertize, Inc.</p>
												<p className="text-gray-600 font-light">
													Attn: Legal – Disclaimer
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
										to="/terms"
										className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
									>
										Terms of Service
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
