import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

/**
 * Entity representing a news article or blog post.
 * Used for content marketing and investor education.
 */
@Entity({ tableName: "news_article" })
export class NewsArticle {
	@PrimaryKey()
	id: string = v4();

	/** Unique slug for the article URL. */
	@Property({ type: "string", index: true })
	slug!: string;

	/** Title of the article. */
	@Property({ type: "string" })
	title!: string;

	/** Short summary or excerpt. */
	@Property({ type: "text" })
	summary!: string;

	/** Full content of the article (Markdown or HTML). */
	@Property({ type: "text", nullable: true })
	content?: string;

	/** Category or topic of the article. */
	@Property({ type: "string" })
	category!: string;

	/** Array of tags associated with the article. */
	@Property({ type: "json", nullable: true })
	tags?: string[];

	/** URL to the featured image. */
	@Property({ type: "string", nullable: true })
	imageUrl?: string;

	@Property({ type: "integer", default: 5 })
	readTime: number = 5;

	@Property({ type: "timestamptz" })
	publishedAt!: Date;

	@Property({ type: "boolean", default: false })
	isGenerated: boolean = false;

	@Property({ type: "boolean", default: true })
	isPublished: boolean = true;

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
