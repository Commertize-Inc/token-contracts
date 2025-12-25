import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import type { Listing } from "@commertize/data";
import { ListingCard } from "@commertize/ui";

const CommertizeCollection = () => {
	const [listings, setListings] = useState<Listing[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchListings = async () => {
			try {
				const data = await api.get("/listings");
				const mappedListings: Listing[] = data.map((p: Listing) => {
					const tokenomics = p.tokenomics || {};
					const financials = p.financials || {};

					return {
						id: p.id,
						name: p.name,
						address: p.address,
						city: p.city,
						state: p.state,
						status: p.status,
						images: p.images || [],
						sponsor: p.sponsor || { firstName: "Commertize" },
						financials: {
							...financials,
							tokenPrice: tokenomics.tokenPrice || 0,
							targetRaise: p.impliedEquityValuation || 0,
						},
						tokenContractAddress: p.tokenContractAddress,
						propertyType: p.propertyType,
					};
				});

				setListings(mappedListings);
			} catch (error) {
				console.error("Failed to fetch listings", error);
			} finally {
				setLoading(false);
			}
		};

		fetchListings();
	}, []);

	return (
		<section id="listings" className="py-16 md:py-24 bg-white">
			<div className="relative w-full mb-6">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="text-center"
				>
					<h2 className="text-3xl md:text-5xl font-light text-gray-900 mb-6">
						The Commertize <span className="text-[#D4A024]">Collection</span>
					</h2>
				</motion.div>
			</div>

			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-100px" }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
					className="text-center mb-12 sm:mb-16 md:mb-20"
				>
					<p className="text-base md:text-lg max-w-2xl mx-auto text-gray-600 px-4 font-light">
						Explore a curated selection of commercial real estate opportunities
						across multiple sectors, sourced and vetted for quality and
						performance potential.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{loading ? (
						[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden animate-pulse h-[400px]"
							>
								<div className="h-48 bg-gray-200" />
								<div className="p-5 space-y-4">
									<div className="h-6 bg-gray-200 rounded w-3/4" />
									<div className="h-4 bg-gray-200 rounded w-1/2" />
									<div className="h-2 bg-gray-200 rounded w-full" />
								</div>
							</div>
						))
					) : listings.length > 0 ? (
						listings.slice(0, 3).map((property, index) => (
							<ListingCard
								key={property.id}
								listing={property}
								index={index}
								onViewDetails={() => {
									const dashboardUrl =
										import.meta.env.VITE_DASHBOARD_URL ||
										"http://localhost:3000";
									window.location.href = `${dashboardUrl}/auth?redirect=/property/${property.id}`;
								}}
							/>
						))
					) : (
						<div className="col-span-full text-center py-12">
							<Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<p className="text-gray-500 font-light">
								No active listings at the moment. Check back soon!
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default CommertizeCollection;
