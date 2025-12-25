import { motion } from "framer-motion";
import {
	Activity,
	Wind,
	Sun,
	Building2,
	Building,
	Home as HomeIcon,
	Warehouse,
	Layers,
	DollarSign,
	Coins,
} from "lucide-react";
import { useIsMounted } from "@commertize/utils/client";

const propertyTypes = [
	{ id: "ev-charging", name: "EV Charging Stations", icon: Activity },
	{ id: "wind-farms", name: "Wind Farms", icon: Wind },
	{ id: "solar-farms", name: "Solar Farms", icon: Sun },
	{ id: "multifamily", name: "Multifamily", icon: Building2 },
	{ id: "hospitality", name: "Hospitality", icon: Building },
	{ id: "office", name: "Office", icon: Building },
	{ id: "student-housing", name: "Student Housing", icon: HomeIcon },
	{ id: "datacenters", name: "Datacenters", icon: Warehouse },
	{ id: "mixed-use", name: "Mixed Use", icon: Layers },
	{ id: "retail", name: "Retail", icon: Building2 },
	{ id: "condominium", name: "Condominium", icon: HomeIcon },
	{ id: "industrial", name: "Industrial", icon: Warehouse },
];

const paymentMethods = [
	{
		name: "USD",
		icon: DollarSign,
		description: "Traditional payments",
		currencies: [],
	},
	{
		name: "Stablecoins",
		icon: Coins,
		description: "Digital currency",
		currencies: ["CREUSD", "USDC", "USDT"],
	},
];

