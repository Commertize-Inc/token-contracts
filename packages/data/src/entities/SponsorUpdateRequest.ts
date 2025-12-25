import { Entity, Property, ManyToOne } from "@mikro-orm/core";
import { Sponsor } from "./Sponsor";
import { VerificationRequest } from "./VerificationRequest";

@Entity({ tableName: "sponsor_update_request" })
export class SponsorUpdateRequest extends VerificationRequest {
	@ManyToOne(() => Sponsor)
	sponsor!: Sponsor;

	@Property({ type: "json" })
	requestedChanges!: {
		businessName?: string;
		businessType?: string;
		ein?: string;
		address?: string;
	};
}
