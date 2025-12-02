import { Entity, PrimaryKey, Property, Index } from "@mikro-orm/core";
import { v4 } from "uuid";

@Entity()
export class NewsArticle {
  @PrimaryKey()
  id: string = v4();

  @Property()
  @Index()
  slug!: string;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  summary!: string;

  @Property({ type: 'text', nullable: true })
  content?: string;

  @Property()
  category!: string;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ default: 5 })
  readTime: number = 5;

  @Property()
  publishedAt!: string;

  @Property({ default: false })
  isGenerated: boolean = false;

  @Property({ default: true })
  isPublished: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
