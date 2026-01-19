import { EntityManager } from "@mikro-orm/core";
import {
	AccreditationType,
	Investor,
	InvestorType,
	KycStatus,
	User,
	VerificationStatus,
	Sponsor,
} from "@commertize/data";
import { privyClient } from "../lib/privy";

export class OnboardingService {
	constructor(private readonly em: EntityManager) {}

	async getOrProvisionUser(privyId: string): Promise<User> {
		let user = await this.em.findOne(
			User,
			{ privyId },
			{ populate: ["sponsor", "investor"] }
		);

		if (!user) {
			user = this.em.create(User, {
				privyId,
				createdAt: new Date(),
				updatedAt: new Date(),
				kycStatus: KycStatus.NOT_STARTED,
				isAdmin: false,
			});
			// Verify initial wallet sync on creation
			try {
				const privyUser = await privyClient.getUser(privyId);
				if (privyUser.wallet) {
					user.walletAddress = privyUser.wallet.address;
				}
			} catch (e) {
				console.warn(
					`Failed to fetch Privy user ${privyId} during creation`,
					e
				);
			}
			await this.em.persist(user).flush();
		} else if (!user.walletAddress) {
			// Sync wallet if missing
			try {
				const privyUser = await privyClient.getUser(privyId);
				if (privyUser.wallet) {
					user.walletAddress = privyUser.wallet.address;
					await this.em.flush();
				}
			} catch (e) {
				console.warn(`Failed to sync wallet for user ${user.id}`, e);
			}
		}
		return user;
	}

	async getUserStatus(privyId: string) {
		const user = await this.getOrProvisionUser(privyId);

		// Count active bank accounts
		const activeBankAccountsCount = await this.em.count("BankAccount", {
			user: user.id,
			status: "active",
		});

		return {
			kycStatus: user.kycStatus,
			hasBankAccount: activeBankAccountsCount > 0,
			isAdmin: user.isAdmin,
			role: user.role,
			sponsor: user.sponsor,
			user: user,
			investorQuestionnaire: user.investor,
		};
	}

	async updateUserProfile(privyId: string, data: any) {
		const user = await this.em.findOne(
			User,
			{ privyId },
			{ populate: ["sponsor"] }
		);
		if (!user) throw new Error("User not found");

		if (data.username && data.username !== user.username) {
			const existingUser = await this.em.findOne(User, {
				username: data.username,
			});
			if (existingUser) {
				throw new Error("Username already taken");
			}
			user.username = data.username;
		}

		if (data.role && ["investor", "sponsor"].includes(data.role)) {
			user.role = data.role;
		}

		if (data.firstName) user.firstName = data.firstName;
		if (data.lastName) user.lastName = data.lastName;
		if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
		if (data.bio !== undefined) user.bio = data.bio;
		if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

		// Handle Sponsor Creation/Update
		// If the user selects role 'sponsor' and doesn't have one, or is updating business details
		if (data.role === "sponsor" || (user.sponsor && data.businessName)) {
			// Need to import Sponsor entity at top of file
			if (!user.sponsor) {
				// Create new Sponsor Organization
				const sponsor = new Sponsor();
				sponsor.businessName =
					data.businessName || `${user.firstName}'s Organization`;
				sponsor.status = VerificationStatus.PENDING;
				sponsor.createdAt = new Date();
				sponsor.updatedAt = new Date();

				// Persist sponsor first
				this.em.persist(sponsor);

				// Link user
				user.sponsor = sponsor;
				user.organizationRole = "OWNER";
			} else {
				// Update existing sponsor details if provided
				if (data.businessName) user.sponsor.businessName = data.businessName;
				if (data.ein) user.sponsor.ein = data.ein;
				// ... handle other fields
			}
		}

		user.updatedAt = new Date();

		await this.em.persist(user).flush();
		return user;
	}

	async updateInvestorProfile(privyId: string, data: any) {
		const user = await this.em.findOne(
			User,
			{ privyId },
			{ populate: ["investor"] }
		);
		if (!user) throw new Error("User not found");

		if (user.investor) {
			const status = user.investor.status;
			if (
				status === VerificationStatus.VERIFIED ||
				status === VerificationStatus.PENDING
			) {
				// But wait, the previous code in onboarding.ts said:
				// "Application is already being processed or verified"
				// However, we want to allow re-submission if REJECTED.
				// If PENDING, strictly speaking, they shouldn't edit?
				// Original logic blocked PENDING. But user requested "Edit & Resubmit".
				// "Edit & Resubmit" usually applies to REJECTED.
				// So blocking PENDING is correct.
				throw new Error("Application is already being processed or verified.");
			}
		} else {
			user.investor = new Investor();
			user.investor.createdAt = new Date();
			user.investor.type = InvestorType.INDIVIDUAL;
		}

		const investor = user.investor;

		// Reset status if this is a correction (e.g. from Rejected)
		investor.status = VerificationStatus.PENDING;
		investor.updatedAt = new Date();

		if (data.accreditationType)
			investor.accreditationType = data.accreditationType;
		if (data.investmentExperience)
			investor.investmentExperience = data.investmentExperience;
		if (data.riskTolerance) investor.riskTolerance = data.riskTolerance;
		if (data.liquidNetWorth) investor.liquidNetWorth = data.liquidNetWorth;
		if (data.taxCountry) investor.taxCountry = data.taxCountry;
		if (data.documents) investor.accreditationDocuments = data.documents;

		this.em.persist(user);
		await this.em.flush();
	}
}
