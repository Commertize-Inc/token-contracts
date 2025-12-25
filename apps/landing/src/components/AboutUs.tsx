import { motion } from "framer-motion";

const AboutUs = () => {
	const companyName = "Commertize";

	return (
		<section
			id="about"
			className="relative overflow-hidden min-h-[700px] md:min-h-[800px]"
		>
			<div className="absolute inset-0">
				<motion.div
					className="absolute inset-0"
					initial={{ scale: 1 }}
					animate={{ scale: [1.0, 1.2] }}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "easeInOut",
						repeatType: "reverse",
					}}
				>
					<img
						src="/assets/vision-background.jpg"
						alt=""
						className="w-full h-full object-cover"
						style={{ objectPosition: "center center" }}
					/>
				</motion.div>
				<div className="absolute inset-0 bg-white/60" />
			</div>

			<div className="absolute inset-0 flex items-center justify-start z-10 px-6 md:px-8 lg:pl-24 container mx-auto">
				<motion.div
					className="max-w-2xl text-left"
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.2 }}
					transition={{ duration: 1, ease: "easeOut" }}
				>
					<motion.h2
						className="text-3xl md:text-4xl lg:text-5xl font-light mb-8 md:mb-12 text-gray-900"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, amount: 0.5 }}
						transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					>
						Our Vision
					</motion.h2>

					<div className="space-y-6 md:space-y-8">
						<motion.p
							className="text-base md:text-lg font-light text-gray-800 leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
						>
							{companyName} is building the platform that connects commercial
							real estate to global capital markets. By merging AI,
							blockchain-based tokenization, and decentralized finance with
							compliant financial infrastructure, we&apos;re enhancing
							liquidity, transparency, and access across the real estate
							landscape.
						</motion.p>
						<motion.p
							className="text-base md:text-lg font-light text-gray-800 leading-relaxed"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
						>
							From office buildings and multifamily listings to data centers and
							solar farms, we empower investors and property owners to own,
							trade, and build the next era of real estate finance—making real
							assets as dynamic and borderless as digital ones.
						</motion.p>
					</div>
				</motion.div>
			</div>

			<div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 flex items-center overflow-hidden bg-gradient-to-t from-white/80 to-transparent z-10">
				<motion.div
					animate={{ x: [0, -1600] }}
					transition={{
						duration: 25,
						repeat: Infinity,
						ease: "linear",
						repeatType: "loop",
					}}
					className="flex items-center space-x-32 whitespace-nowrap"
					style={{ minWidth: "3200px" }}
				>
					{[
						"Shaping the Future of Ownership",
						"Digital Assets, Real-World Value",
						"Shaping the Future of Ownership",
						"Digital Assets, Real-World Value",
						"Shaping the Future of Ownership",
						"Digital Assets, Real-World Value",
					].map((phrase, index) => (
						<motion.div
							key={`${phrase}-${index}`}
							whileHover={{
								scale: 1.05,
								color: "#D4A024",
								transition: { duration: 0.2 },
							}}
							className="cursor-pointer group flex-shrink-0"
							style={{ minWidth: "500px", textAlign: "center" }}
						>
							<span className="text-xl md:text-2xl font-light text-gray-800">
								{phrase}
							</span>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default AboutUs;