const SubmitProperty = () => {
	const isMounted = useIsMounted();

	return (
		<section className="py-20 relative overflow-hidden">
			<div className="absolute inset-0">
				<img
					src="/assets/list-property-bg.jpg"
					alt=""
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-white/95" />
			</div>
			<div className="container max-w-6xl mx-auto px-4 relative z-10">
				<div className="text-center mb-12">
					<h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6">
						List Your Property on{" "}
						<span className="text-[#D4A024]">Commertize</span>
					</h2>
					<p className="text-gray-600 leading-relaxed max-w-4xl mx-auto text-base md:text-lg font-light">
						Commertize connects your commercial property to a worldwide network
						of qualified investors. Whether you&apos;re an owner, developer, or
						asset manager, our platform makes it simple to tokenize your CRE and
						open it to fractional investment. Reach a broader audience, secure
						capital faster, and retain control — all with blockchain-powered
						transparency and efficiency.
					</p>
				</div>

				<div className="mb-12">
					<h3 className="text-2xl md:text-3xl font-light mb-8 text-gray-900 text-center">
						Your Property, Our Global Marketplace
					</h3>

					<div className="mb-16">
						<div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden">
							{isMounted && (
								<motion.div
									className="relative"
									animate={{ rotate: 360 }}
									transition={{
										duration: 35,
										repeat: Infinity,
										ease: "linear",
									}}
								>
									{propertyTypes.map((type, index) => {
										const angle = (index / propertyTypes.length) * 360;
										const radius = 200;
										const x = Math.cos((angle * Math.PI) / 180) * radius;
										const y = Math.sin((angle * Math.PI) / 180) * radius;

										return (
											<div key={`subnet-${type.id}`}>
												<div
													className="absolute bg-[#D4A024]"
													style={{
														left: 0,
														top: 0,
														width: Math.sqrt(x * x + y * y) + "px",
														height: "1px",
														opacity: 0.4,
														transform: `rotate(${Math.atan2(y, x) * (180 / Math.PI)}deg)`,
														transformOrigin: "0 50%",
													}}
												/>

												<motion.div
													className="absolute"
													style={{
														left: x - 60,
														top: y - 18,
													}}
													animate={{ rotate: -360 }}
													transition={{
														duration: 35,
														repeat: Infinity,
														ease: "linear",
													}}
												>
													<div className="flex items-center space-x-2 bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024]/40 rounded-lg px-3 py-2 hover:from-[#D4A024]/10 hover:to-[#D4A024]/20 hover:border-[#D4A024]/60 transition-all duration-200 shadow-lg">
														<div className="w-7 h-7 rounded-full bg-[#D4A024]/20 border border-[#D4A024]/50 flex items-center justify-center">
															<type.icon className="w-4 h-4 text-[#D4A024]" />
														</div>
														<div>
															<div className="text-xs font-light text-gray-800">
																{type.name}
															</div>
														</div>
													</div>
												</motion.div>
											</div>
										);
									})}

									{propertyTypes.map((_, index) => {
										const connections: React.ReactNode[] = [];

										[1, 2, 3, 4].forEach((offset) => {
											const targetIndex =
												(index + offset) % propertyTypes.length;
											if (
												index < targetIndex ||
												index + offset >= propertyTypes.length
											) {
												const angle1 = (index / propertyTypes.length) * 360;
												const angle2 =
													(targetIndex / propertyTypes.length) * 360;
												const radius = 200;
												const x1 = Math.cos((angle1 * Math.PI) / 180) * radius;
												const y1 = Math.sin((angle1 * Math.PI) / 180) * radius;
												const x2 = Math.cos((angle2 * Math.PI) / 180) * radius;
												const y2 = Math.sin((angle2 * Math.PI) / 180) * radius;

												const deltaX = x2 - x1;
												const deltaY = y2 - y1;
												const length = Math.sqrt(
													deltaX * deltaX + deltaY * deltaY
												);
												const rotation =
													Math.atan2(deltaY, deltaX) * (180 / Math.PI);

												const opacity =
													offset === 1
														? 0.35
														: offset === 2
															? 0.25
															: offset === 3
																? 0.18
																: 0.12;

												connections.push(
													<div
														key={`inter-${index}-${targetIndex}-${offset}`}
														className="absolute bg-[#D4A024]"
														style={{
															left: x1,
															top: y1,
															width: length + "px",
															height: "1px",
															opacity: opacity,
															transform: `rotate(${rotation}deg)`,
															transformOrigin: "0 50%",
														}}
													/>
												);
											}
										});

										return (
											<div key={`connections-${index}`}>{connections}</div>
										);
									})}
								</motion.div>
							)}

							<div
								className="absolute flex items-center justify-center"
								style={{ zIndex: 2 }}
							>
								<img
									src="/assets/logo.png"
									alt="Commertize"
									className="h-6 w-auto object-contain"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Accepted Payment Methods */}
				<div className="py-16 border-t border-gray-100">
					<div className="flex items-center justify-center gap-2 mb-10">
						<div className="w-5 h-5 rounded-full border-2 border-[#D4A024] flex items-center justify-center">
							<div className="w-2 h-2 rounded-full bg-[#D4A024]" />
						</div>
						<h3 className="text-xl md:text-2xl font-light text-gray-900">
							Accepted Payment Methods
						</h3>
					</div>

					<div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
						{paymentMethods.map((method) => (
							<div
								key={method.name}
								className="flex flex-col items-center text-center"
							>
								<div className="w-16 h-16 rounded-full bg-[#FDF6E3] border-2 border-[#D4A024]/30 flex items-center justify-center mb-4">
									<method.icon className="w-7 h-7 text-[#D4A024]" />
								</div>
								<h4 className="text-lg font-medium text-gray-900 mb-1">
									{method.name}
								</h4>
								<p className="text-sm text-gray-500 mb-3">
									{method.description}
								</p>
								{method.currencies.length > 0 && (
									<div className="flex flex-wrap gap-2 justify-center">
										{method.currencies.map((currency) => (
											<span
												key={currency}
												className="px-3 py-1 text-xs font-medium text-[#D4A024] bg-[#FDF6E3] border border-[#D4A024]/30 rounded-full"
											>
												{currency}
											</span>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Submit Property CTA */}
				<div className="py-16 border-t border-gray-100 text-center">
					<p className="text-gray-600 text-lg md:text-xl font-light max-w-3xl mx-auto mb-8 leading-relaxed">
						Take advantage of Commertize&apos;s global reach—submit your
						property today and discover new opportunities for growth and
						success.
					</p>
					<button className="inline-flex items-center justify-center px-8 py-4 bg-[#D4A024] text-white text-base font-medium rounded-lg hover:bg-[#B8881C] transition-colors shadow-lg hover:shadow-xl">
						Submit Your Property
					</button>
				</div>
			</div>
		</section>
	);
};

export default SubmitProperty;
