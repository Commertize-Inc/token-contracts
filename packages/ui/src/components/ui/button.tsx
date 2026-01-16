import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center white-space-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				gold: "bg-[#D4A024] text-white hover:bg-[#B8881C]",
				// Aliases for backward compatibility
				primary: "bg-primary text-primary-foreground hover:bg-primary/90",
				text: "hover:bg-accent hover:text-accent-foreground",
				outlined:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	asChild?: boolean;
	width?: "full" | "auto";
	loading?: boolean;
	icon?: LucideIcon;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, width, loading, icon: Icon, children, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		const widthClass = width === "full" ? "w-full" : "";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }), widthClass)}
				ref={ref}
				disabled={props.disabled || loading}
				{...props}
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{!loading && Icon && <Icon className="mr-2 h-4 w-4" />}
				{children}
			</Comp>
		);
	}
);
Button.displayName = "Button";

export { Button, buttonVariants };
