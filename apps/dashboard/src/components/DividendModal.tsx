import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Loader2, History } from "lucide-react";
import {
	Button,
	Input,
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@commertize/ui";
import { api } from "../lib/api";
import { usePrivy } from "@privy-io/react-auth";

interface DividendModalProps {
	isOpen: boolean;
	onClose: () => void;
	listingId: string;
	listingName: string;
	onSuccess: () => void;
}

export function DividendModal({
	isOpen,
	onClose,
	listingId,
	listingName,
	onSuccess,
}: DividendModalProps) {
	const { getAccessToken } = usePrivy();
	const [amount, setAmount] = useState("");
	const [date, setDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [dividends, setDividends] = useState<any[]>([]);
	const [loadingHistory, setLoadingHistory] = useState(false);

	useEffect(() => {
		if (isOpen && listingId) {
			fetchHistory();
		}
	}, [isOpen, listingId]);

	const fetchHistory = async () => {
		setLoadingHistory(true);
		try {
			const token = await getAccessToken();
			const data = await api.get(`/dividends/${listingId}`, token);
			setDividends(data);
		} catch (err) {
			console.error("Error fetching dividend history", err);
		} finally {
			setLoadingHistory(false);
		}
	};

	if (!isOpen) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const token = await getAccessToken();
			await api.post(
				"/dividends",
				{
					listingId,
					amount: parseFloat(amount),
					distributionDate: date,
				},
				token
			);
			onSuccess();
			// Refresh history
			fetchHistory();
			// onClose(); // Keep open to show success/history
			setAmount("");
			setDate("");
		} catch (err: any) {
			console.error("Error issuing dividend:", err);
			setError(err.message || "Failed to issue dividend");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[50] flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
			<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				<h2 className="text-xl font-bold text-slate-900 mb-1">
					Issue Dividend
				</h2>
				<p className="text-sm text-slate-500 mb-6">
					Distribute returns to investors for {listingName}.
				</p>

				{error && (
					<div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">
							Amount per Token ($) or Total Amount?
						</label>
						<p className="text-xs text-slate-500 mb-2">
							Enter the total amount to be distributed.
						</p>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<DollarSign className="h-4 w-4 text-slate-400" />
							</div>
							<Input
								type="number"
								required
								min="0.01"
								step="0.01"
								value={amount}
								onChange={(e: any) => setAmount(e.target.value)}
								className="pl-10"
								placeholder="0.00"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-slate-700 mb-1">
							Distribution Date
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Calendar className="h-4 w-4 text-slate-400" />
							</div>
							<Input
								type="date"
								required
								value={date}
								onChange={(e: any) => setDate(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					<div className="pt-2">
						<Button
							type="submit"
							className="w-full justify-center"
							disabled={loading}
						>
							{loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
							Issue Dividend
						</Button>
					</div>
				</form>

				<div className="mt-8 border-t border-slate-200 pt-6">
					<h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
						<History className="w-5 h-5 mr-2" />
						Distribution History
					</h3>

					{loadingHistory ? (
						<div className="flex justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin text-slate-400" />
						</div>
					) : dividends.length === 0 ? (
						<p className="text-sm text-slate-500 text-center py-4">
							No dividends distributed yet.
						</p>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Date</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{dividends.map((div) => (
										<TableRow key={div.id}>
											<TableCell>
												{new Date(div.distributionDate).toLocaleDateString()}
											</TableCell>
											<TableCell className="font-medium">
												${parseFloat(div.amount).toLocaleString()}
											</TableCell>
											<TableCell>
												<span
													className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
														div.status === "distributed"
															? "bg-green-100 text-green-800"
															: "bg-yellow-100 text-yellow-800"
													}`}
												>
													{div.status}
												</span>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
