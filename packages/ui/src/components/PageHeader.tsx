import React from "react";
import { cn } from "../lib/utils";

export interface PageHeaderProps {
	title: string | React.ReactNode;
	subtitle?: string | React.ReactNode;
	actions?: React.ReactNode;
	breadcrumbs?: React.ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	subtitle,
	actions,
	breadcrumbs,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6",
				className
			)}
		>
			<div className="flex-1 space-y-1.5">
				{breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
				<h1 className="text-3xl md:text-4xl font-light text-gray-900 tracking-tight">
					{title}
				</h1>
				{subtitle && (
					<p className="text-lg font-light text-gray-500 max-w-4xl">
						{subtitle}
					</p>
				)}
			</div>
			{actions && (
				<div className="flex items-center gap-3 shrink-0">{actions}</div>
			)}
		</div>
	);
}
