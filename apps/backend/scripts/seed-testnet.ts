import { loadEnv } from "@commertize/utils/server";
// Load envs from root (assuming running related to apps/backend)
loadEnv("../");
import { DeepPartial, MikroORM } from "@mikro-orm/core";
import { v4 } from "uuid";
import config from "@commertize/data/config";
import {
	Listing,
	Sponsor,
	User,
	OfferingType,
	ListingStatus,
	VerificationStatus,
	ListingFinancials,
} from "@commertize/data";
import { TokenService } from "../src/services/token";

async function main() {
	console.log("Initializing Database Connection...");
	const configData = await config;
	const orm = await MikroORM.init(configData as any);
	const em = orm.em.fork();

	try {
		// 1. Ensure Sponsor
		let sponsor = await em.findOne(Sponsor, {
			businessName: "Commertize Capital",
		});
		if (!sponsor) {
			console.log("Creating Sponsor: Commertize Capital...");
			sponsor = em.create(Sponsor, {
				id: v4(),
				businessName: "Commertize Capital",
				status: VerificationStatus.VERIFIED,
				votingMembers: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			await em.persist(sponsor).flush();
		}

		// 2. Define Listing Data
		const listingData = {
			id: "testnet-hbar-1", // Fixed ID for idempotency attempts
			name: "Hedera Testnet Heights",
			address: "123 Crypto Blvd",
			city: "Hashgraph City",
			state: "TX",
			zipCode: "78701",
			propertyType: "Commercial",
			status: ListingStatus.PENDING_REVIEW, // Start Pending so we can process it
			offeringType: OfferingType.REG_A,
			fundingCurrency: "HBAR",
			isGasSponsored: false,
			financials: {
				purchasePrice: 10000,
				totalCapitalization: 10000,
				loanAmount: 0,
				loanToValue: 0,
				interestRate: 0,
				loanTermYears: 0,
				equityRequired: 10000,
				closingCosts: 0,
				acquisitionFee: 0,
				capexBudget: 0,
				workingCapital: 0,
				reservesInitial: 0,
				effectiveGrossIncome: 1000,
				operatingExpenses: 100,
				noi: 900,
				occupancyRate: 1.0,
				annualRentGrowth: 0,
				annualExpenseGrowth: 0,
				holdPeriodYears: 5,
				exitCapRate: 5,
				exitSalePrice: 12000,
				targetCoCYear1: 0.09,
				targetAvgCoC: 0.09,
				targetIRR: 0.15,
				targetEquityMultiple: 1.5,
				preferredReturn: 0.08,
				sponsorPromote: 0.2,
				payoutRatioOfFCF: 1,
				distributionFrequency: "QUARTERLY",
			} as ListingFinancials,
			tokenomics: {
				totalTokenSupply: 100000,
				tokensForInvestors: 90000,
				tokensForSponsor: 10000,
				tokensForTreasury: 0,
				tokenPrice: 0.1, // $0.10
				minInvestmentTokens: 10, // $1.00 Min Investment (~10 HBAR approx)
				transferRestricted: true,
			},
			description: "A testnet listing for HBAR investment testing.",
			images: [
				"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
			],
			documents: [],
			highlights: ["HBAR Funding", "Low Min Investment", "Testnet Only"],
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// 3. Find or Create Listing
		let listing = await em.findOne(Listing, { id: listingData.id });
		if (!listing) {
			console.log(`Creating Listing: ${listingData.name}...`);
			listing = em.create(Listing, {
				...listingData,
				sponsor: sponsor,
			});
			await em.persist(listing).flush();
			// Refetch to ensure clean state
		} else {
			console.log("Listing exists.");
		}

		// 4. Deploy Contracts if needed
		if (!listing.tokenContractAddress || !listing.escrowContractAddress) {
			console.log("Contracts missing. Deploying...");

			// Call TokenService
			// Note: TokenService expects the listing to be populated?
			// deployPropertyToken uses listing.sponsor.walletAddress.
			// Check if sponsor has walletAddress.
			if (!listing.sponsor.walletAddress) {
				// Assign a dummy or admin wallet
				// Or user provided one.
				// Assuming TokenService uses fallback if null.
				// TokenService code: listing.sponsor.walletAddress || wallet.address
			}

			const tokenAddr = await TokenService.deployPropertyToken(listing); // This updates listing object reference inside too
			listing.tokenContractAddress = tokenAddr;

			// Save Deployment Info
			listing.status = ListingStatus.ACTIVE; // Make it LIVE immediately
			await em.persist(listing).flush();
			console.log("Deployment Complete!");
			console.log(`Token: ${listing.tokenContractAddress}`);
			console.log(`Escrow: ${listing.escrowContractAddress}`);
		} else {
			console.log("Contracts already deployed.");
			console.log(`Token: ${listing.tokenContractAddress}`);
			console.log(`Escrow: ${listing.escrowContractAddress}`);
		}
	} catch (e) {
		console.error("Seeding Failed:", e);
	} finally {
		await orm.close();
		process.exit(0);
	}
}

main();
