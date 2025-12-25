import { HelpCircle } from "lucide-react";
import { ReactNode } from "react";

interface TooltipProps {
	content: string;
	children?: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
	return (
		<div className="relative inline-block group">
			<div className="flex items-center cursor-help text-slate-400 hover:text-slate-600 transition-colors">
				{children || <HelpCircle className="w-4 h-4" />}
			</div>
			<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center shadow-lg pointer-events-none">
				{content}
				<div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800" />
			</div>
		</div>
	);
}
