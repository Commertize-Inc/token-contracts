import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import {
	Listing,
	OfferingType,
	ListingStatus,
	User,
	VerificationStatus,
	Sponsor,
} from "../index";
import { COMMERTIZE_ADMIN, COMMERTIZE_ADMIN_ID } from "./UserSeeder";
import { v4 } from "uuid";

const MOCK_SPONSOR_ID = v4();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_LISTINGS: any[] = [
	{
		id: "mock-1",
		name: "The Grand Plaza",
		address: "123 Main St",
		city: "New York",
		state: "NY",
		zipCode: "10001",
		propertyType: "Commercial",
		status: ListingStatus.ACTIVE,
		offeringType: OfferingType.REG_A,
		financials: {
			purchasePrice: 4500000,
			totalCapitalization: 5000000,
			loanAmount: 2500000,
			loanToValue: 0.5,
			interestRate: 0.05,
			loanTermYears: 10,
			equityRequired: 2500000,
			closingCosts: 100000,
			acquisitionFee: 50000,
			capexBudget: 100000,
			workingCapital: 50000,
			reservesInitial: 50000,
			effectiveGrossIncome: 550000,
			operatingExpenses: 275000,
			noi: 275000,
			occupancyRate: 0.95,
			annualRentGrowth: 2,
			annualExpenseGrowth: 2,
			holdPeriodYears: 5,
			exitCapRate: 5,
			exitSalePrice: 6000000,
			targetCoCYear1: 0.08,
			targetAvgCoC: 0.1,
			targetIRR: 0.15,
			targetEquityMultiple: 1.8,
			preferredReturn: 0.08,
			sponsorPromote: 0.2,
			payoutRatioOfFCF: 1,
			distributionFrequency: "QUARTERLY",
		},
		tokenomics: {
			totalTokenSupply: 100000,
			tokensForInvestors: 50000,
			tokensForSponsor: 40000,
			tokensForTreasury: 10000,
			tokenPrice: 50,
			minInvestmentTokens: 10,
			transferRestricted: true,
		},
		images: [
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
		],
		tokenContractAddress: "0xMockContract1",
		description:
			"A premier commercial property in the heart of downtown architecture.",
		highlights: [],
		documents: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "mock-2",
		name: "Sunset Apartments",
		address: "456 Sunset Blvd",
		city: "Los Angeles",
		state: "CA",
		zipCode: "90028",
		propertyType: "Multi-Family",
		status: ListingStatus.FULLY_FUNDED,
		offeringType: OfferingType.REG_A,
		financials: {
			purchasePrice: 3000000,
			totalCapitalization: 3500000,
			loanAmount: 1500000,
			loanToValue: 0.5,
			interestRate: 0.05,
			loanTermYears: 10,
			equityRequired: 2000000,
			closingCosts: 100000,
			acquisitionFee: 50000,
			capexBudget: 100000,
			workingCapital: 50000,
			reservesInitial: 50000,
			effectiveGrossIncome: 400000,
			operatingExpenses: 200000,
			noi: 200000,
			occupancyRate: 0.98,
			annualRentGrowth: 2,
			annualExpenseGrowth: 2,
			holdPeriodYears: 5,
			exitCapRate: 5,
			exitSalePrice: 4000000,
			targetCoCYear1: 0.08,
			targetAvgCoC: 0.1,
			targetIRR: 0.15,
			targetEquityMultiple: 1.8,
			preferredReturn: 0.08,
			sponsorPromote: 0.2,
			payoutRatioOfFCF: 1,
			distributionFrequency: "QUARTERLY",
		},
		tokenomics: {
			totalTokenSupply: 20000,
			tokensForInvestors: 10000,
			tokensForSponsor: 8000,
			tokensForTreasury: 2000,
			tokenPrice: 100,
			minInvestmentTokens: 5,
			transferRestricted: true,
		},
		images: [
			"https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=800&q=80",
		],
		tokenContractAddress: "0xMockContract2",
		description: "Luxury apartments with breathtaking sunset views.",
		highlights: [],
		documents: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	},
	{
		id: "mock-3",
		name: "Tech Hub Office Park",
		address: "789 Innovation Dr",
		city: "Austin",
		state: "TX",
		zipCode: "78701",
		propertyType: "Office",
		status: ListingStatus.ACTIVE,
		offeringType: OfferingType.REG_A,
		financials: {
			purchasePrice: 6500000,
			totalCapitalization: 7500000,
			loanAmount: 4000000,
			loanToValue: 0.53,
			interestRate: 0.055,
			loanTermYears: 7,
			equityRequired: 3500000,
			closingCosts: 150000,
			acquisitionFee: 75000,
			capexBudget: 200000,
			workingCapital: 75000,
			reservesInitial: 75000,
			effectiveGrossIncome: 900000,
			operatingExpenses: 450000,
			noi: 450000,
			occupancyRate: 0.92,
			annualRentGrowth: 2.5,
			annualExpenseGrowth: 2,
			holdPeriodYears: 5,
			exitCapRate: 5.5,
			exitSalePrice: 10000000,
			targetCoCYear1: 0.07,
			targetAvgCoC: 0.09,
			targetIRR: 0.14,
			targetEquityMultiple: 1.7,
			preferredReturn: 0.08,
			sponsorPromote: 0.2,
			payoutRatioOfFCF: 1,
			distributionFrequency: "QUARTERLY",
		},
		tokenomics: {
			totalTokenSupply: 100000,
			tokensForInvestors: 50000,
			tokensForSponsor: 40000,
			tokensForTreasury: 10000,
			tokenPrice: 75,
			minInvestmentTokens: 10,
			transferRestricted: true,
		},
		images: [
			"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
		],
		tokenContractAddress: "0xMockContract3",
		description: "Modern office park situated in the tech corridor.",
		highlights: [],
		documents: [],
		createdAt: new Date(),
		updatedAt: new Date(),
	},
];

