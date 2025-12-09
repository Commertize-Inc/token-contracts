import { getEM } from "./index";
import { Waitlist, WaitlistType } from "@commertize/data";

export type CreateWaitlistData = {
	email: string;
	type: WaitlistType;
	phone?: string;
	country?: string;
	city?: string;
	investmentAmount?: string;
	investmentTimeframe?: string;
	propertyTypes?: string;
	experience?: string;
	fullName?: string;
	company?: string;
	propertyName?: string;
	propertyLocation?: string;
	assetType?: string;
	estimatedValue?: string;
	capitalNeeded?: string;
	timeline?: string;
	hearAboutUs?: string;
	additionalInfo?: string;
	message?: string;
};

export async function createWaitlistEntry(
	data: CreateWaitlistData
): Promise<Waitlist> {
	const em = await getEM();
	const entry = em.create(Waitlist, {
		...data,
		createdAt: new Date(),
	});
	await em.persistAndFlush(entry);
	return entry;
}
