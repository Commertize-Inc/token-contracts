import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity({ tableName: "news_article" })
export class NewsArticle {
	@PrimaryKey()
	id: string = v4();

	@Property({ type: "string", index: true })
	slug!: string;

	@Property({ type: "string" })
	title!: string;

	@Property({ type: "text" })
	summary!: string;

	@Property({ type: "text", nullable: true })
	content?: string;

	@Property({ type: "string" })
	category!: string;

	@Property({ type: "json", nullable: true })
	tags?: string[];

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
