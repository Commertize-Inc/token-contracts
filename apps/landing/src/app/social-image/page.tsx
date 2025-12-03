"use client";

import Image from "next/image";

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
				<Image
					src="/assets/digitized-real-estate.png"
					alt="Digitized Real Estate"
					fill
					style={{ objectFit: "cover" }}
					priority
				/>

				<div className="absolute bottom-6 right-6">
					<Image
						src="/assets/commertize-logo-full.png"
						alt="Commertize"
						width={220}
						height={60}
						style={{ width: "auto", height: "50px" }}
					/>
				</div>
			</div>
		</div>
	);
}
