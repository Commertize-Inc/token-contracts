import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnboardingService } from "../src/services/OnboardingService";
import {
	User,
	Investor,
	VerificationStatus,
	InvestorType,
	AccreditationType,
	KycStatus,
	Sponsor,
} from "@commertize/data";

// Mock DB
const mockEm = {
	findOne: vi.fn(),
	create: vi.fn(),
	persist: vi.fn(),
	flush: vi.fn(),
	count: vi.fn(),
};

describe("OnboardingService", () => {
	let service: OnboardingService;

	beforeEach(() => {
		vi.clearAllMocks();
		mockEm.persist.mockReturnValue(mockEm); // Allow chaining .flush()
		service = new OnboardingService(mockEm as any);
	});

	describe("updateInvestorProfile", () => {
		it("should create new investor profile if user has none", async () => {
			const mockUser = Object.assign(new User(), {
				id: "user-1",
				privyId: "pid-1",
			});

			mockEm.findOne.mockResolvedValue(mockUser);

			await service.updateInvestorProfile("pid-1", {
				accreditationType: AccreditationType.REG_D,
				liquidNetWorth: "1000000",
			});

			expect(mockUser.investor).toBeDefined();
			expect(mockUser.investor?.accreditationType).toBe(
				AccreditationType.REG_D
			);
			expect(mockEm.persist).toHaveBeenCalledWith(mockUser);
		});

		it("should throw error if application is already VERIFIED", async () => {
			const mockInvestor = Object.assign(new Investor(), {
				status: VerificationStatus.VERIFIED,
			});
			const mockUser = Object.assign(new User(), {
				id: "user-1",
				privyId: "pid-1",
				investor: mockInvestor,
			});

			mockEm.findOne.mockResolvedValue(mockUser);

			await expect(
				service.updateInvestorProfile("pid-1", {
					liquidNetWorth: "2000000",
				})
			).rejects.toThrow("Application is already being processed or verified");
		});

		it("should reset status to PENDING on update if REJECTED", async () => {
			const mockInvestor = Object.assign(new Investor(), {
				status: VerificationStatus.REJECTED,
				type: InvestorType.INDIVIDUAL,
			});
			const mockUser = Object.assign(new User(), {
				id: "user-1",
				privyId: "pid-1",
				investor: mockInvestor,
			});

			mockEm.findOne.mockResolvedValue(mockUser);

			await service.updateInvestorProfile("pid-1", {
				liquidNetWorth: "2000000",
			});

			expect(mockUser.investor?.status).toBe(VerificationStatus.PENDING);
		});
	});

	describe("updateUserProfile", () => {
		it("should create Sponsor entity when role changes to sponsor", async () => {
			const mockUser = Object.assign(new User(), {
				id: "user-1",
				privyId: "pid-1",
				role: "investor", // initially investor
			});

			mockEm.findOne.mockResolvedValue(mockUser);

			await service.updateUserProfile("pid-1", {
				role: "sponsor",
				businessName: "My Prop Co",
			});

			expect(mockUser.role).toBe("sponsor");
			expect(mockUser.organizationRole).toBe("OWNER");
			expect(mockUser.sponsor).toBeDefined();
			expect(mockUser.sponsor?.businessName).toBe("My Prop Co");
			expect(mockUser.sponsor?.status).toBe(VerificationStatus.PENDING);
			expect(mockEm.persist).toHaveBeenCalledWith(expect.any(Sponsor));
		});
	});

	describe("getOrProvisionUser", () => {
		it("should return existing user if found", async () => {
			const mockUser = Object.assign(new User(), {
				id: "user-1",
				privyId: "pid-1",
			});
			mockEm.findOne.mockResolvedValue(mockUser);

			const result = await service.getOrProvisionUser("pid-1");
			expect(result).toBe(mockUser);
			expect(mockEm.persist).not.toHaveBeenCalled();
		});

		it("should create new user if not found", async () => {
			mockEm.findOne.mockResolvedValue(null);
			const newUser = Object.assign(new User(), {
				id: "new-user",
				privyId: "pid-1",
			});
			mockEm.create.mockReturnValue(newUser);

			const result = await service.getOrProvisionUser("pid-1");

			expect(result).toBe(newUser);
			expect(mockEm.create).toHaveBeenCalledWith(
				User,
				expect.objectContaining({ privyId: "pid-1" })
			);
			expect(mockEm.persist).toHaveBeenCalledWith(newUser);
		});
	});

	describe("getUserStatus", () => {
		it("should return status object with aggregated data", async () => {
			const mockUser = Object.assign(new User(), {
				id: "user-1",
				privyId: "pid-1",
				kycStatus: KycStatus.APPROVED,
				isAdmin: false,
			});

			mockEm.findOne.mockResolvedValue(mockUser);
			mockEm.count.mockResolvedValue(2); // 2 active bank accounts

			const status = await service.getUserStatus("pid-1");

			expect(status.kycStatus).toBe(KycStatus.APPROVED);
			expect(status.hasBankAccount).toBe(true);
			expect(status.user).toBe(mockUser);
			expect(mockEm.count).toHaveBeenCalledWith(
				"BankAccount",
				expect.objectContaining({ user: "user-1" })
			);
		});
	});
});
