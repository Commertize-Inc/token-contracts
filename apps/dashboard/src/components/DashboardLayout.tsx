import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface DashboardLayoutProps {
	children: ReactNode;
	className?: string; // Allow additional classes if needed
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
	return (
		<div className="min-h-screen bg-slate-50 relative">
			<Navbar />
			{/* Main Content Area */}
			{/* Added pt-6 for default top padding as requested */}
			<div className="flex">
				{/* Future Sidebar can go here */}

				<main className={`flex-1 w-full pt-6 ${className || ""}`}>
					{children}
				</main>
			</div>
		</div>
	);
}
