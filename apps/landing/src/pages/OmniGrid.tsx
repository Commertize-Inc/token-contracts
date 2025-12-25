import { motion } from "framer-motion";
import {
	Sun,
	Server,
	Building2,
	Wrench,
	Link as LinkIcon,
	MapPin,
	Gem,
	Factory,
	Wheat,
	Trees,
	Droplets,
} from "lucide-react";
import { PageHeader } from "@commertize/ui";
import ChatGPTWidget from "../components/ChatGPTWidget";
import SEO from "../components/SEO";

const infrastructureCategories = [
	{
		icon: Gem,
		title: "Resource Infrastructure",
		subtitle: "Foundational Layer: Precious & Industrial Metals",
		description:
			"Tokenized ownership of actual mining operations and facilities — gold, silver, platinum, palladium mines, lithium extraction sites, cobalt operations, and rare earth element mining infrastructure.",
		examples:
			"Physical mine ownership, mining operations, processing facilities, resource rights",
	},
	{
		icon: Sun,
		title: "Energy Infrastructure",
		subtitle: "Powering the Physical & Digital World",
		description:
			"Clean, renewable, and distributed energy projects — solar farms, wind turbines, hydropower, geothermal, and hydrogen production.",
		examples: "Energy credits, power purchase revenue, carbon offset yield",
	},
	{
		icon: Factory,
		title: "Industrial Infrastructure",
		subtitle: "Physical Facilities & Manufacturing Nodes",
		description:
			"Green manufacturing plants, EV battery gigafactories, sustainable material processing sites, and industrial logistics hubs.",
		examples: "Income-producing facilities, infrastructure bonds",
	},
	{
		icon: Server,
		title: "Digital Infrastructure",
		subtitle: "The Backbone of the Data Economy",
		description:
			"Data centers, edge computing sites, fiber optic networks, satellite nodes, and AI compute clusters powering the digital world.",
		examples: "Data capacity ownership, hosting yield, compute tokens",
	},
	{
		icon: Wheat,
		title: "Agricultural & Land Infrastructure",
		subtitle: "Sustainable Food & Resource Production",
		description:
			"Productive, sustainable land use — farmland, vineyards, timberland, aquaculture, and regenerative agriculture systems.",
		examples: "Yield tokens, crop revenue, carbon-linked income",
	},
	{
		icon: Trees,
		title: "Environmental Infrastructure",
		subtitle: "The Planet's Regenerative Layer",
		description:
			"Carbon capture projects, reforestation, biodiversity zones, water rights, and environmental restoration initiatives.",
		examples: "Carbon credits, biodiversity credits, ESG yield assets",
	},
	{
		icon: Building2,
		title: "Urban Infrastructure",
		subtitle: "Smart & Sustainable Cities",
		description:
			"Smart buildings, IoT-enabled CRE, green transportation hubs, EV charging networks, and circular economy facilities.",
		examples: "Utility revenue, lease participation, smart-city systems",
	},
	{
		icon: Droplets,
		title: "Water & Marine Infrastructure",
		subtitle: "Blue Economy Layer",
		description:
			"Water rights, purification plants, desalination systems, marine energy projects, and ocean-based infrastructure.",
		examples: "Water credit tokens, royalties, infrastructure-backed yield",
	},
];

const currentStatus = [
	{
		icon: Wrench,
		text: "Select developments currently under way",
	},
	{
		icon: LinkIcon,
		text: "Integrated within the Commertize ecosystem",
	},
	{
		icon: MapPin,
		text: "Expansion partnerships in multiple regions",
	},
];

