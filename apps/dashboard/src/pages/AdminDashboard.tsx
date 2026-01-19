import { useSearchParams } from "react-router-dom";
import { FileText, ScrollText, Newspaper, Building2 } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";

// Import Admin Sub-Pages
import AdminReviews from "./admin/Reviews";
import AdminContracts from "./admin/Contracts";
import AdminNewsPage from "./AdminNews"; // Importing the default export
import AdminListings from "./admin/Listings"; // Import new page

// Tab Definitions
const TABS = [
	{ id: "reviews", label: "Reviews", icon: FileText, component: AdminReviews },
	{
		id: "contracts",
		label: "Contracts",
		icon: ScrollText,
		component: AdminContracts,
	},
	{
		id: "listings",
		label: "Listings",
		icon: Building2,
		component: AdminListings,
	},
	{ id: "news", label: "News", icon: Newspaper, component: AdminNewsPage },
];

export default function AdminDashboard() {
	const [searchParams, setSearchParams] = useSearchParams();
	const activeTabId = searchParams.get("tab") || "reviews";

	// Find active tab or default to first
	const activeTab = TABS.find((t) => t.id === activeTabId) || TABS[0];

	// Handle Tab Change
	const handleTabChange = (id: string) => {
		setSearchParams({ tab: id });
	};

	return (
		<DashboardLayout className="p-0">
			<div className="flex h-[calc(100vh-64px)]">
				{/* Sidebar */}
				<aside className="w-64 bg-white border-r border-slate-200 hidden md:block overflow-y-auto">
					<div className="p-6">
						<h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
							Admin Console
						</h2>
						<nav className="space-y-1">
							{TABS.map((tab) => {
								const Icon = tab.icon;
								const isActive = activeTab.id === tab.id;
								return (
									<button
										key={tab.id}
										onClick={() => handleTabChange(tab.id)}
										className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
											isActive
												? "bg-purple-50 text-purple-700"
												: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
										}`}
									>
										<Icon
											className={`w-5 h-5 ${isActive ? "text-purple-600" : "text-slate-400"}`}
										/>
										{tab.label}
									</button>
								);
							})}
						</nav>
					</div>
				</aside>

				{/* Main Content Area */}
				<main className="flex-1 overflow-y-auto">
					{/* Mobile Tab Selector (Visible only on small screens) */}
					<div className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
						<select
							value={activeTab.id}
							onChange={(e) => handleTabChange(e.target.value)}
							className="w-full p-2 border border-slate-300 rounded-md"
						>
							{TABS.map((tab) => (
								<option key={tab.id} value={tab.id}>
									{tab.label}
								</option>
							))}
						</select>
					</div>

					{/* Render Active Component */}
					<div className="h-full">
						{/* We render the component. Note: AdminNewsPage has its own container styling which might need override, but let's try direct render first. */}
						<activeTab.component />
					</div>
				</main>
			</div>
		</DashboardLayout>
	);
}
