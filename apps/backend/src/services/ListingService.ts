import { EntityManager } from "@mikro-orm/core";
import {
	User,
	Listing,
	VerificationStatus,
	ListingStatus,
	Sponsor,
} from "@commertize/data";

export class ListingService {
	constructor(private readonly em: EntityManager) { }

	async createListing(user: User, data: any) {
		if (!user.sponsor || user.sponsor.status !== VerificationStatus.VERIFIED) {
			throw new Error("Only verified sponsors can create listings.");
		}

		const listing = new Listing();
		listing.sponsor = user.sponsor; // Link to Sponsor entity, not user
		listing.status = ListingStatus.PENDING_REVIEW;
		listing.name = data.name;
		// Map other fields as necessary, for now minimal for tests
		// real implementation would map all fields from `data`

		await this.em.persist(listing).flush();
		return listing;
	}

	async updateListing(user: User, listingId: string, data: any) {
		const listing = await this.em.findOne(
			Listing,
			{ id: listingId },
			{ populate: ["sponsor"] }
		);
		if (!listing) throw new Error("Listing not found");

		if (listing.sponsor.id !== user.sponsor?.id) {
			throw new Error("Unauthorized: You do not own this listing");
		}

		if (data.name) listing.name = data.name;
		// Map other fields

		await this.em.flush();
		return listing;
	}

	async withdrawListing(user: User, listingId: string) {
		const listing = await this.em.findOne(
			Listing,
			{ id: listingId },
			{ populate: ["sponsor"] }
		);
		if (!listing) throw new Error("Listing not found");

		if (listing.sponsor.id !== user.sponsor?.id) {
			throw new Error("Unauthorized: You do not own this listing");
		}

		if (
			[
				ListingStatus.ACTIVE,
				ListingStatus.FULLY_FUNDED,
				ListingStatus.TOKENIZING,
			].includes(listing.status)
		) {
			throw new Error("Cannot withdraw a listing that is active or funded.");
		}

		listing.status = ListingStatus.WITHDRAWN;
		await this.em.flush();
		return listing;
	}

	async resubmitListing(user: User, listingId: string) {
		const listing = await this.em.findOne(
			Listing,
			{ id: listingId },
			{ populate: ["sponsor"] }
		);
		if (!listing) throw new Error("Listing not found");

		if (listing.sponsor.id !== user.sponsor?.id) {
			throw new Error("Unauthorized: You do not own this listing");
		}

		if (listing.status !== ListingStatus.WITHDRAWN) {
			throw new Error("Only withdrawn listings can be resubmitted.");
		}

		listing.status = ListingStatus.PENDING_REVIEW;
		await this.em.flush();
		return listing;
	}

	async deleteListing(user: User, listingId: string) {
		const listing = await this.em.findOne(
			Listing,
			{ id: listingId },
			{ populate: ["sponsor"] }
		);
		if (!listing) throw new Error("Listing not found");

		if (listing.sponsor.id !== user.sponsor?.id) {
			throw new Error("Unauthorized: You do not own this listing");
		}

		const allowDeleteStatuses = [
			ListingStatus.DRAFT,
			ListingStatus.WITHDRAWN,
			ListingStatus.REJECTED,
		];

		if (!allowDeleteStatuses.includes(listing.status)) {
			throw new Error(
				"Cannot delete this listing. Only Draft, Withdrawn, or Rejected listings can be deleted."
			);
		}

		await this.em.remove(listing).flush();
	}

	async mintPropertyToken(listing: Listing) {
		// STUB: Minting Property Token via RPC (No-op for now)
		console.log(`[STUB] Minting property token for listing: ${listing.id}`);
	}
}
