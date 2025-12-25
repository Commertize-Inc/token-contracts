import { z } from "zod";

export const createNewsArticleSchema = z.object({
	title: z.string().min(5, "Title must be at least 5 characters"),
	slug: z
		.string()
		.min(3)
		.regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes")
		.optional(), // Can be auto-generated
	summary: z.string().min(10, "Summary must be at least 10 characters"),
	content: z.string().optional(),
	category: z.string().min(1, "Category is required"),
	imageUrl: z.string().url("Must be a valid URL").optional(),
	tags: z.array(z.string()).optional(),
	isPublished: z.boolean().default(false),
	publishedAt: z.coerce.date().optional(),
	readTime: z.number().int().min(1).optional(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.partial();

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
