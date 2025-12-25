import { z } from "zod";
import { EntityType } from "../enums";

export const createReviewCommentSchema = z.object({
	entityType: z.nativeEnum(EntityType),
	entityId: z.string().uuid("Invalid Entity ID"),
	content: z.string().min(1, "Comment cannot be empty"),
	isInternal: z.boolean().default(false),
});

export type CreateReviewCommentInput = z.infer<
	typeof createReviewCommentSchema
>;
