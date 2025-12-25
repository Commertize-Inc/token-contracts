import { describe, it, expect, beforeEach, vi } from "vitest";
import { EntityManager } from "@mikro-orm/core";
import { ListingService } from "../src/services/ListingService";
import {
	User,
	Listing,
	VerificationStatus,
	ListingStatus,
	Sponsor,
} from "@commertize/data";
import { v4 } from "uuid";

describe("ListingService", () => {
	let service: ListingService;
	let mockEm: any;
	let mockUser: User;
	let mockSponsor: Sponsor;
	let mockListing: Listing;

	beforeEach(() => {
		mockEm = {
			findOne: vi.fn(),
			persist: vi.fn().mockReturnThis(),
			flush: vi.fn(),
			create: vi
				.fn()
				.mockImplementation((entity: any, data: any) => ({
					...data,
					id: v4(),
				})),
			assign: vi.fn((entity, data) => Object.assign(entity, data)),
			remove: vi.fn().mockReturnThis(),
		};

		mockSponsor = {
			id: "sponsor-123",
			businessName: "My Organization",
			status: VerificationStatus.VERIFIED,
			members: [],
			listings: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		} as unknown as Sponsor;

		mockUser = {
			id: "user-123",
			email: "test@example.com",
			sponsor: mockSponsor, // Linked to Sponsor entity
			organizationRole: "OWNER",
			// ... other user props
		} as User;

		mockListing = {
			id: "listing-123",
			name: "Test Property",
			sponsor: mockSponsor, // Linked to Sponsor entity
			status: ListingStatus.DRAFT,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Listing;

		service = new ListingService(mockEm as EntityManager);
	});

	describe("createListing", () => {
		it("should create listing for verified sponsor", async () => {
			const data = { name: "Test Property" };

			const result = await service.createListing(mockUser, data);

			expect(mockEm.persist).toHaveBeenCalled();
			expect(result).toMatchObject({
				name: data.name,
				status: ListingStatus.PENDING_REVIEW,
				sponsor: mockSponsor, // Should match the User's Sponsor entity
			});
		});

		it("should fail if user is not verified sponsor", async () => {
			const unverifiedSponsor = {
				...mockSponsor,
				status: VerificationStatus.UNVERIFIED,
			};
			mockUser.sponsor = unverifiedSponsor as unknown as Sponsor;

			await expect(
				service.createListing(mockUser, { name: "Test" })
			).rejects.toThrow("Only verified sponsors can create listings");
		});

		it("should fail if user has no sponsor organization", async () => {
			mockUser.sponsor = undefined;

			await expect(
				service.createListing(mockUser, { name: "Test" })
			).rejects.toThrow("Only verified sponsors can create listings");
		});
	});

	describe("updateListing", () => {
		it("should allow owner to update listing", async () => {
			mockEm.findOne.mockResolvedValue(mockListing);

			await service.updateListing(mockUser, "listing-123", {
				name: "Updated Name",
			});

			expect(mockListing.name).toBe("Updated Name");
			expect(mockEm.flush).toHaveBeenCalled();
		});

		it("should fail if not owner", async () => {
			const otherSponsor = { id: "sponsor-456" } as Sponsor;
			mockListing.sponsor = otherSponsor; // Listing belongs to different sponsor

			mockEm.findOne.mockResolvedValue(mockListing);

			await expect(
				service.updateListing(mockUser, "listing-123", {})
			).rejects.toThrow("Unauthorized");
		});
	});

	describe("withdrawListing", () => {
		it("should allow owner to withdraw listing", async () => {
			mockListing.status = ListingStatus.PENDING_REVIEW; // Fixed from ACTIVE which throws error
			mockEm.findOne.mockResolvedValue(mockListing);

			await service.withdrawListing(mockUser, "listing-123");

			expect(mockListing.status).toBe(ListingStatus.WITHDRAWN);
		});
	});

	describe("resubmitListing", () => {
		it("should allow owner to resubmit withdrawn listing", async () => {
			mockListing.status = ListingStatus.WITHDRAWN;
			mockEm.findOne.mockResolvedValue(mockListing);

			await service.resubmitListing(mockUser, "listing-123");

			expect(mockListing.status).toBe(ListingStatus.PENDING_REVIEW);
		});

		it("should prevent resubmitting active listing", async () => {
			mockListing.status = ListingStatus.ACTIVE;
			mockEm.findOne.mockResolvedValue(mockListing);

			await expect(
				service.resubmitListing(mockUser, "listing-123")
			).rejects.toThrow("Only withdrawn listings");
		});
	});

	describe("deleteListing", () => {
		it("should allow owner to delete draft listing", async () => {
			mockListing.status = ListingStatus.DRAFT;
			mockEm.findOne.mockResolvedValue(mockListing);

			await service.deleteListing(mockUser, "listing-123");

			expect(mockEm.remove).toHaveBeenCalledWith(mockListing);
		});
	});
});
