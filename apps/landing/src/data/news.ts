export interface NewsArticle {
	id: string;
	slug: string;
	title: string;
	summary: string;
	content?: string;
	category: string;
	tags?: string[];
	imageUrl?: string;
	readTime: number;
	publishedAt: string;
	createdAt: string;
	updatedAt: string;
}

export const fallbackArticles: NewsArticle[] = [
	{
		id: "1",
		slug: "commercial-real-estate-institutional-stability",
		title:
			"Commercial Real Estate Market Demonstrates Institutional-Grade Stability",
		summary:
			"Comprehensive analysis reveals that commercial real estate markets are exhibiting sophisticated adaptive mechanisms in response to evolving economic conditions.",
		content: `
			<p>Comprehensive analysis reveals that commercial real estate markets are exhibiting sophisticated adaptive mechanisms in response to evolving economic conditions. Institutional investors are increasingly finding value in stable assets.</p>
			<h2>Market Resilience</h2>
			<p>Despite global volatility, the commercial sector has shown remarkable resilience. Vacancy rates in prime locations remain low, driven by a flight to quality.</p>
			<h2>The Role of Technology</h2>
			<p>PropTech and tokenization are playing a pivotal role in this stability, offering new liquidity channels and transparent valuation models.</p>
		`,
		category: "CRE",
		imageUrl:
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
		readTime: 8,
		publishedAt: new Date().toISOString(),
		createdAt: "",
		updatedAt: "",
	},
	{
		id: "2",
		slug: "financial-markets-tokenization-trends",
		title: "Financial Markets Adapt to Real Estate Tokenization Trends",
		summary:
			"Traditional financial markets are evolving to accommodate real estate tokenization, with new infrastructure developments enabling seamless integration.",
		content: `
			<p>Traditional financial markets are evolving to accommodate real estate tokenization. Major banks and asset managers are piloting blockchain-based settlement systems.</p>
			<h2>Integration Challenges</h2>
			<p>While the technology is ready, regulatory frameworks are still catching up. However, recent guidelines from major jurisdictions suggest a positive outlook.</p>
			<h2>Future Outlook</h2>
			<p>Analysts predict that within the next decade, a significant portion of real estate assets will be tokenized, democratizing access to this asset class.</p>
		`,
		category: "Tokenization",
		imageUrl:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop",
		readTime: 5,
		publishedAt: new Date().toISOString(),
		createdAt: "",
		updatedAt: "",
	},
];
