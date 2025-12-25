import { motion } from "framer-motion";
import { Link2, ArrowLeftRight, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { BentoBox } from "@commertize/ui";

const WhyCommertize = () => {
	const features = [
		{
			icon: Link2,
			title: "Blockchain Transparency",
			description:
				"Every transaction is recorded on-chain, ensuring immutable ownership records and complete transparency. AI-powered insights provide real-time valuation and risk assessment.",
			highlight: "On-Chain Verified",
		},
		{
			icon: ArrowLeftRight,
			title: "Secondary Market Liquidity",
			description:
				"Exit your positions when you want. Trade fractional shares instantly on our regulated secondary market.",
			highlight: "Trade Anytime",
		},
		{
			icon: Users,
			title: "Fractional Ownership",
			description:
				"Access institutional-grade deals with lower minimums. Build a diversified portfolio across asset classes and geographies.",
			highlight: "Lower Minimums",
		},
	];

	return (
		<section className="relative py-20 md:py-28 overflow-hidden">
			<motion.div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat"
				style={{ backgroundImage: "url('/assets/why-commertize-bg.jpg')" }}
				initial={{ scale: 1 }}
				animate={{ scale: [1.0, 1.15] }}
				transition={{
					duration: 20,
					repeat: Infinity,
					ease: "easeInOut",
					repeatType: "reverse",
				}}
			/>
			<div className="absolute inset-0 bg-white/70" />
			<div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="text-center mb-16"
				>
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-4">
						Powered by <span className="text-[#D4A024]">Innovation</span>
					</h2>
					<p className="text-base md:text-lg font-light text-gray-600 max-w-2xl mx-auto">
						The future of real estate investing, powered by blockchain
						technology and institutional expertise.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-50px" }}
							transition={{
								duration: 0.6,
								delay: index * 0.15,
								ease: "easeOut",
							}}
							whileHover={{ y: -8, transition: { duration: 0.3 } }}
							className="relative group h-full flex flex-col justify-center"
						>
							<BentoBox
								footer={
									<Link
										to="/faq"
										className="flex items-center text-[#D4A024] text-sm font-light group-hover:translate-x-2 transition-transform duration-300"
									>
										Learn more
										<ArrowRight className="w-4 h-4 ml-2" />
									</Link>
								}
							>
								<div className="absolute top-0 right-0 -mt-2 -mr-2">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D4A024]/10 text-[#D4A024] border border-[#D4A024]/20">
										{feature.highlight}
									</span>
								</div>

								<div className="mb-6 mt-2">
									<div className="w-12 h-12 bg-[#D4A024]/10 rounded-xl flex items-center justify-center mb-6">
										<feature.icon className="w-6 h-6 text-[#D4A024]" />
									</div>
									<h3 className="text-xl font-light text-gray-900 mb-3">
										{feature.title}
									</h3>
									<p className="text-gray-600 font-light leading-relaxed text-sm">
										{feature.description}
									</p>
								</div>
							</BentoBox>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default WhyCommertize;
