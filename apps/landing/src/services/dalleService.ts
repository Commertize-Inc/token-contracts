import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratedImage {
  localPath: string;
  prompt: string;
  revisedPrompt?: string;
}

class DalleService {
  private imageDir: string;

  constructor() {
    this.imageDir = path.join(process.cwd(), 'public', 'generated-images');
    this.ensureImageDirectory();
  }

  private ensureImageDirectory(): void {
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }
  }

  async generateImage(prompt: string): Promise<GeneratedImage> {
    try {
      const enhancedPrompt = `${prompt}. Style: Ultra high quality, professional corporate photography, clean composition, premium aesthetic, no text or watermarks.`;

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'vivid',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from DALL-E');
      }

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      if (!imageUrl) {
        throw new Error('No image URL returned from DALL-E');
      }

      const filename = `tweet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`;
      const localPath = path.join(this.imageDir, filename);

      await this.downloadImage(imageUrl, localPath);

      console.log(`Generated image saved to: ${localPath}`);

      return {
        localPath,
        prompt,
        revisedPrompt
      };
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }
  }

  private downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      
      https.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(filepath);
            return this.downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
          }
        }

        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (error) => {
        fs.unlink(filepath, () => {});
        reject(error);
      });
    });
  }

  async generateMultipleImages(prompts: string[]): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];
    
    for (const prompt of prompts) {
      try {
        const image = await this.generateImage(prompt);
        images.push(image);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate image for prompt: ${prompt}`, error);
      }
    }
    
    return images;
  }

  cleanupOldImages(maxAgeHours: number = 24): void {
    try {
      const files = fs.readdirSync(this.imageDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.imageDir, file);
        const stats = fs.statSync(filepath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filepath);
          console.log(`Cleaned up old image: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old images:', error);
    }
  }

  getImagePath(filename: string): string {
    return path.join(this.imageDir, filename);
  }
}

export const dalleService = new DalleService();
export default DalleService;
