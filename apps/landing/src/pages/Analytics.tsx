import { Link } from "react-router-dom";
import {
	BarChart3,
	TrendingUp,
	Building2,
	Users,
	DollarSign,
	PieChart,
	Globe,
	Activity,
	Coins,
	Bell,
	ArrowRight,
} from "lucide-react";
import SEO from "../components/SEO";
import { PageHeader } from "@commertize/ui";

const upcomingFeatures = [
	{
		icon: DollarSign,
		title: "Market Overview",
		description:
			"Track total market capitalization, trading volumes, and market trends in real-time.",
	},
	{
		icon: Building2,
		title: "Property Analytics",
		description:
			"Monitor tokenized listings, performance metrics, and asset class distributions.",
	},
	{
		icon: TrendingUp,
		title: "Performance Tracking",
		description:
			"View top performers, yield comparisons, and historical price movements.",
	},
	{
		icon: Globe,
		title: "Geographic Insights",
		description:
			"Explore property distributions across regions and emerging market opportunities.",
	},
	{
		icon: Activity,
		title: "Live Transactions",
		description:
			"Follow real-time trading activity with detailed transaction history.",
	},
	{
		icon: PieChart,
		title: "Portfolio Analytics",
		description:
			"Analyze your investment portfolio with comprehensive breakdowns and projections.",
	},
];

