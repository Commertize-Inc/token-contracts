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
			targetRaise: 5000000,
			tokenPrice: 50,
			capRate: 5.5,
			noi: 275000,
			occupancyRate: 95,
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
			targetRaise: 2000000,
			tokenPrice: 100,
			capRate: 6.2,
			noi: 124000,
			occupancyRate: 98,
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
			targetRaise: 7500000,
			tokenPrice: 75,
			capRate: 6.0,
			noi: 450000,
			occupancyRate: 92,
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
