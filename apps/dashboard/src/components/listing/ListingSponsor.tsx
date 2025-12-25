import type { Listing } from "@commertize/data";
import { User as UserIcon, Shield, Trophy, Building } from "lucide-react";

export function ListingSponsor({ sponsor }: { sponsor: Listing["sponsor"] }) {
	if (!sponsor) {
		return (
			<div className="p-8 text-center bg-slate-50 rounded-lg">
				<p className="text-slate-500">Sponsor information not available.</p>
			</div>
		);
	}

	// Determine display name: Business Name > ID partial
	const displayName =
		sponsor.businessName || `Sponsor ${sponsor.id.slice(0, 8)}`;
	const joinYear = new Date(sponsor.createdAt).getFullYear();

	return (
		<div className="space-y-6">
			<div className="flex items-start gap-6">
				<div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
					<Building className="w-10 h-10 text-slate-400" />
				</div>
				<div>
					<h3 className="text-xl font-bold text-slate-900">{displayName}</h3>

					<div className="flex items-center gap-2 mt-2">
						<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
							<Shield className="w-3 h-3" /> Sponsor
						</span>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
				<div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
					<Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
					<p className="text-2xl font-bold text-slate-900">
						{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
						{(sponsor as any).stats?.activeDeals ?? 0}
					</p>
					<p className="text-xs text-slate-500">Active Deals</p>
				</div>
				<div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
					<Trophy className="w-6 h-6 text-slate-400 mx-auto mb-2" />
					<p className="text-2xl font-bold text-slate-900">
						{ }$
						{(
							(sponsor as any).stats?.assetsUnderManagement ?? 0
						).toLocaleString(undefined, { maximumFractionDigits: 0 })}
					</p>
					<p className="text-xs text-slate-500">Assets Under Mgmt</p>
				</div>
				<div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
					<UserIcon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
					<p className="text-2xl font-bold text-slate-900">{joinYear}</p>
					<p className="text-xs text-slate-500">Member Since</p>
				</div>
			</div>

			<div className="prose prose-slate max-w-none">
				<h4>About the Sponsor</h4>
				<p className="text-slate-600">
					{sponsor.bio ||
						`${displayName} is an experienced real estate operator with a focus on commercial and multi-family listings.`}
				</p>
			</div>
		</div>
	);
}
