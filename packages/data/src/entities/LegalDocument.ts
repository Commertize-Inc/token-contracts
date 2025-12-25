import {
	Entity,
	PrimaryKey,
	Property as MikroProperty,
	Enum,
} from "@mikro-orm/core";
import { v4 } from "uuid";
import { LegalDocumentType, RelatedEntityType } from "../enums/entities";

@Entity({ tableName: "legal_document" })
export class LegalDocument {
	/** Unique identifier for the document. */
	@PrimaryKey()
	id: string = v4();

	/** ID of the entity this document is related to (User or Property). */
	@MikroProperty({ type: "uuid", index: true })
	relatedEntityId!: string;

	/** Type of the related entity (e.g., USER for KYC, PROPERTY for Deeds). */
	@Enum({ items: () => RelatedEntityType, index: true })
	relatedEntityType!: RelatedEntityType;

	/** Category of the document (Tax Form, OM, etc.). */
	@Enum({ items: () => LegalDocumentType })
	documentType!: LegalDocumentType;

	/** Storage URL for the document file. */
	@MikroProperty({ type: "string" })
	fileUrl!: string;

	@MikroProperty({ type: "date", onUpdate: () => new Date() })
	updatedAt: Date = new Date();
}