export class PropertySeeder extends Seeder {
	async run(em: EntityManager): Promise<void> {
		// 1. Find or create the Sponsor Organization
		let sponsorOrg = await em.findOne(Sponsor, {
			businessName: "Commertize Capital",
		});

		if (!sponsorOrg) {
			sponsorOrg = em.create(Sponsor, {
				id: MOCK_SPONSOR_ID,
				businessName: "Commertize Capital",
				status: VerificationStatus.VERIFIED,
				votingMembers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			em.persist(sponsorOrg);
		}

		// 2. Find or create the Admin User and link to Sponsor
		let adminUser = await em.findOne(User, {
			id: COMMERTIZE_ADMIN_ID,
		});

		if (!adminUser) {
			adminUser = em.create(User, {
				...COMMERTIZE_ADMIN,
				sponsor: sponsorOrg, // Link to organization
				organizationRole: "OWNER",
			});
			em.persist(adminUser);
		} else {
			// Ensure admin is linked to sponsor if exists
			if (!adminUser.sponsor) {
				adminUser.sponsor = sponsorOrg;
				adminUser.organizationRole = "OWNER";
				em.persist(adminUser);
			}
		}

		// 3. Create Listings linked to the Sponsor Organization
		for (const propData of MOCK_LISTINGS) {
			const existing = await em.findOne(Listing, { name: propData.name });
			if (!existing) {
				const prop = em.create(Listing, {
					...propData,
					sponsor: sponsorOrg, // Link listing to Sponsor entity
					highlights: [],
					documents: [],
					createdAt: new Date(),
					updatedAt: new Date(),
					dividends: [],
				});
				em.persist(prop);
				console.log(`Creating property: ${prop.name}`);
			} else {
				console.log(`Property already exists: ${propData.name}`);
			}
		}

		await em.flush();
	}
}
