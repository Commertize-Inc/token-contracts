import { Hono } from "hono";
import { Notification, User } from "@commertize/data";
import { getEM } from "../db";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";

const notifications = new Hono<HonoEnv>();

// GET /notifications - Get user's notifications
notifications.get("/", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const userNotifications = await em.find(
			Notification,
			{ user },
			{
				orderBy: { createdAt: "DESC" },
				limit: 50, // Limit to last 50
			}
		);

		return c.json(userNotifications);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// GET /notifications/unread-count - Get unread count
notifications.get("/unread-count", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const count = await em.count(Notification, {
			user,
			isRead: false,
		});

		return c.json({ count });
	} catch (error) {
		console.error("Error fetching unread count:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// PATCH /notifications/:id/read - Mark as read
notifications.patch("/:id/read", authMiddleware, async (c) => {
	try {
		const id = c.req.param("id");
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const notification = await em.findOne(Notification, { id, user });

		if (!notification) {
			return c.json({ error: "Notification not found" }, 404);
		}

		notification.isRead = true;
		await em.flush();

		return c.json({ success: true, notification });
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

// PATCH /notifications/mark-all-read - Mark all as read
notifications.patch("/mark-all-read", authMiddleware, async (c) => {
	try {
		const privyId = c.get("userId");
		const em = await getEM();
		const user = await em.findOne(User, { privyId });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Update all unread notifications for this user
		// MikroORM native update might be efficient here but let's stick to simple
		const unread = await em.find(Notification, { user, isRead: false });

		for (const n of unread) {
			n.isRead = true;
		}

		await em.flush();

		return c.json({ success: true, count: unread.length });
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return c.json({ error: "Internal server error" }, 500);
	}
});

export default notifications;
