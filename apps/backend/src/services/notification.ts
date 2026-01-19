import { EntityManager } from "@mikro-orm/core";
import {
	EntityType,
	Notification,
	NotificationType,
	User,
} from "@commertize/data";

export class NotificationService {
	constructor(private readonly em: EntityManager) {}

	async createSubmissionUpdateNotification(
		type: EntityType,
		action: "APPROVE" | "REJECT" | "REQUEST_INFO",
		targetEntity: any,
		comment?: string
	): Promise<Notification | null> {
		let notifyUser: User | undefined;
		let notifySponsor: any | undefined; // Sponsor type
		let notifyTitle = "";
		let notifyLink = "/profile";

		if (type === EntityType.KYC) {
			notifyUser = targetEntity instanceof User ? targetEntity : undefined;
			notifyTitle = "KYC Verification Update";
			notifyLink = "/profile";
		} else if (type === EntityType.INVESTOR) {
			notifyUser = targetEntity instanceof User ? targetEntity : undefined;
			notifyTitle = "Investor Accreditation Update";
			notifyLink = "/profile";
		} else if (type === EntityType.SPONSOR) {
			notifyUser = targetEntity instanceof User ? targetEntity : undefined;
			notifyTitle = "Sponsor Verification Update";
			notifyLink = "/sponsor/dashboard";
		} else if (type === EntityType.LISTING) {
			// targetEntity is Listing
			// Notify the sponsor directly
			notifySponsor = targetEntity.sponsor;
			notifyTitle = `Listing Update: ${targetEntity.name}`;
			notifyLink = `/listings/${targetEntity.id}/edit`;
		}

		if (!notifyUser && !notifySponsor) return null;

		let notifyMessage = "";
		let notifyType = NotificationType.INFO;

		if (action === "APPROVE") {
			notifyMessage = `Your ${type.toLowerCase()} submission has been approved.`;
			notifyType = NotificationType.SUCCESS;
		} else if (action === "REJECT") {
			notifyMessage = `Your ${type.toLowerCase()} submission was declined.`;
			notifyType = NotificationType.ERROR;
		} else if (action === "REQUEST_INFO") {
			notifyMessage = `Action required: Additional information requested for your ${type.toLowerCase()} submission.`;
			notifyType = NotificationType.WARNING;
		}

		if (comment) {
			notifyMessage += ` Feedback: "${comment}"`;
		}

		const notification = this.em.create(Notification, {
			user: notifyUser,
			sponsor: notifySponsor,
			title: notifyTitle,
			message: notifyMessage,
			type: notifyType,
			link: notifyLink,
			createdAt: new Date(),
			isRead: false,
		});

		this.em.persist(notification);
		return notification;
	}
}
