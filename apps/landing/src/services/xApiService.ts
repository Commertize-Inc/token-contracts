import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import path from 'path';

interface XPostData {
  text: string;
  media?: string[];
  poll?: {
    options: string[];
    duration_minutes: number;
  };
}

class XApiService {
  private client: TwitterApi | null = null;
  private isInitialized = false;
  
  private dailyPostCount = 0;
  private dailyActionCount = 0;
  private lastResetDate = new Date().toDateString();
  
  private readonly RATE_LIMITS = {
    DAILY_POSTS: 100,
    DAILY_ACTIONS: 500,
    HOURLY_POSTS: 15,
    POSTS_PER_MINUTE: 1
  };
  
  private lastPostTime = 0;

  constructor() {
    this.initializeClient();
    this.resetDailyCountsIfNeeded();
  }

  private initializeClient() {
    try {
      const apiKey = process.env.X_API_KEY;
      const apiSecret = process.env.X_API_SECRET;
      const accessToken = process.env.X_ACCESS_TOKEN;
      const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

      if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
        console.log('X API credentials not provided - X integration disabled');
        return;
      }

      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessTokenSecret,
      });

      this.isInitialized = true;
      console.log('X API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize X API client:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  async postTweet(data: XPostData): Promise<any> {
    if (!this.isInitialized || !this.client) {
      throw new Error('X API client not initialized');
    }

    this.resetDailyCountsIfNeeded();
    
    if (this.dailyPostCount >= this.RATE_LIMITS.DAILY_POSTS) {
      throw new Error(`Daily posting limit of ${this.RATE_LIMITS.DAILY_POSTS} reached`);
    }

    const now = Date.now();
    const timeSinceLastPost = now - this.lastPostTime;
    const minimumInterval = 60 * 1000;

    if (timeSinceLastPost < minimumInterval) {
      const waitTime = minimumInterval - timeSinceLastPost;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      const tweetData: any = { text: data.text };

      if (data.media && data.media.length > 0) {
        const mediaIds = await this.uploadMedia(data.media);
        if (mediaIds.length > 0) {
          tweetData.media = { media_ids: mediaIds };
        }
      }

      if (data.poll) {
        tweetData.poll = {
          options: data.poll.options,
          duration_minutes: data.poll.duration_minutes
        };
      }

      const tweet = await this.client.v2.tweet(tweetData);
      
      this.dailyPostCount++;
      this.lastPostTime = Date.now();
      
      console.log(`Tweet posted: ${tweet.data.id} (${this.dailyPostCount}/${this.RATE_LIMITS.DAILY_POSTS} daily)`);
      return tweet;
    } catch (error) {
      console.error('Failed to post tweet:', error);
      throw error;
    }
  }

  async uploadMedia(mediaPaths: string[]): Promise<string[]> {
    if (!this.client) throw new Error('X API client not initialized');

    const mediaIds: string[] = [];
    
    for (const mediaPath of mediaPaths) {
      try {
        const absolutePath = path.isAbsolute(mediaPath) ? mediaPath : path.resolve(process.cwd(), mediaPath);
        
        if (fs.existsSync(absolutePath)) {
          const isVideo = this.isVideoFile(absolutePath);
          
          if (isVideo) {
            const mediaId = await this.client.v1.uploadMedia(absolutePath, { type: 'chunked' });
            mediaIds.push(mediaId);
          } else {
            const mediaId = await this.client.v1.uploadMedia(absolutePath);
            mediaIds.push(mediaId);
          }
        }
      } catch (error) {
        console.error(`Failed to upload media ${mediaPath}:`, error);
      }
    }

    return mediaIds;
  }

  private isVideoFile(filePath: string): boolean {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.gif'];
    return videoExtensions.includes(path.extname(filePath).toLowerCase());
  }

  async getMentions(since_id?: string): Promise<any[]> {
    if (!this.client) return [];
    try {
      const mentions = await this.client.v2.userMentionTimeline('me', {
        max_results: 50,
        since_id: since_id,
        'tweet.fields': ['created_at', 'author_id', 'conversation_id']
      });
      return mentions.data?.data || [];
    } catch (error) {
      return [];
    }
  }

  async replyToTweet(tweetId: string, replyText: string): Promise<any> {
    if (!this.client) throw new Error('X API client not initialized');
    return this.client.v2.tweet({
      text: replyText,
      reply: { in_reply_to_tweet_id: tweetId }
    });
  }

  async likeTweet(tweetId: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.v2.like('me', tweetId);
      this.dailyActionCount++;
      return true;
    } catch (error) {
      return false;
    }
  }

  async followUser(userId: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.v2.follow('me', userId);
      this.dailyActionCount++;
      return true;
    } catch (error) {
      return false;
    }
  }

  async searchTweets(query: string, maxResults = 10): Promise<any[]> {
    if (!this.client) return [];
    try {
      const results = await this.client.v2.search(query, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'author_id', 'public_metrics']
      });
      return results.data?.data || [];
    } catch (error) {
      return [];
    }
  }

  async getAccountMetrics(): Promise<any> {
    if (!this.client) return null;
    try {
      const user = await this.client.v2.me({
        'user.fields': ['public_metrics', 'created_at']
      });
      return {
        followers: user.data.public_metrics?.followers_count || 0,
        following: user.data.public_metrics?.following_count || 0,
        tweets: user.data.public_metrics?.tweet_count || 0
      };
    } catch (error) {
      return null;
    }
  }

  private resetDailyCountsIfNeeded(): void {
    const currentDate = new Date().toDateString();
    if (currentDate !== this.lastResetDate) {
      this.dailyPostCount = 0;
      this.dailyActionCount = 0;
      this.lastResetDate = currentDate;
    }
  }

  getRateLimitStatus(): any {
    this.resetDailyCountsIfNeeded();
    return {
      dailyPosts: {
        used: this.dailyPostCount,
        limit: this.RATE_LIMITS.DAILY_POSTS,
        remaining: this.RATE_LIMITS.DAILY_POSTS - this.dailyPostCount
      }
    };
  }
}

export const xApiService = new XApiService();
export default XApiService;
