import { describe, it, expect, vi, beforeEach } from "vitest";
import reviews from "../src/routes/reviews";
import { EntityType, User, Listing, ReviewComment } from "@commertize/data";

// Mock dependencies
const mockEm = {
	findOne: vi.fn(),
	create: vi.fn(),
	persist: vi.fn(),
	flush: vi.fn(),
	find: vi.fn(),
};

vi.mock("../src/db", () => ({
	getEM: vi.fn(() => Promise.resolve(mockEm)),
}));

// Mock auth middleware
vi.mock("../src/middleware/auth", () => ({
	authMiddleware: async (c: any, next: any) => {
		c.set("userId", "mock-user-id");
		await next();
	},
}));

describe("Review Replies", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should allow user to reply to their own KYC review", async () => {
		const mockUser = Object.assign(new User(), {
			id: "user-1",
			privyId: "mock-user-id",
		});

		mockEm.findOne.mockImplementation((entity: any, query: any) => {
			if (query.privyId === "mock-user-id") return Promise.resolve(mockUser);
			return Promise.resolve(null);
		});

		mockEm.create.mockImplementation((entity, data) => data);

		const res = await reviews.request("/", {
			method: "POST",
			body: JSON.stringify({
				entityType: EntityType.KYC,
				entityId: "user-1",
				content: "I fixed it",
			}),
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(200);
		expect(mockEm.persist).toHaveBeenCalled();
	});

	it("should forbid user from replying to another user's KYC review", async () => {
		const mockUser = Object.assign(new User(), {
			id: "user-1",
			privyId: "mock-user-id",
		});

		mockEm.findOne.mockImplementation((entity: any, query: any) => {
			if (query.privyId === "mock-user-id") return Promise.resolve(mockUser);
			return Promise.resolve(null);
		});

		const res = await reviews.request("/", {
			method: "POST",
			body: JSON.stringify({
				entityType: EntityType.KYC,
				entityId: "other-user-2",
				content: "Intruder",
			}),
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(403);
		expect(mockEm.persist).not.toHaveBeenCalled();
	});

	it("should allow user to reply to review on their Listing", async () => {
		const mockUser = Object.assign(new User(), {
			id: "user-1",
			privyId: "mock-user-id",
		});
		const mockListing = Object.assign(new Listing(), {
			id: "listing-1",
			sponsor: mockUser,
		});

		mockEm.findOne.mockImplementation((entity: any, query: any) => {
			if (query.privyId === "mock-user-id") return Promise.resolve(mockUser);
			if (query.id === "listing-1") return Promise.resolve(mockListing);
			return Promise.resolve(null);
		});

		mockEm.create.mockImplementation((entity, data) => data);

		const res = await reviews.request("/", {
			method: "POST",
			body: JSON.stringify({
				entityType: EntityType.LISTING,
				entityId: "listing-1",
				content: "Updated listing info",
			}),
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(200);
	});

	it("should forbid user from replying to review on another Listing", async () => {
		const mockUser = Object.assign(new User(), {
			id: "user-1",
			privyId: "mock-user-id",
		});
		const otherUser = Object.assign(new User(), { id: "user-2" });
		const mockListing = Object.assign(new Listing(), {
			id: "listing-2",
			sponsor: otherUser,
		});

		mockEm.findOne.mockImplementation((entity: any, query: any) => {
			if (query.privyId === "mock-user-id") return Promise.resolve(mockUser);
			if (query.id === "listing-2") return Promise.resolve(mockListing);
			return Promise.resolve(null);
		});

		const res = await reviews.request("/", {
			method: "POST",
			body: JSON.stringify({
				entityType: EntityType.LISTING,
				entityId: "listing-2",
				content: "Intruder",
			}),
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(403);
	});
});