export default function MarketAnalytics() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
			<SEO
				title="Market Analytics"
				description="Comprehensive analytics and insights into the tokenized real estate market. Track performance, discover trends, and make informed investment decisions."
			/>

			<main className="pb-16">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					{/* Header */}
					{/* Header */}
					<div className="mb-16">
						<PageHeader
							breadcrumbs={
								<div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#DDB35F] to-[#B8860B] mb-4 shadow-lg shadow-[#DDB35F]/20">
									<BarChart3 className="w-6 h-6 text-white" />
								</div>
							}
							title="Market Analytics"
							subtitle={
								<>
									<span className="block text-xl text-gray-500 mb-2">
										Real Estate Tokenization Intelligence
									</span>
									<span className="block text-gray-600 text-base max-w-2xl">
										Comprehensive analytics and insights into the tokenized real
										estate market. Track performance, discover trends, and make
										informed investment decisions.
									</span>
								</>
							}
						/>
					</div>

					{/* Coming Soon Banner */}
					<div className="bg-gradient-to-r from-[#DDB35F]/10 to-[#E6BE8A]/10 rounded-3xl p-8 md:p-12 border border-[#DDB35F]/20 mb-16">
						<div className="flex flex-col md:flex-row items-center gap-8">
							<div className="flex-1 text-center md:text-left">
								<div className="inline-flex items-center gap-2 bg-[#DDB35F]/20 text-[#B8860B] px-4 py-2 rounded-full text-sm mb-4">
									<Bell className="w-4 h-4" />
									Coming Soon
								</div>
								<h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
									Analytics Dashboard Launching Soon
								</h2>
								<p className="text-gray-600 mb-6">
									We&apos;re building powerful analytics tools to help you
									navigate the tokenized real estate market. Join our waitlist
									to be notified when we launch and get early access to market
									insights.
								</p>
								<Link
									to="/waitlist"
									className="inline-flex items-center gap-2 bg-[#DDB35F] hover:bg-[#B8860B] text-white px-6 py-3 rounded-xl transition-colors"
								>
									Join Waitlist
									<ArrowRight className="w-4 h-4" />
								</Link>
							</div>
							<div className="flex-shrink-0">
								<div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl bg-white/50 border border-[#DDB35F]/20 flex items-center justify-center">
									<div className="text-center">
										<div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-[#FDF8F3] flex items-center justify-center">
											<BarChart3 className="w-8 h-8 text-[#DDB35F]" />
										</div>
										<div className="text-sm text-gray-500">Analytics</div>
										<div className="text-xs text-gray-400">In Development</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Upcoming Features */}
					<div className="mb-16">
						<div className="text-center mb-10">
							<h3 className="text-2xl font-light text-gray-900 mb-2">
								What to Expect
							</h3>
							<p className="text-gray-500">
								Powerful tools to analyze the tokenized real estate market
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{upcomingFeatures.map((feature, index) => (
								<div
									key={index}
									className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#DDB35F]/30 hover:shadow-md transition-all group"
								>
									<div className="w-12 h-12 rounded-xl bg-[#FDF8F3] group-hover:bg-[#DDB35F]/20 flex items-center justify-center mb-4 transition-colors">
										<feature.icon className="w-6 h-6 text-[#DDB35F]" />
									</div>
									<h4 className="text-lg text-gray-900 mb-2">
										{feature.title}
									</h4>
									<p className="text-sm text-gray-500">{feature.description}</p>
								</div>
							))}
						</div>
					</div>

					{/* Placeholder Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
						{[
							{ icon: DollarSign, label: "Total Market Cap" },
							{ icon: Building2, label: "listings Tokenized" },
							{ icon: Users, label: "Active Investors" },
							{ icon: Activity, label: "Trading Volume" },
						].map((item, index) => (
							<div
								key={index}
								className="bg-white rounded-2xl p-6 border border-gray-100"
							>
								<div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
									<item.icon className="w-5 h-5 text-gray-400" />
								</div>
								<div className="h-8 w-24 bg-gray-100 rounded-lg mb-2 animate-pulse" />
								<div className="text-sm text-gray-400">{item.label}</div>
							</div>
						))}
					</div>

					{/* Chart Placeholders */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
						<div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
							<div className="flex items-center justify-between mb-6">
								<div>
									<div className="h-5 w-40 bg-gray-100 rounded mb-2" />
									<div className="h-4 w-56 bg-gray-50 rounded" />
								</div>
								<div className="flex gap-2">
									{["1M", "3M", "6M", "1Y"].map((tf) => (
										<div key={tf} className="w-10 h-8 bg-gray-100 rounded-lg" />
									))}
								</div>
							</div>
							<div className="h-64 flex items-end justify-between gap-2 px-4">
								{[80, 100, 60, 120, 90, 140, 110, 130, 70, 150, 95, 160].map(
									(height, i) => (
										<div
											key={i}
											className="flex-1 flex flex-col items-center gap-2"
										>
											<div
												className="w-full bg-gray-100 rounded-t-lg animate-pulse"
												style={{
													height: `${height}px`,
													animationDelay: `${i * 100}ms`,
												}}
											/>
											<div className="w-6 h-3 bg-gray-100 rounded" />
										</div>
									)
								)}
							</div>
						</div>

						<div className="bg-white rounded-2xl p-6 border border-gray-100">
							<div className="flex items-center gap-2 mb-6">
								<PieChart className="w-5 h-5 text-gray-300" />
								<div className="h-5 w-32 bg-gray-100 rounded" />
							</div>
							<div className="w-40 h-40 mx-auto mb-6 rounded-full border-[20px] border-gray-100" />
							<div className="space-y-3">
								{Array.from({ length: 4 }).map((_, i) => (
									<div key={i} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 rounded-full bg-gray-200" />
											<div className="w-24 h-4 bg-gray-100 rounded" />
										</div>
										<div className="w-8 h-4 bg-gray-100 rounded" />
									</div>
								))}
							</div>
						</div>
					</div>

					{/* CTA */}
					<div className="text-center bg-[#FDF8F3] rounded-2xl p-8 md:p-12">
						<Coins className="w-12 h-12 text-[#DDB35F] mx-auto mb-4" />
						<h3 className="text-2xl font-light text-gray-900 mb-3">
							Be the First to Know
						</h3>
						<p className="text-gray-600 mb-6 max-w-lg mx-auto">
							Get notified when our analytics platform goes live and receive
							exclusive early access to market insights.
						</p>
						<Link
							to="/waitlist"
							className="inline-flex items-center gap-2 bg-[#DDB35F] hover:bg-[#B8860B] text-white px-8 py-3 rounded-xl transition-colors"
						>
							Join the Waitlist
							<ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
