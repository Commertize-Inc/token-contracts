import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { usePrivy } from "@privy-io/react-auth";
import { DataTable, DataTableColumnHeader } from "@commertize/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ListingStatus } from "@commertize/data/enums";
import { Loader2, Building2 } from "lucide-react";

interface AdminListing {
	id: string;
	name: string;
	status: ListingStatus;
	images: string[];
	sponsor: {
		businessName: string;
	};
	isGasSponsored: boolean;
	createdAt: string;
}

export default function AdminListings() {
	const { getAccessToken } = usePrivy();
	const [listings, setListings] = useState<AdminListing[]>([]);
	const [loading, setLoading] = useState(true);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	const fetchListings = async () => {
		try {
			const token = await getAccessToken();
			if (!token) return;
			const data = await api.get("/admin/listings", token);
			// Backend returns { listings: [...] }
			setListings(data.listings);
		} catch (error) {
			console.error("Failed to fetch listings", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchListings();
	}, [getAccessToken]);

	const toggleGasSponsorship = async (listing: AdminListing) => {
		try {
			setTogglingId(listing.id);
			const token = await getAccessToken();
			if (!token) return;

			const newValue = !listing.isGasSponsored;
			await api.patch(
				`/admin/listings/${listing.id}`,
				{ isGasSponsored: newValue },
				token
			);

			setListings((prev) =>
				prev.map((l) =>
					l.id === listing.id ? { ...l, isGasSponsored: newValue } : l
				)
			);
		} catch (error) {
			console.error("Failed to toggle gas sponsorship", error);
		} finally {
			setTogglingId(null);
		}
	};

	const columns: ColumnDef<AdminListing>[] = [
		{
			id: "images",
			header: "Image",
			cell: ({ row }) => (
				<div className="w-10 h-10 rounded bg-slate-100 overflow-hidden">
					{row.original.images?.[0] ? (
						<img
							src={row.original.images[0]}
							alt={row.original.name}
							className="w-full h-full object-cover"
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<Building2 className="w-4 h-4 text-slate-300" />
						</div>
					)}
				</div>
			),
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Property Name" />
			),
			cell: ({ row }) => (
				<div>
					<div className="font-medium text-slate-900">{row.original.name}</div>
					<div className="text-xs text-slate-500">
						Sponsor: {row.original.sponsor?.businessName || "Unknown"}
					</div>
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
					{row.original.status.replace(/_/g, " ")}
				</span>
			),
		},
		{
			accessorKey: "isGasSponsored",
			header: "Gas Sponsorship",
			cell: ({ row }) => {
				const isSponsored = row.original.isGasSponsored;
				const isToggling = togglingId === row.original.id;

				return (
					<div className="flex items-center gap-2">
						<button
							onClick={() => toggleGasSponsorship(row.original)}
							disabled={isToggling}
							className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
								isSponsored ? "bg-purple-600" : "bg-slate-200"
							}`}
						>
							<span
								aria-hidden="true"
								className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
									isSponsored ? "translate-x-5" : "translate-x-0"
								}`}
							/>
						</button>
						<span className="text-sm text-slate-600">
							{isToggling ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : isSponsored ? (
								"On"
							) : (
								"Off"
							)}
						</span>
					</div>
				);
			},
		},
	];

	if (loading) {
		return (
			<div className="p-12 flex justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-slate-400" />
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-lg font-medium text-slate-900">
					Listing Management
				</h2>
				<p className="text-sm text-slate-500">
					Manage listing settings and configurations.
				</p>
			</div>
			<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
				<DataTable
					columns={columns}
					data={listings}
					view="table"
					filterColumnName="name"
					searchPlaceholder="Filter listings..."
				/>
			</div>
		</div>
	);
}
