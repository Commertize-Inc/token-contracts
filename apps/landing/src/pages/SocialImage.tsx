export default function SocialImage() {
	return (
		<div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
			<div
				className="relative shadow-2xl overflow-hidden"
				style={{
					width: "1200px",
					height: "675px",
				}}
			>
				<img
					src="/assets/digitized-real-estate.png"
					alt="Digitized Real Estate"
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>

				<div className="absolute bottom-6 right-6">
					<img
						src="/assets/commertize-logo-full.png"
						alt="Commertize"
						style={{ width: "auto", height: "50px" }}
					/>
				</div>
			</div>
		</div>
	);
}
