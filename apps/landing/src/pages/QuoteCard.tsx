export default function QuoteCard() {
	return (
		<div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
			<div
				className="relative shadow-2xl overflow-hidden"
				style={{
					width: "1200px",
					height: "675px",
					backgroundImage: "url(/assets/quote-bg.png)",
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="absolute inset-0 flex">
					<div
						className="flex flex-col justify-center px-16 py-12"
						style={{ width: "55%" }}
					>
						<div className="space-y-6 mt-16">
							<p
								className="text-gray-900 text-3xl font-normal leading-relaxed"
								style={{ fontFamily: "Georgia, serif" }}
							>
								Tokenization today is roughly where the internet was in 1996.
							</p>
						</div>

						<div className="mt-10">
							<p className="text-gray-600 text-lg">— Larry Fink,</p>
							<p className="text-gray-600 text-lg">@BlackRock Chairman & CEO</p>
						</div>

						<div className="absolute bottom-10 left-16 flex items-center gap-3">
							<img
								src="/assets/commertize-icon-gold.png"
								alt="Commertize"
								style={{ width: "auto", height: "36px" }}
							/>
							<span
								className="text-lg font-medium tracking-wider"
								style={{
									color: "#D4A024",
									fontFamily: "'Space Grotesk', sans-serif",
								}}
							>
								COMMERTIZE
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
