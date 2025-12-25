import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Badge,
	Card,
	CardHeader,
	CardTitle,
} from "@commertize/ui";
import { InvestmentStatus } from "@commertize/data/enums"; // Ensure this package is in dependencies

interface Investment {
	id: string;
	amountUsdc: string;
	tokenCount: number;
	status: InvestmentStatus;
	createdAt: string;
	property: {
		name: string;
		tokenContractAddress?: string;
	};
}

interface InvestmentListProps {
	investments: Investment[];
}

export function InvestmentList({ investments }: InvestmentListProps) {
	if (!investments || investments.length === 0) {
		return (
			<div className="text-center p-8 text-muted-foreground border rounded-lg bg-muted/20">
				You have no active investments yet.
			</div>
		);
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Your Portfolio</CardTitle>
			</CardHeader>
			<div className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Listing</TableHead>
							<TableHead>Tokens</TableHead>
							<TableHead>Amount (USDC)</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{investments.map((inv) => (
							<TableRow key={inv.id}>
								<TableCell className="font-medium">
									{inv.property.name}
								</TableCell>
								<TableCell>{inv.tokenCount.toLocaleString()}</TableCell>
								<TableCell>
									${parseFloat(inv.amountUsdc).toLocaleString()}
								</TableCell>
								<TableCell>
									{new Date(inv.createdAt).toLocaleDateString()}
								</TableCell>
								<TableCell>
									<Badge
										variant={
											inv.status === InvestmentStatus.COMPLETED
												? "default"
												: "secondary"
										}
									>
										{inv.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}
