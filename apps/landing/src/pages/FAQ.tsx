import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";

const faqData = [
	{
		category: "About Commertize",
		items: [
			{
				q: "What is Commertize?",
				a: "Commertize is a digital platform that tokenizes commercial real estate (CRE), enabling fractional ownership and global investor access through blockchain technology.",
			},
			{
				q: "How does Commertize differ from traditional CRE investment?",
				a: "We remove high investment minimums, speed up capital access for property owners, and provide blockchain-secured transparency — all while keeping investments accessible to accredited investors worldwide.",
			},
			{
				q: "What types of listings does Commertize work with?",
				a: "We focus on premium and full-spectrum commercial real estate, including multifamily, office, retail, industrial, hospitality, and mixed-use listings.",
			},
		],
	},
	{
		category: "For Investors",
		items: [
			{
				q: "Who can invest through Commertize?",
				a: "Currently, investments are open to accredited investors, in compliance with U.S. securities regulations.",
			},
			{
				q: "What is fractional ownership?",
				a: "Fractional ownership allows you to purchase a share of a property rather than the entire asset, giving you access to premium real estate at a lower entry cost.",
			},
			{
				q: "What is the minimum investment amount?",
				a: "The minimum investment on Commertize is $1,000, making premium commercial real estate accessible to a much broader range of investors compared to traditional CRE deals that typically require $100,000+.",
			},
			{
				q: "Can I sell my tokens?",
				a: "Yes — depending on regulatory guidelines and platform availability, tokens can be sold on secondary marketplaces or back to eligible buyers through Commertize's exchange network.",
			},
		],
	},
	{
		category: "Fees & Costs",
		items: [
			{
				q: "What fees do investors pay?",
				a: "Investor fee structure: (1) Investment Fee - 0% on primary market purchases, (2) Management Fee - 0.5-1% annually (property-specific), (3) Secondary Market - 2% transaction fee on sales, (4) Withdrawal Fee - 1% on USD withdrawals. All fees are clearly disclosed before investment.",
			},
			{
				q: "Are there any hidden fees?",
				a: "No hidden fees. All costs are disclosed upfront in the Private Placement Memorandum (PPM) for each property.",
			},
		],
	},
	{
		category: "Technology & Security",
		items: [
			{
				q: "How does blockchain improve security?",
				a: "Blockchain creates an immutable record of ownership and transactions, ensuring transparency and reducing fraud risk.",
			},
			{
				q: "What role does AI play in Commertize?",
				a: "Our AI-driven tools provide property analytics, investment insights, and predictive performance models to help investors make informed decisions.",
			},
		],
	},
	{
		category: "Compliance & Regulation",
		items: [
			{
				q: "Is tokenized real estate legal?",
				a: "Yes — Commertize operates under existing securities and real estate regulations, using compliant structures such as Reg D 506(c) offerings for accredited investors.",
			},
			{
				q: "Do I need to be U.S.-based to invest?",
				a: "No — international accredited investors are welcome, subject to their local regulations.",
			},
		],
	},
];

export default function FAQ() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SEO
				title="Frequently Asked Questions"
				description="Common questions about investing in tokenized real estate, fractional ownership, fees, and security on the Commertize platform."
			/>

			<main className="pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="text-center max-w-3xl mx-auto mb-16">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A024]/10 rounded-full mb-6 border-2 border-[#D4A024]/30">
							<HelpCircle className="w-8 h-8 text-[#D4A024]" />
						</div>
						<h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
							Frequently Asked Questions
						</h1>
						<p className="text-gray-600 font-light">
							Everything you need to know about tokenized commercial real estate
							investing
						</p>
					</div>

					{/* FAQ Categories */}
					<div className="max-w-4xl mx-auto space-y-8">
						{faqData.map((section, sectionIndex) => (
							<div key={sectionIndex}>
								<div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30">
									<div className="px-6 py-5 flex items-center gap-3">
										<div className="w-10 h-10 bg-[#D4A024]/10 rounded-full flex items-center justify-center border border-[#D4A024]/20">
											<HelpCircle className="w-5 h-5 text-[#D4A024]" />
										</div>
										<h2 className="text-xl text-gray-900">
											{section.category}
										</h2>
									</div>
									<div className="border-t border-gray-100">
										{section.items.map((item, itemIndex) => (
											<details
												key={itemIndex}
												className="group border-b border-gray-100 last:border-b-0"
											>
												<summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors list-none">
													<span className="text-gray-800 pr-4">{item.q}</span>
													<ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180 flex-shrink-0" />
												</summary>
												<div className="px-6 pb-5 text-gray-600 font-light leading-relaxed">
													{item.a}
												</div>
											</details>
										))}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Contact CTA */}
					<div className="mt-16 text-center">
						<p className="text-gray-600 font-light mb-4">
							Still have questions?
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<a
								href="mailto:support@commertize.com"
								className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A024] text-white rounded-xl hover:bg-[#B8860B] transition-colors"
							>
								Contact Support
								<ArrowRight className="w-4 h-4" />
							</a>
							<Link
								to="/waitlist"
								className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
							>
								Join Waitlist
								<ArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
