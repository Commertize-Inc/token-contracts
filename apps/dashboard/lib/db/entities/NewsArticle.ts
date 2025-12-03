import { Entity, PrimaryKey, Property, Index } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity({ tableName: "news_article" })
export class NewsArticle {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: "string" })
	@Index()
	slug!: string;

	@Property({ type: "string" })
	title!: string;

	@Property({ type: "text" })
	summary!: string;

	@Property({ type: "text", nullable: true })
	content?: string;

	@Property({ type: "string" })
	category!: string;

	@Property({ type: "string", nullable: true })
	imageUrl?: string;

	@Property({ type: "number", default: 5 })
	readTime: number = 5;

	@Property({ type: "string" })
	publishedAt!: string;

	@Property({ type: "boolean", default: false })
	isGenerated: boolean = false;

	@Property({ type: "boolean", default: true })
	isPublished: boolean = true;

	@Property({ type: "date" })
	createdAt: Date = new Date();

	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
