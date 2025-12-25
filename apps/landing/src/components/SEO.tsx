import { Helmet } from "react-helmet-async";

interface SEOProps {
	title?: string;
	description?: string;
	keywords?: string[];
	image?: string;
	url?: string;
}

const SEO = ({
	title = "Commertize - Real Estate Tokenization & DeFi",
	description = "Commertize is the leading platform for tokenized commercial real estate. Invest in fractional ownership and earn yield through DeFi protocols.",
	keywords = [
		"Real Estate Tokenization",
		"DeFi",
		"Commercial Real Estate",
		"Blockchain",
		"Investment",
	],
	image = "/social-share.png", // Default image
	url = "https://commertize.com", // Default URL
}: SEOProps) => {
	const siteTitle = title.includes("Commertize")
		? title
		: `${title} | Commertize`;

	return (
		<Helmet>
			<title>{siteTitle}</title>
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords.join(", ")} />

			{/* Open Graph / Facebook */}
			<meta property="og:type" content="website" />
			<meta property="og:url" content={url} />
			<meta property="og:title" content={siteTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={image} />

			{/* Twitter */}
			<meta property="twitter:card" content="summary_large_image" />
			<meta property="twitter:url" content={url} />
			<meta property="twitter:title" content={siteTitle} />
			<meta property="twitter:description" content={description} />
			<meta property="twitter:image" content={image} />
		</Helmet>
	);
};

export default SEO;
