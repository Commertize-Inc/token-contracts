import { MapView } from "./MapView";

export function ListingLocation({
	address,
	city,
	state,
	zipCode,
}: {
	address: string;
	city: string;
	state: string;
	zipCode: string;
}) {
	return (
		<div className="space-y-4">
			{/* Map View */}
			<div className="h-64 bg-slate-200 rounded-xl rounded-b-none overflow-hidden relative z-0">
				<MapView
					address={address}
					city={city}
					state={state}
					zipCode={zipCode}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
				<div>
					<h3 className="text-lg font-semibold text-slate-900 mb-4">
						Location Details
					</h3>
					<div className="space-y-3">
						<div className="flex justify-between py-2 border-b border-slate-100">
							<span className="text-slate-500">Address</span>
							<span className="text-slate-900 font-medium text-right">
								{address}
							</span>
						</div>
						<div className="flex justify-between py-2 border-b border-slate-100">
							<span className="text-slate-500">City / State</span>
							<span className="text-slate-900 font-medium text-right">
								{city}, {state}
							</span>
						</div>
						<div className="flex justify-between py-2 border-b border-slate-100">
							<span className="text-slate-500">Zip Code</span>
							<span className="text-slate-900 font-medium text-right">
								{zipCode}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
