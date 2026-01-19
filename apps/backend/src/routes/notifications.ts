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
		const user = await em.findOne(
			User,
			{ privyId },
			{ populate: ["sponsor", "sponsor.members"] }
		);

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		// Query where user is target OR sponsor is target (if user is part of sponsor)
		// Assuming user can only be part of ONE sponsor for now based on schema (User.sponsor)
		// But Sponsor has members collection.
		// Wait, User.sponsor usually means "User belongs to this Sponsor".

		const query: any = { $or: [{ user }] };
		if (user.sponsor) {
			query.$or.push({ sponsor: user.sponsor });
		}

		const userNotifications = await em.find(Notification, query, {
			orderBy: { createdAt: "DESC" },
			limit: 50,
		});

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
		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const query: any = {
			$or: [{ user }],
			isRead: false,
		};
		if (user.sponsor) {
			query.$or.push({ sponsor: user.sponsor });
		}

		const count = await em.count(Notification, query);

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
		const user = await em.findOne(User, { privyId }, { populate: ["sponsor"] });

		if (!user) {
			return c.json({ error: "User not found" }, 404);
		}

		const query: any = {
			$or: [{ user }],
			isRead: false,
		};
		if (user.sponsor) {
			query.$or.push({ sponsor: user.sponsor });
		}

		// Update all unread notifications for this user or their sponsor
		const unread = await em.find(Notification, query);

		for (const n of unread) {
			// Basic check: If it's a sponsor notification, marking it read marks it for EVERYONE?
			// Currently yes, shared state. User requested "query for notifications... for any sponsor".
			// Shared read state is a trade-off of this simple model.
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
