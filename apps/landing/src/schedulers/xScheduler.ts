import { xApiService } from "../services/xApiService";
import type { TweetResponse, RateLimitStatus } from "../services/xApiService";

interface ScheduledPost {
	id: string;
	text: string;
	media?: string[];
	scheduledTime: Date;
	posted: boolean;
}

class XScheduler {
	private scheduledPosts: ScheduledPost[] = [];
	private isRunning = false;
	private intervalId: NodeJS.Timeout | null = null;
	private checkInterval = 60 * 1000; // Check every minute

	start() {
		if (this.isRunning) {
			console.log("X Scheduler is already running");
			return;
		}

		if (!xApiService.isReady()) {
			console.log(
				"X API not ready - scheduler will start when credentials are available"
			);
			return;
		}

		this.isRunning = true;
		console.log("X Scheduler started");

		this.intervalId = setInterval(() => {
			this.processScheduledPosts();
		}, this.checkInterval);

		this.processScheduledPosts();
	}

	stop() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
		console.log("X Scheduler stopped");
	}

	schedulePost(text: string, scheduledTime: Date, media?: string[]): string {
		const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		this.scheduledPosts.push({
			id,
			text,
			media,
			scheduledTime,
			posted: false,
		});

		console.log(
			`Post scheduled for ${scheduledTime.toISOString()}: ${text.substring(0, 50)}...`
		);
		return id;
	}

	cancelPost(postId: string): boolean {
		const index = this.scheduledPosts.findIndex(
			(p) => p.id === postId && !p.posted
		);
		if (index !== -1) {
			this.scheduledPosts.splice(index, 1);
			console.log(`Cancelled scheduled post: ${postId}`);
			return true;
		}
		return false;
	}

	getScheduledPosts(): ScheduledPost[] {
		return this.scheduledPosts.filter((p) => !p.posted);
	}

	private async processScheduledPosts() {
		const now = new Date();
		const duePosts = this.scheduledPosts.filter(
			(p) => !p.posted && new Date(p.scheduledTime) <= now
		);

		for (const post of duePosts) {
			try {
				await xApiService.postTweet({
					text: post.text,
					media: post.media,
				});
				post.posted = true;
				console.log(`Successfully posted scheduled tweet: ${post.id}`);
			} catch (error) {
				console.error(`Failed to post scheduled tweet ${post.id}:`, error);
			}
		}
	}

	async postNow(text: string, media?: string[]): Promise<TweetResponse> {
		return xApiService.postTweet({ text, media });
	}

	getStatus(): { isRunning: boolean; pendingPosts: number; rateLimits: RateLimitStatus } {
		return {
			isRunning: this.isRunning,
			pendingPosts: this.scheduledPosts.filter((p) => !p.posted).length,
			rateLimits: xApiService.getRateLimitStatus(),
		};
	}
}

export const xScheduler = new XScheduler();
export default XScheduler;