export default function OmniGrid() {
	return (
		<>
			<SEO
				title="OmniGrid - Sustainable Infrastructure"
				description="OmniGrid tokenizes the physical assets driving global innovation. Solar, Data Centers, Clean Energy, and more."
			/>
			<div className="relative w-full min-h-screen flex flex-col">
				{/* Infrastructure Background Image - Hero Only with Motion */}
				<div className="absolute top-0 left-0 right-0 h-screen z-0 overflow-hidden">
					<motion.div
						className="absolute bg-cover bg-center bg-no-repeat"
						style={{
							backgroundImage: "url(/assets/omnigrid-bg-v5.png?v=1)",
							inset: "-2%",
							width: "104%",
							height: "104%",
						}}
						animate={{
							x: [0, 8, -5, 3, 0],
							y: [0, -5, 3, -3, 0],
							scale: [1, 1.01, 1.005, 1.008, 1],
						}}
						transition={{
							duration: 20,
							ease: "easeInOut",
							repeat: Infinity,
							repeatType: "reverse",
						}}
					/>
				</div>

				{/* Hero Section */}
				<section className="relative min-h-screen flex flex-col justify-center z-10 pt-20">
					<div className="container mx-auto px-4 max-w-5xl">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="rounded-3xl p-8 md:p-12 pl-0 md:pl-0"
						>
							<PageHeader
								breadcrumbs={
									<div className="mb-6">
										<img
											src="/assets/omnigrid-logo-v6.png?v=1"
											alt="OMNIGRID"
											width={700}
											height={180}
											className="w-auto h-20 md:h-24 max-w-full"
										/>
									</div>
								}
								title={
									<span className="text-[#B8860B]">
										Sustainable Infrastructure, Digitally Owned
									</span>
								}
								subtitle="Solar. Data Centers. Clean Energy. OmniGrid tokenizes the physical assets driving global innovation."
								className="py-0"
							/>
						</motion.div>
					</div>
				</section>

				{/* Overview Section */}
				<section
					id="overview"
					className="relative min-h-screen flex flex-col justify-center py-24 z-10 bg-white"
				>
					<div className="container mx-auto px-4 max-w-5xl">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="text-center"
						>
							<span className="inline-block px-4 py-1.5 bg-[#D4A024]/10 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
								About
							</span>
							<h2
								className="text-4xl md:text-5xl font-light mb-8 text-gray-800"
								style={{ fontFamily: "Space Grotesk, sans-serif" }}
							>
								Physical <span className="text-[#D4A024]">Meets</span> Digital
							</h2>
							<div className="max-w-3xl mx-auto">
								<p className="text-xl font-light text-gray-600 leading-relaxed">
									OmniGrid is Commertize&apos;s infrastructure and development
									division — connecting the physical and digital economies
									through sustainable, tokenization-ready assets across the
									globe.
								</p>
							</div>
						</motion.div>
					</div>
				</section>

				{/* 8 Infrastructure Pillars */}
				<section className="relative min-h-screen flex flex-col justify-center py-24 z-10 bg-gray-50">
					<div className="container mx-auto px-4 max-w-7xl">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="text-center mb-16"
						>
							<span className="inline-block px-4 py-1.5 bg-[#D4A024]/20 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
								Pillars
							</span>
							<h2
								className="text-4xl md:text-5xl font-light mb-4 text-gray-800"
								style={{ fontFamily: "Space Grotesk, sans-serif" }}
							>
								Eight Pillars of{" "}
								<span className="text-gray-600 font-light">
									The &apos;Internet of Infrastructure&apos;
								</span>
							</h2>
							<p className="text-lg text-gray-600 max-w-3xl mx-auto mt-4">
								From earth&apos;s resources to digital networks — a
								comprehensive infrastructure intelligence layer
							</p>
						</motion.div>

						<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
							{infrastructureCategories.map((category, index) => (
								<motion.div
									key={category.title}
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.08 }}
									viewport={{ once: true }}
									whileHover={{ scale: 1.02, y: -5 }}
									className="bg-white border-2 border-[#D4A024]/50 hover:border-[#D4A024] rounded-2xl p-6 transition-all duration-300 shadow-xl"
								>
									<div className="flex flex-col h-full">
										<div className="w-14 h-14 bg-[#D4A024]/10 rounded-full flex items-center justify-center mb-4">
											<category.icon className="w-7 h-7 text-[#D4A024]" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{category.title}
										</h3>
										<p className="text-sm text-[#D4A024] font-medium mb-3">
											{category.subtitle}
										</p>
										<p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
											{category.description}
										</p>
										<div className="pt-3 border-t border-gray-200">
											<p className="text-xs text-gray-500 italic">
												{category.examples}
											</p>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				{/* Vision Statement */}
				<section className="relative min-h-screen flex flex-col justify-center py-24 overflow-hidden z-10 bg-white">
					<div className="absolute inset-0 opacity-5">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage: `radial-gradient(circle at center, #D4A024 1px, transparent 1px)`,
								backgroundSize: "60px 60px",
							}}
						/>
					</div>
					<div className="container mx-auto px-4 max-w-4xl relative z-10">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="text-center"
						>
							<span className="inline-block px-4 py-1.5 bg-[#D4A024]/10 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-8">
								Vision
							</span>
							<div className="border-2 border-[#D4A024] rounded-3xl p-10 md:p-14 bg-white shadow-xl">
								<p className="text-xl md:text-2xl font-light leading-relaxed text-gray-700">
									OmniGrid represents Commertize&apos;s commitment to building
									the{" "}
									<span className="text-[#D4A024] font-medium">
										physical backbone
									</span>{" "}
									of tomorrow&apos;s tokenized economy — integrating{" "}
									<span className="text-[#D4A024] font-medium">
										sustainability
									</span>
									,{" "}
									<span className="text-[#D4A024] font-medium">
										energy efficiency
									</span>
									, and{" "}
									<span className="text-[#D4A024] font-medium">
										digital scalability
									</span>{" "}
									across every layer of infrastructure.
								</p>
							</div>
						</motion.div>
					</div>
				</section>

				{/* Current Status */}
				<section className="relative min-h-screen flex flex-col justify-center py-24 z-10 bg-gray-50">
					<div className="container mx-auto px-4 max-w-5xl">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<div className="text-center mb-12">
								<span className="inline-block px-4 py-1.5 bg-[#D4A024]/10 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
									Status
								</span>
								<h2
									className="text-3xl md:text-4xl font-light text-gray-800"
									style={{ fontFamily: "Space Grotesk, sans-serif" }}
								>
									Current <span className="text-[#D4A024]">Progress</span>
								</h2>
							</div>

							<div className="grid md:grid-cols-3 gap-8 mb-12">
								{currentStatus.map((status, index) => (
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
										viewport={{ once: true }}
										className="bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-lg"
									>
										<div className="w-14 h-14 bg-[#D4A024]/10 rounded-full flex items-center justify-center mx-auto mb-5">
											<status.icon className="w-7 h-7 text-[#D4A024]" />
										</div>
										<p className="text-gray-700 font-light text-lg">
											{status.text}
										</p>
									</motion.div>
								))}
							</div>

							<p className="text-center text-gray-500 font-light italic">
								Further details will be announced through official releases.
							</p>
						</motion.div>
					</div>
				</section>

				{/* RUNE.CTZ Chatbot */}
				<ChatGPTWidget />
			</div>
		</>
	);
}
