import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

// Shared styles
const cardBase =
	"relative p-8 rounded-3xl h-full flex flex-col justify-start transition-all duration-300";
const listItem = "flex items-start gap-3 text-sm md:text-base font-light mb-4";

export default function ComparisonSection() {
	return (
		<section className="py-20 md:py-28 bg-[#FAFAF9] relative overflow-hidden">
			{/* Background decoration */}
			<div className="absolute inset-0 pointer-events-none opacity-30">
				<div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#D4A024]/5 rounded-full blur-3xl -translate-y-1/2" />
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center relative">
					{/* VS Badge - Absolute center on desktop, hidden or adjusted on mobile?
                        Let's keep it simple and clean. Using a flex overlay or just grid positioning.
                        For a true "VS" badge in the middle, we can use an absolute element on the container if relative.
                    */}
					<div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white rounded-full shadow-lg items-center justify-center border border-gray-100 ring-4 ring-[#FAFAF9]">
						<span className="text-[#D4A024] font-serif font-bold text-xl italic">
							VS
						</span>
					</div>

					{/* Traditional CRE Card */}
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className={`${cardBase} bg-white border border-gray-200 shadow-sm`}
					>
						<div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
							<BuildingIcon className="w-6 h-6 text-gray-400" />
						</div>
						<h3 className="text-xl md:text-2xl font-light text-gray-900 mb-2">
							Traditional CRE
						</h3>
						<p className="text-gray-400 text-sm mb-8 font-light">
							Legacy Approach
						</p>

						<ul className="space-y-2">
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
									<X className="w-3 h-3 text-red-500" />
								</div>
								<span className="text-gray-500">$1M+ minimum Investment</span>
							</li>
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
									<X className="w-3 h-3 text-red-500" />
								</div>
								<span className="text-gray-500">7-10 year lockup periods</span>
							</li>
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
									<X className="w-3 h-3 text-red-500" />
								</div>
								<span className="text-gray-500">Limited to local markets</span>
							</li>
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
									<X className="w-3 h-3 text-red-500" />
								</div>
								<span className="text-gray-500">Complex paperwork</span>
							</li>
						</ul>
					</motion.div>

					{/* Commertize Card */}
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className={`${cardBase} bg-gradient-to-b from-[#FFFDF5] to-white border border-[#D4A024]/20 shadow-xl shadow-[#D4A024]/5`}
					>
						<div className="w-12 h-12 bg-[#D4A024]/10 rounded-xl flex items-center justify-center mb-6">
							<LogoIcon className="w-6 h-6 text-[#D4A024]" />
						</div>
						<h3 className="text-xl md:text-2xl font-normal text-gray-900 mb-2">
							Commertize
						</h3>
						<p className="text-[#D4A024] text-sm mb-8 font-medium">
							The Future of CRE
						</p>

						<ul className="space-y-2">
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-[#D4A024]/10 flex items-center justify-center flex-shrink-0">
									<Check className="w-3 h-3 text-[#D4A024]" />
								</div>
								<span className="text-gray-800 font-medium">
									$1K minimum investment
								</span>
							</li>
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-[#D4A024]/10 flex items-center justify-center flex-shrink-0">
									<Check className="w-3 h-3 text-[#D4A024]" />
								</div>
								<span className="text-gray-800 font-medium">
									Liquid secondary market
								</span>
							</li>
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-[#D4A024]/10 flex items-center justify-center flex-shrink-0">
									<Check className="w-3 h-3 text-[#D4A024]" />
								</div>
								<span className="text-gray-800 font-medium">
									Global property access
								</span>
							</li>
							<li className={listItem}>
								<div className="mt-1 w-5 h-5 rounded-full bg-[#D4A024]/10 flex items-center justify-center flex-shrink-0">
									<Check className="w-3 h-3 text-[#D4A024]" />
								</div>
								<span className="text-gray-800 font-medium">
									Streamlined digital process
								</span>
							</li>
						</ul>
					</motion.div>
				</div>

				{/* Mobile VS Badge (visible only on small screens) */}
				<div className="md:hidden flex justify-center -my-4 relative z-20">
					<div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
						<span className="text-[#D4A024] font-serif font-bold text-lg italic">
							VS
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function BuildingIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
			<path d="M9 22v-4h6v4" />
			<path d="M8 6h.01" />
			<path d="M16 6h.01" />
			<path d="M8 10h.01" />
			<path d="M16 10h.01" />
			<path d="M8 14h.01" />
			<path d="M16 14h.01" />
		</svg>
	);
}

function LogoIcon({ className }: { className?: string }) {
	// Simple placeholder for logo icon if not available
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
		>
			<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
		</svg>
	);
}
