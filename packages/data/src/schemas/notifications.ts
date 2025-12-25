import { z } from "zod";
import { NotificationType } from "../entities/Notification";

export const dispatchNotificationSchema = z.object({
	userId: z.string().uuid("Invalid User ID"),
	title: z.string().min(1, "Title is required"),
	message: z.string().min(1, "Message is required"),
	type: z
		.nativeEnum(NotificationType)
		.optional()
		.default(NotificationType.INFO),
	link: z.string().url().optional(),
});

export type DispatchNotificationInput = z.infer<
	typeof dispatchNotificationSchema
>;
