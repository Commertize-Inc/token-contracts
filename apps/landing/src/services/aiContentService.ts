import { API_URL } from "../constants/config";

interface GeneratedContent {
	text: string;
	topic: string;
	imagePrompt: string;
}

class AIContentService {
	async generateTweetContent(): Promise<GeneratedContent> {
		try {
			// Make sure we have the API Key or at least a way to authorize if needed
			// For public/landing routes we might need the apiKeyMiddleware header if configured
			// Assuming public access or apiKeyMiddleware allows specific origins

			const response = await fetch(`${API_URL}/ai-content/tweet`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-api-key": import.meta.env.VITE_API_KEY || "",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to generate content");
			}

			return await response.json();
		} catch (error) {
			console.error("Failed to generate tweet content:", error);
			throw error;
		}
	}

	async generateMultipleTweets(count: number = 5): Promise<GeneratedContent[]> {
		const tweets: GeneratedContent[] = [];

		for (let i = 0; i < count; i++) {
			try {
				const tweet = await this.generateTweetContent();
				tweets.push(tweet);
			} catch (error) {
				console.error(`Failed to generate tweet ${i + 1}:`, error);
			}
		}

		return tweets;
	}
}

export const aiContentService = new AIContentService();
export default AIContentService;
