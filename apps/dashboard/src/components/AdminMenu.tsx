import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FileText, ScrollText, Newspaper } from "lucide-react";

export function AdminMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close on click outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
			>
				Admin
				<ChevronDown
					className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
					<div className="py-1">
						<Link
							to="/admin/reviews"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
						>
							<FileText className="w-4 h-4" />
							Reviews
						</Link>
						<Link
							to="/admin/contracts"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
						>
							<ScrollText className="w-4 h-4" />
							Contracts
						</Link>
						<Link
							to="/admin/news"
							onClick={() => setIsOpen(false)}
							className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
						>
							<Newspaper className="w-4 h-4" />
							News
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
