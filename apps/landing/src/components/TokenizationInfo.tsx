import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const tokenizationSections = [
	{
		title: "Real Estate Developers",
		description: "Tokenize Your Projects. Raise Capital Faster",
		details: [
			"Offer fractional ownership to reduce funding time",
			"Attract global investors with lower entry points",
			"Increase liquidity for illiquid or early-stage assets",
			"Monetize rental income or future developments",
		],
	},
	{
		title: "Real Estate Companies",
		description: "Expand Access. Go Digital",
		details: [
			"Lower the barrier for investors ($100-$1,000 instead of $100K+)",
			"Diversify portfolio with global tokenized assets",
			"Benefit from 24/7 trading, instant settlement & lower fees",
			"Access broader investor base through digital platforms",
		],
	},
	{
		title: "REITs & Real Estate Investment Funds",
		description: "Reach More Investors. Stay Flexible",
		details: [
			"Expand beyond institutional investors without going public",
			"Offer fractional shares with global accessibility",
			"Improve transparency with on-chain reporting",
			"Reduce operational costs through automation",
		],
	},
	{
		title: "Institutional Investors",
		description: "Access Premium CRE Without Full Property Acquisition",
		details: [
			"Pension funds, endowments, and insurance companies gain fractional exposure",
			"Lower capital commitments with diversified CRE portfolios",
			"Transparent, on-chain reporting for regulatory compliance",
			"Instant settlement and reduced counterparty risk",
		],
	},
	{
		title: "Accredited Retail Investors",
		description: "Access Institutional-Grade CRE with Low Minimums",
		details: [
			"Previously locked out of premium commercial real estate deals",
			"Access top-tier listings with $100-$1,000 minimums",
			"Portfolio diversification beyond stocks and bonds",
			"Passive income through automated rental distributions",
		],
	},
	{
		title: "Family Offices",
		description: "Multi-Generational Wealth Management Simplified",
		details: [
			"Easier estate planning and inheritance distribution through tokens",
			"Diversification across multiple listings with smaller capital per asset",
			"Simplified asset transfers between family members",
			"Preserve wealth across generations with digital ownership records",
		],
	},
	{
		title: "International Investors",
		description: "Global Access to U.S. Commercial Real Estate",
		details: [
			"Cross-border investment without traditional barriers",
			"No need for local banking relationships or complex wire transfers",
			"24/7 access to U.S. commercial real estate from anywhere",
			"Simplified compliance through blockchain verification",
		],
	},
	{
		title: "Real Estate Brokers & Agents",
		description: "New Revenue Streams Through Tokenization",
		details: [
			"Commission opportunities on fractional property sales",
			"Access to global buyer networks through digital platforms",
			"Modern tools for next-generation real estate transactions",
			"Expand client services with tokenized investment offerings",
		],
	},
	{
		title: "Financial Advisors & Wealth Managers",
		description: "Offer Clients a New Asset Class",
		details: [
			"Diversification strategies beyond traditional securities",
			"Easy portfolio rebalancing with liquid tokens",
			"Technology-enabled client reporting and transparency",
			"Access to institutional-grade real estate for all client types",
		],
	},
	{
		title: "Property & Asset Managers",
		description: "Streamlined Operations with Blockchain Technology",
		details: [
			"Automated yield distribution reduces operational overhead",
			"Real-time reporting for multiple stakeholders",
			"Transparent performance tracking and investor communications",
			"Simplified compliance and audit trails",
		],
	},
	{
		title: "High-Net-Worth Individuals",
		description: "Turn Private Assets Into Digital Investment Vehicles",
		details: [
			"Tokenize personal property or portfolios",
			"Sell fractional ownership while retaining control",
			"Create family trusts or inheritance flows via tokens",
			"Unlock capital without traditional sales processes",
		],
	},
	{
		title: "Commercial Tenants",
		description: "Invest in the listings You Occupy",
		details: [
			"Build equity while paying rent",
			"Aligned interests with property owners",
			"Long-term stability and lease renewal incentives",
			"Potential appreciation alongside property value growth",
		],
	},
];

const TokenizationInfo = () => {
	const [expandedSections, setExpandedSections] = useState<Set<number>>(
		new Set()
	);

	const toggleSection = (index: number) => {
		const newExpanded = new Set(expandedSections);
		if (newExpanded.has(index)) {
			newExpanded.delete(index);
		} else {
			newExpanded.add(index);
		}
		setExpandedSections(newExpanded);
	};

	return (
		<section className="py-20 relative overflow-hidden bg-gray-50">
			<div className="container mx-auto px-4 relative z-10">
				<div className="max-w-7xl mx-auto">
					<motion.h2
						className="text-center text-3xl md:text-4xl font-light text-gray-900 mb-4"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						From Concrete to Capital — Who Wins
					</motion.h2>
					<motion.p
						className="text-center text-gray-600 mb-12 text-lg font-light max-w-4xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.1 }}
					>
						From unlocking liquidity to global investor access, tokenization
						changes the game for everyone in CRE.
					</motion.p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
						{tokenizationSections.map((section, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.7, delay: index * 0.05 }}
							>
								<div className="bg-white border-2 border-[#D4A024] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
									<div className="p-6 pb-4">
										<div
											className="flex items-center justify-between cursor-pointer"
											onClick={() => toggleSection(index)}
										>
											<div className="flex-1">
												<h3 className="text-lg text-[#D4A024] mb-2 font-light">
													{section.title}
												</h3>
												<p className="text-sm text-gray-700 font-light">
													{section.description}
												</p>
											</div>
											<motion.div
												className="ml-4 text-[#D4A024]"
												animate={{
													rotate: expandedSections.has(index) ? 0 : -90,
												}}
												transition={{ duration: 0.3 }}
											>
												<ChevronDown className="h-5 w-5" />
											</motion.div>
										</div>
									</div>

									<AnimatePresence>
										{expandedSections.has(index) && (
											<motion.div
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.4 }}
												style={{ overflow: "hidden" }}
											>
												<div className="px-6 pb-6 pt-0">
													<div className="border-t border-gray-200 pt-4">
														<ul className="space-y-2.5">
															{section.details.map((detail, i) => (
																<motion.li
																	key={i}
																	initial={{ x: -20, opacity: 0 }}
																	animate={{ x: 0, opacity: 1 }}
																	transition={{ delay: i * 0.1 }}
																	className="flex items-start"
																>
																	<div className="w-2 h-2 bg-[#D4A024] rounded-full mt-2 mr-3" />
																	<span className="text-gray-700 text-sm">
																		{detail}
																	</span>
																</motion.li>
															))}
														</ul>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default TokenizationInfo;
