import { ListingStatus } from "@commertize/data/enums";
import {
	Alert,
	Badge,
	Card,
	DataTable,
	PageContainer,
	PageHeader,
} from "@commertize/ui";
import { usePrivy } from "@privy-io/react-auth";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type ContractsData = {
	contracts: {
		factory: string;
		identityRegistry: string;
		compliance: string;
	};
	network: {
		rpcUrl: string;
		explorerUrl: string;
	};
};

type ListingContract = {
	id: string;
	name: string;
	status: ListingStatus;
	tokenContractAddress?: string;
	description?: string;
};

export default function AdminContracts() {
	const { getAccessToken } = usePrivy();
	const [contracts, setContracts] = useState<ContractsData | null>(null);
	const [listings, setListings] = useState<ListingContract[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const token = await getAccessToken();
				if (!token) return;

				// Fetch Protocol Contracts
				const contractsData = await api.get("admin/contracts", token);
				setContracts(contractsData);

				// Fetch Submissions (Listings) to filter for Tokenized ones
				// We reuse admin/submissions for now, filtering locally
				// Ideally, a specific endpoint is better, but this works for MVP
				const submissionsData = await api.get(
					"admin/submissions?includeFinalized=true",
					token
				);

				// Filter listings that have tokens or are active
				// submissionsData.submissions is the array
				const listingItems = submissionsData.submissions
					.filter(
						(s: any) =>
							s.type === "LISTING" &&
							(s.status === "ACTIVE" || s.details?.tokenContractAddress)
					)
					.map((s: any) => ({
						id: s.id,
						name: s.title.replace("Listing: ", ""),
						status: s.status,
						tokenContractAddress: s.details?.tokenContractAddress,
						description: s.details?.description,
					}));

				setListings(listingItems);
			} catch (err: any) {
				console.error("Error fetching data", err);
				setError("Failed to load contract data.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [getAccessToken]);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopied(text);
		setTimeout(() => setCopied(null), 2000);
	};

	const ExplorerLink = ({
		address,
		label,
	}: {
		address: string;
		label?: string;
	}) => {
		if (!contracts?.network.explorerUrl)
			return <span className="text-xs font-mono">{address}</span>;
		return (
			<a
				href={`${contracts.network.explorerUrl}/address/${address}`}
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
			>
				<span className="font-mono text-xs">{label || address}</span>
				<ExternalLink className="w-3 h-3" />
			</a>
		);
	};

	const columns: ColumnDef<ListingContract>[] = [
		{
			accessorKey: "name",
			header: "Property Name",
			cell: ({ row }) => (
				<div>
					<div className="font-medium">{row.original.name}</div>
					<div className="text-xs text-muted-foreground truncate max-w-[200px]">
						{row.original.description}
					</div>
				</div>
			),
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					variant={row.original.status === "ACTIVE" ? "default" : "destructive"}
				>
					{row.original.status}
				</Badge>
			),
		},
		{
			header: "Token Address",
			accessorKey: "tokenContractAddress",
			cell: ({ row }) => {
				const address = row.original.tokenContractAddress;
				if (!address)
					return (
						<span className="text-muted-foreground text-xs">Not Deployed</span>
					);
				return (
					<div className="flex items-center gap-2">
						<ExplorerLink
							address={address}
							label={`${address.substring(0, 6)}...${address.substring(38)}`}
						/>
						<button
							onClick={() => copyToClipboard(address)}
							className="text-muted-foreground hover:text-foreground"
						>
							{copied === address ? (
								<Check className="w-3 h-3 text-green-500" />
							) : (
								<Copy className="w-3 h-3" />
							)}
						</button>
					</div>
				);
			},
		},
	];

	return (
		<PageContainer>
			<PageHeader
				title="Smart Contracts"
				subtitle="Monitor protocol contracts and deployed assets."
			/>
			{loading ? (
				<div className="flex justify-center p-12">
					<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				</div>
			) : error ? (
				<Alert
					type="error"
					message={error}
					isOpen={false}
					onClose={() => setError(null)}
					title={"Error"}
				/>
			) : (
				<div className="space-y-8">
					{/* Protocol Contracts */}
					<section>
						<h3 className="text-lg font-semibold mb-4">
							Protocol Configuration
						</h3>
						<div className="grid gap-4 md:grid-cols-3">
							<Card className="p-6">
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Token Factory
								</h4>
								<div className="flex items-center justify-between">
									<div className="truncate mr-2">
										<ExplorerLink
											address={contracts?.contracts.factory || ""}
											label={contracts?.contracts.factory}
										/>
									</div>
									<button
										onClick={() =>
											copyToClipboard(contracts?.contracts.factory || "")
										}
									>
										{copied === contracts?.contracts.factory ? (
											<Check className="w-4 h-4 text-green-500" />
										) : (
											<Copy className="w-4 h-4 text-muted-foreground" />
										)}
									</button>
								</div>
							</Card>
							<Card className="p-6">
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Identity Registry
								</h4>
								<div className="flex items-center justify-between">
									<div className="truncate mr-2">
										<ExplorerLink
											address={contracts?.contracts.identityRegistry || ""}
											label={contracts?.contracts.identityRegistry}
										/>
									</div>
									<button
										onClick={() =>
											copyToClipboard(
												contracts?.contracts.identityRegistry || ""
											)
										}
									>
										{copied === contracts?.contracts.identityRegistry ? (
											<Check className="w-4 h-4 text-green-500" />
										) : (
											<Copy className="w-4 h-4 text-muted-foreground" />
										)}
									</button>
								</div>
							</Card>
							<Card className="p-6">
								<h4 className="text-sm font-medium text-muted-foreground mb-2">
									Compliance Registry
								</h4>
								<div className="flex items-center justify-between">
									<div className="truncate mr-2">
										<ExplorerLink
											address={contracts?.contracts.compliance || ""}
											label={contracts?.contracts.compliance}
										/>
									</div>
									<button
										onClick={() =>
											copyToClipboard(contracts?.contracts.compliance || "")
										}
									>
										{copied === contracts?.contracts.compliance ? (
											<Check className="w-4 h-4 text-green-500" />
										) : (
											<Copy className="w-4 h-4 text-muted-foreground" />
										)}
									</button>
								</div>
							</Card>
						</div>
						<div className="mt-2 text-xs text-muted-foreground">
							Network:{" "}
							<span className="font-mono">{contracts?.network.rpcUrl}</span>
						</div>
					</section>

					{/* Deployed Listings */}
					<section>
						<h3 className="text-lg font-semibold mb-4">Deployed Assets</h3>
						<Card className="overflow-hidden">
							<DataTable
								columns={columns}
								data={listings}
								searchPlaceholder="Search assets..."
							/>
						</Card>
					</section>
				</div>
			)}
		</PageContainer>
	);
}
