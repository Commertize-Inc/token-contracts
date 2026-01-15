import React, { ReactNode } from "react";
import { cn } from "./lib/utils";

interface TooltipProps {
	content: string;
	children: ReactNode;
	side?: "top" | "right" | "bottom" | "left";
	className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
	content,
	children,
	side = "top",
	className,
}) => {
	const positionClasses = {
		top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
		right: "left-full top-1/2 -translate-y-1/2 ml-2",
		bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
		left: "right-full top-1/2 -translate-y-1/2 mr-2",
	};

	const arrowClasses = {
		top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent",
		right:
			"right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent",
		bottom:
			"bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-800 border-l-transparent border-r-transparent border-t-transparent",
		left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-800 border-t-transparent border-b-transparent border-r-transparent",
	};

	return (
		<div className={cn("relative flex items-center group", className)}>
			{children}
			<div
				className={cn(
					"absolute whitespace-nowrap px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none",
					positionClasses[side]
				)}
			>
				{content}
				<div className={cn("absolute border-4", arrowClasses[side])} />
			</div>
		</div>
	);
};

export default Tooltip;
