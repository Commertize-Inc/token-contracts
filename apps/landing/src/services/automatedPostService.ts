import { aiContentService } from "./aiContentService";
import { dalleService } from "./dalleService";
import { xApiService } from "./xApiService";
import fs from "fs";

interface PostResult {
	success: boolean;
	tweetId?: string;
	text?: string;
	imagePath?: string;
	error?: string;
	timestamp: string;
}

interface PostHistory {
	posts: PostResult[];
	lastPostDate: string;
}

class AutomatedPostService {
	private historyFile: string;
	private postHistory: PostHistory;

	constructor() {
		this.historyFile = "post-history.json";
		this.postHistory = this.loadHistory();
	}

	private loadHistory(): PostHistory {
		try {
			if (fs.existsSync(this.historyFile)) {
				const data = fs.readFileSync(this.historyFile, "utf-8");
				return JSON.parse(data);
			}
		} catch (error) {
			console.error("Failed to load post history:", error);
		}
		return { posts: [], lastPostDate: "" };
	}

	private saveHistory(): void {
		try {
			fs.writeFileSync(
				this.historyFile,
				JSON.stringify(this.postHistory, null, 2)
			);
		} catch (error) {
			console.error("Failed to save post history:", error);
		}
	}

	private shouldPostToday(): boolean {
		const now = new Date();
		const dayOfWeek = now.getDay();

		if (dayOfWeek === 0 || dayOfWeek === 6) {
			console.log("Weekend - skipping post");
			return false;
		}

		const today = now.toISOString().split("T")[0];
		if (this.postHistory.lastPostDate === today) {
			console.log("Already posted today");
			return false;
		}

		return true;
	}

	private isPSTMorning(): boolean {
		const now = new Date();

		const pstOffset = -8 * 60;
		const localOffset = now.getTimezoneOffset();
		const pstTime = new Date(
			now.getTime() + (localOffset + pstOffset) * 60 * 1000
		);

		const hour = pstTime.getHours();

		return hour >= 8 && hour <= 10;
	}

	async generateAndPost(): Promise<PostResult> {
		const timestamp = new Date().toISOString();

		try {
			if (!xApiService.isReady()) {
				throw new Error("X API client not initialized");
			}

			console.log("Generating AI content...");
			const content = await aiContentService.generateTweetContent();
			console.log(`Generated tweet: ${content.text.substring(0, 100)}...`);

			console.log("Generating DALL-E image...");
			const image = await dalleService.generateImage(content.imagePrompt);
			console.log(`Generated image: ${image.localPath}`);

			console.log("Posting to X...");
			const tweet = await xApiService.postTweet({
				text: content.text,
				media: [image.localPath],
			});

			const result: PostResult = {
				success: true,
				tweetId: tweet.data.id,
				text: content.text,
				imagePath: image.localPath,
				timestamp,
			};

			this.postHistory.posts.push(result);
			this.postHistory.lastPostDate = new Date().toISOString().split("T")[0];
			this.saveHistory();

			console.log(`Successfully posted tweet: ${tweet.data.id}`);
			return result;
		} catch (error: unknown) {
			const result: PostResult = {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp,
			};

			this.postHistory.posts.push(result);
			this.saveHistory();

			console.error("Failed to generate and post:", error);
			return result;
		}
	}

	async runScheduledPost(): Promise<PostResult> {
		console.log("Running scheduled post check...");

		if (!this.shouldPostToday()) {
			return {
				success: false,
				error: "Not scheduled to post today",
				timestamp: new Date().toISOString(),
			};
		}

		return this.generateAndPost();
	}

	async forcePost(): Promise<PostResult> {
		console.log("Force posting (bypassing schedule checks)...");
		return this.generateAndPost();
	}

	async previewPost(): Promise<{
		text: string;
		imagePrompt: string;
		topic: string;
	}> {
		console.log("Generating preview (no posting)...");
		const content = await aiContentService.generateTweetContent();
		return {
			text: content.text,
			imagePrompt: content.imagePrompt,
			topic: content.topic,
		};
	}

	getPostHistory(limit: number = 10): PostResult[] {
		return this.postHistory.posts.slice(-limit).reverse();
	}

	getStatus(): {
		lastPostDate: string;
		totalPosts: number;
		successfulPosts: number;
		isWeekday: boolean;
		apiReady: boolean;
	} {
		const now = new Date();
		const dayOfWeek = now.getDay();

		return {
			lastPostDate: this.postHistory.lastPostDate,
			totalPosts: this.postHistory.posts.length,
			successfulPosts: this.postHistory.posts.filter((p) => p.success).length,
			isWeekday: dayOfWeek !== 0 && dayOfWeek !== 6,
			apiReady: xApiService.isReady(),
		};
	}

	cleanupOldImages(): void {
		dalleService.cleanupOldImages(48);
	}
}

export const automatedPostService = new AutomatedPostService();
export default AutomatedPostService;
