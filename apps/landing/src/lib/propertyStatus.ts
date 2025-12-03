export const PROPERTY_STATUS = {
	LIVE: "Live",
	COMING_SOON: "Coming Soon",
	FULLY_FUNDED: "Fully Funded",
	CLOSED: "Closed",
	PENDING: "Pending",
} as const;

export type PropertyStatus =
	(typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS];
