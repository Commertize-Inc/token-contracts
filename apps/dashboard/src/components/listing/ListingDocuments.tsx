import { FileText, Download, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@commertize/ui";

export function ListingDocuments({ documents }: { documents: string[] }) {
	return (
		<div className="space-y-6">
			<div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
				<ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
				<div>
					<h4 className="font-medium text-blue-900">Due Diligence Verified</h4>
					<p className="text-sm text-blue-700 mt-1">
						All documents have been reviewed by our compliance team. Please
						review the Offering Circular carefully before investing.
					</p>
				</div>
			</div>

			{documents.length > 0 ? (
				<div className="space-y-3">
					{documents.map((doc, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
						>
							<div className="flex items-center gap-4">
								<div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
									<FileText className="w-6 h-6" />
								</div>
								<div>
									<h4 className="font-medium text-slate-900">
										Property Document {index + 1}
									</h4>
									<p className="text-xs text-slate-500">PDF • 2.4 MB</p>
								</div>
							</div>
							<Button
								variant="outlined"
								className="gap-2"
								onClick={() => window.open(doc, "_blank")}
							>
								<Download className="w-4 h-4" /> Download
							</Button>
						</div>
					))}
				</div>
			) : (
				<div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
					<AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
					<p className="text-slate-500">
						No public documents available for this property.
					</p>
				</div>
			)}
		</div>
	);
}
