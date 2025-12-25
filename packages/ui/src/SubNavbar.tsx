import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "./lib/utils";
import { ChevronLeft, Menu } from "lucide-react";

export interface SubNavbarItem {
	id: string;
	label: string;
	icon?: React.ElementType;
}

export interface SubNavbarProps {
	items: SubNavbarItem[];
	offset?: number;
	className?: string;
	variant?: "horizontal" | "vertical";
	defaultCollapsed?: boolean;
}

const SubNavbar: React.FC<SubNavbarProps> = ({
	items,
	offset = 180,
	className,
	variant = "horizontal",
	defaultCollapsed = false,
}) => {
	const [activeId, setActiveId] = useState<string>("");
	const [isClickScrolling, setIsClickScrolling] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

	useEffect(() => {
		const handleScroll = () => {
			if (isClickScrolling) return;

			requestAnimationFrame(() => {
				let currentId = "";

				// Check if we are at the bottom of the page
				if (
					window.innerHeight + window.scrollY >=
					document.documentElement.scrollHeight - 50
				) {
					if (items.length > 0) {
						setActiveId(items[items.length - 1].id);
						return;
					}
				}

				for (const item of items) {
					const element = document.getElementById(item.id);
					if (element) {
						const rect = element.getBoundingClientRect();
						// Use slightly different offset logic depending on variant if needed
						// For now, keep it consistent
						if (rect.top <= offset + 50) {
							currentId = item.id;
						}
					}
				}

				if (currentId && currentId !== activeId) {
					setActiveId(currentId);
				} else if (!currentId && items.length > 0 && activeId === "") {
					const firstRect = document
						.getElementById(items[0].id)
						?.getBoundingClientRect();
					if (firstRect && firstRect.top > offset + 50) {
						setActiveId(items[0].id);
					}
				}
			});
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [items, offset, activeId, isClickScrolling]);

	const scrollToSection = (id: string) => {
		setIsClickScrolling(true);
		setActiveId(id);

		const element = document.getElementById(id);
		if (element) {
			const y = element.getBoundingClientRect().top + window.scrollY - offset;
			window.scrollTo({ top: y, behavior: "smooth" });

			setTimeout(() => {
				setIsClickScrolling(false);
			}, 1000);
		} else {
			setIsClickScrolling(false);
		}
	};

	if (!items || items.length === 0) return null;

	// VERTICAL LAYOUT (Sidebar / Table of Contents style)
	if (variant === "vertical") {
		return (
			<motion.div
				className={cn(
					"sticky z-30 flex flex-col gap-2 transition-all duration-300",
					isCollapsed ? "w-12 items-center" : "w-64",
					className
				)}
				style={{ top: `${offset}px` }}
				initial={false}
				animate={{ width: isCollapsed ? 48 : 256 }}
			>
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="mr-auto mb-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
					aria-label={isCollapsed ? "Expand" : "Collapse"}
				>
					{isCollapsed ? (
						<Menu className="w-5 h-5" />
					) : (
						<div className="flex flex-row text-xs font-medium uppercase tracking-wider">
							<ChevronLeft className="w-4 h-4" />
							<span>Contents</span>
						</div>
					)}
				</button>

				<div className="flex flex-col gap-1 w-full">
					{items.map((item) => {
						const isActive = activeId === item.id;
						const Icon = item.icon;

						return (
							<button
								key={item.id}
								onClick={() => scrollToSection(item.id)}
								className={cn(
									"group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 w-full text-left",
									isActive
										? "bg-[#D4A024]/10 text-[#D4A024] font-medium"
										: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
									isCollapsed ? "justify-center px-2" : ""
								)}
								title={isCollapsed ? item.label : undefined}
							>
								{Icon && (
									<Icon
										className={cn(
											"w-5 h-5 shrink-0 transition-colors",
											isActive
												? "text-[#D4A024]"
												: "text-slate-400 group-hover:text-slate-600"
										)}
									/>
								)}
								{!isCollapsed && (
									<motion.span
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -10 }}
										className="truncate"
									>
										{item.label}
									</motion.span>
								)}
								{isActive && !isCollapsed && (
									<motion.div
										layoutId="subNavbarVerticalIndicator"
										className="absolute left-0 top-2 bottom-2 w-1 bg-[#D4A024] rounded-r-full"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ duration: 0.2 }}
									/>
								)}
							</button>
						);
					})}
				</div>
			</motion.div>
		);
	}

	// HORIZONTAL LAYOUT (Original SubNavbar style)
	return (
		<div
			className={cn(
				"bg-white/80 backdrop-blur-md border-b border-slate-200/60",
				className
			)}
		>
			<div className="max-w-[90rem] mx-auto">
				<div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
					{items.map((item) => {
						const isActive = activeId === item.id;
						const Icon = item.icon; // Optional icon for horizontal too

						return (
							<button
								key={item.id}
								onClick={() => scrollToSection(item.id)}
								className={cn(
									"relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
									isActive
										? "text-[#D4A024]"
										: "text-slate-500 hover:text-slate-900"
								)}
							>
								{Icon && <Icon className="w-4 h-4" />}
								{/* Text Label */}
								<span className="relative z-10">{item.label}</span>

								{/* Animated Indicator */}
								{isActive && (
									<motion.div
										layoutId="subNavbarHorizontalIndicator"
										className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A024] rounded-t-full"
										initial={false}
										transition={{
											type: "spring",
											bounce: 0,
											duration: 0.3,
										}}
									/>
								)}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default SubNavbar;
