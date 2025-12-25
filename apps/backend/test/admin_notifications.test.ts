import { describe, it, expect, vi, beforeEach } from "vitest";
import admin from "../src/routes/admin";
import { EntityType, KycStatus, NotificationType } from "@commertize/data";
import { User, Notification } from "@commertize/data";

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
		c.set("userId", "mock-admin-id");
		await next();
	},
}));

describe("Admin Notifications", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should create a notification when KYC is approved", async () => {
		// Setup mock data
		const mockAdmin = Object.assign(new User(), {
			id: "admin-1",
			isAdmin: true,
			privyId: "mock-admin-id",
		});
		const mockUser = Object.assign(new User(), {
			id: "user-1",
			kycStatus: KycStatus.PENDING,
			firstName: "John",
		});

		// Mock findOne for Admin check and User lookup
		mockEm.findOne.mockImplementation((entity: any, query: any) => {
			if (query.privyId === "mock-admin-id") return Promise.resolve(mockAdmin);
			if (query.id === "user-1") return Promise.resolve(mockUser);
			return Promise.resolve(null);
		});

		// Mock create to return the object passed
		mockEm.create.mockImplementation((entity, data) => data);

		// Execute request
		const res = await admin.request("/submissions/KYC/user-1/review", {
			method: "POST",
			body: JSON.stringify({ action: "APPROVE" }),
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(200);

		// Verify Notification creation
		const createCalls = mockEm.create.mock.calls;
		// Check if create was called with Notification entity
		const notificationCall = createCalls.find(
			(call) => call[0] === Notification || call[0].name === "Notification"
		);

		expect(notificationCall).toBeDefined();
		if (notificationCall) {
			expect(notificationCall[1]).toMatchObject({
				title: "KYC Verification Update",
				type: NotificationType.SUCCESS,
				user: mockUser,
			});
		}
	});

	it("should create a notification for REJECT action with comment", async () => {
		// Setup mock data
		const mockAdmin = Object.assign(new User(), {
			id: "admin-1",
			isAdmin: true,
			privyId: "mock-admin-id",
		});
		const mockUser = Object.assign(new User(), {
			id: "user-1",
			kycStatus: KycStatus.PENDING,
			firstName: "John",
		});

		mockEm.findOne.mockImplementation((entity: any, query: any) => {
			if (query.privyId === "mock-admin-id") return Promise.resolve(mockAdmin);
			if (query.id === "user-1") return Promise.resolve(mockUser);
			return Promise.resolve(null);
		});

		mockEm.create.mockImplementation((entity, data) => data);

		const res = await admin.request("/submissions/KYC/user-1/review", {
			method: "POST",
			body: JSON.stringify({ action: "REJECT", comment: "Docs invalid" }),
			headers: { "Content-Type": "application/json" },
		});

		expect(res.status).toBe(200);

		const createCalls = mockEm.create.mock.calls;
		const notificationCall = createCalls.find(
			(call) => call[0] === Notification || call[0].name === "Notification"
		);

		expect(notificationCall).toBeDefined();
		if (notificationCall) {
			expect(notificationCall[1]).toMatchObject({
				title: "KYC Verification Update",
				type: NotificationType.ERROR,
				message: expect.stringContaining("Docs invalid"),
				user: mockUser,
			});
		}
	});
});
