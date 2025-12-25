import SEO from "../components/SEO";

export default function DownloadPage() {
	return (
		<div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
			<SEO title="Download" description="Download resources from Commertize." />
			<h1 className="text-white text-2xl mb-4">
				Right-click the image below and select &quot;Save Image As&quot;
			</h1>
			<p className="text-gray-400 mb-8">Or long-press on mobile to save</p>

			<div className="border-4 border-[#D4A024] rounded-lg overflow-hidden">
				<img
					src="/assets/larry-fink-quote.png"
					alt="Larry Fink Quote - Commertize"
					style={{ maxWidth: "100%", height: "auto" }}
				/>
			</div>

			<p className="text-gray-500 mt-8 text-sm">Image: larry-fink-quote.png</p>
		</div>
	);
}
