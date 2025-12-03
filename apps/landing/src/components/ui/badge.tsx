import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
	const baseStyles =
		"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none";

	const variants: Record<string, string> = {
		default: "border-transparent bg-[#D4A024] text-white",
		secondary: "border-transparent bg-gray-100 text-gray-900",
		destructive: "border-transparent bg-red-500 text-white",
		outline: "text-gray-900 border-gray-300",
	};

	return (
		<div
			className={`${baseStyles} ${variants[variant]} ${className}`}
			{...props}
		/>
	);
}

export { Badge };
