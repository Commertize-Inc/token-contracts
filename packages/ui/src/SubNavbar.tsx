import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./lib/utils";
import { ChevronLeft, Menu, ChevronDown } from "lucide-react";
import Tooltip from "./Tooltip";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const GOLD = "#DDB35F";

export interface SubNavbarItem {
	id: string; // Used for vertical navigation
	label: string;
	icon?: React.ElementType;
	offset?: number; // Used for horizontal scroll offset adjustment
	tabAction?: string; // Used for horizontal to switch tabs
	target?: string; // Alias for id (legacy FloatingNav support)
	items?: SubNavbarItem[]; // Nested items
}

export interface SubNavbarProps {
	items: SubNavbarItem[];
	offset?: number; // Vertical sticky offset
	className?: string;
	defaultCollapsed?: boolean;
	orientation?: "vertical" | "horizontal";
}

const SubNavbar: React.FC<SubNavbarProps> = ({
	items,
	offset = 180,
	className,
	defaultCollapsed = false,
	orientation = "vertical",
}) => {
	// Common state
	const [activeId, setActiveId] = useState<string>("");
	const [isClickScrolling, setIsClickScrolling] = useState(false);

	// Vertical state
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
	const [expandedItems, setExpandedItems] = useState<string[]>([]); // For vertical accordion

	// Horizontal state
	const [isVisible, setIsVisible] = useState(false);
	const [hasScrolledOnce, setHasScrolledOnce] = useState(false);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Detect mobile
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Scroll Logic
	useEffect(() => {
		const handleScroll = () => {
			if (orientation === "horizontal") {
				if (!hasScrolledOnce) setHasScrolledOnce(true);
				setIsVisible(false);

				if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
				scrollTimeoutRef.current = setTimeout(() => {
					setIsVisible(true);
				}, 300);
			} else {
				// Vertical logic
				if (isClickScrolling) return;

				requestAnimationFrame(() => {
					let currentId = "";

					// Helper to flatten items for scroll tracking
					const flattenItems = (items: SubNavbarItem[]): SubNavbarItem[] => {
						return items.reduce((acc, item) => {
							acc.push(item);
							if (item.items) {
								acc.push(...flattenItems(item.items));
							}
							return acc;
						}, [] as SubNavbarItem[]);
					};
					const allItems = flattenItems(items);

					if (
						window.innerHeight + window.scrollY >=
						document.documentElement.scrollHeight - 50
					) {
						if (allItems.length > 0) {
							const lastItem = allItems[allItems.length - 1];
							setActiveId(lastItem.id || lastItem.target || "");
							return;
						}
					}

					for (const item of allItems) {
						const itemId = item.id || item.target;
						if (!itemId) continue;

						const element = document.getElementById(itemId);
						if (element) {
							const rect = element.getBoundingClientRect();
							if (rect.top <= offset + 50) {
								currentId = itemId;
							}
						}
					}

					if (currentId && currentId !== activeId) {
						setActiveId(currentId);

						// Auto-expand parent if child is active (Vertical only)
						if (orientation === "vertical") {
							const findParent = (
								items: SubNavbarItem[],
								targetId: string
							): string | null => {
								for (const item of items) {
									if (item.items) {
										if (
											item.items.some(
												(child) => (child.id || child.target) === targetId
											)
										) {
											return item.id || item.target || null;
										}
										const found = findParent(item.items, targetId);
										if (found) return found; // Should probably return direct parent, but this logic is simple for now
									}
								}
								return null;
							};
							const parentId = findParent(items, currentId);
							if (parentId && !expandedItems.includes(parentId)) {
								setExpandedItems((prev) => [...prev, parentId]);
							}
						}
					} else if (!currentId && allItems.length > 0 && activeId === "") {
						const firstItem = allItems[0];
						const firstId = firstItem.id || firstItem.target;
						if (firstId) {
							const firstRect = document
								.getElementById(firstId)
								?.getBoundingClientRect();
							if (firstRect && firstRect.top > offset + 50) {
								setActiveId(firstId);
							}
						}
					}
				});
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });

		// Initial check
		if (orientation === "vertical") {
			handleScroll();
		}

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
		};
	}, [
		items,
		offset,
		activeId,
		isClickScrolling,
		orientation,
		hasScrolledOnce,
		expandedItems,
	]);

	const scrollToSection = (item: SubNavbarItem) => {
		const id = item.id || item.target;
		if (!id) return;

		setIsClickScrolling(true);
		if (orientation === "vertical") {
			setActiveId(id);
		}

		const element = document.getElementById(id);
		if (element) {
			// Calculate offset
			let finalOffset = 0;
			if (orientation === "vertical") {
				// For vertical, we stick to the top, so we subtract the offset
				finalOffset = -offset;
			} else {
				// For horizontal, items might have specific positive/negative offsets
				finalOffset = item.offset || 0;
			}

			const y =
				element.getBoundingClientRect().top + window.scrollY + finalOffset;

			window.scrollTo({ top: y, behavior: "smooth" });

			if (item.tabAction) {
				setTimeout(() => {
					const tabButton = document.querySelector(
						`button[data-tab="${item.tabAction}"]`
					) as HTMLButtonElement;
					if (tabButton) tabButton.click();
				}, 500);
			}

			setTimeout(() => {
				setIsClickScrolling(false);
			}, 1000);
		} else {
			setIsClickScrolling(false);
		}
	};

	const toggleExpanded = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setExpandedItems((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
		);
	};

	if (!items || items.length === 0) return null;

	// --- HORIZONTAL RENDER ---
	if (orientation === "horizontal") {
		return (
			<AnimatePresence>
				{isVisible && (
					<motion.div
						className={cn("fixed z-50 flex pointer-events-none", className)}
						style={{
							left: isMobile ? "50%" : 0,
							right: isMobile ? "auto" : 0,
							bottom: isMobile ? "20px" : "24px",
							width: isMobile ? "max-content" : "auto",
							maxWidth: isMobile ? "90vw" : "none",
							justifyContent: "center",
						}}
						initial={{ opacity: 0, y: 20, x: isMobile ? "-50%" : 0 }}
						animate={{ opacity: 1, y: 0, x: isMobile ? "-50%" : 0 }}
						exit={{ opacity: 0, y: 20, x: isMobile ? "-50%" : 0 }}
						transition={{ duration: 0.3, ease: "easeOut" }}
					>
						<div className="flex flex-col items-center pointer-events-auto max-w-full">
							<div
								className={cn(
									"flex items-center rounded-full shadow-lg border border-gray-200/50 backdrop-blur-md overflow-x-auto no-scrollbar max-w-full",
									isMobile ? "gap-0 px-1.5 py-1.5" : "gap-1 px-2 py-2"
								)}
								style={{ backgroundColor: "#FFFFFF" }}
							>
								{items.map((item) => {
									const key = item.id || item.target || item.label;
									const hasChildren = item.items && item.items.length > 0;

									const triggerButton = (
										<button
											// If it has children, clicking might just open menu or scroll?
											// Usually click scrolls, hover opens?
											// On mobile tap toggles.
											// Radix Dropdown handles trigger click.
											onClick={
												hasChildren ? undefined : () => scrollToSection(item)
											}
											onMouseEnter={() => setHoveredItem(item.label)}
											onMouseLeave={() => setHoveredItem(null)}
											className={cn(
												"relative rounded-full transition-colors duration-200 font-medium flex items-center gap-1 shrink-0",
												isMobile
													? "px-2 py-1.5 text-[11px]"
													: "px-4 py-2 text-sm"
											)}
											style={{
												color: hoveredItem === item.label ? GOLD : "#1A1A1A",
											}}
										>
											{hoveredItem === item.label && (
												<motion.div
													className="absolute inset-0 rounded-full"
													style={{ backgroundColor: `${GOLD}10` }}
													layoutId="hoverBg"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{ duration: 0.15 }}
												/>
											)}
											<span className="relative z-10">{item.label}</span>
											{hasChildren && (
												<ChevronDown className="w-3 h-3 relative z-10 opacity-50" />
											)}
										</button>
									);

									if (hasChildren) {
										return (
											<DropdownMenu.Root key={key}>
												<DropdownMenu.Trigger asChild>
													{triggerButton}
												</DropdownMenu.Trigger>
												<DropdownMenu.Portal>
													<DropdownMenu.Content
														className="bg-white rounded-xl shadow-xl border border-gray-100 p-1 min-w-[150px] z-[60] animate-in fade-in zoom-in-95 data-[side=top]:slide-in-from-bottom-2"
														sideOffset={8}
														side="top"
														align="center"
													>
														{item.items?.map((child) => (
															<DropdownMenu.Item
																key={child.id || child.target || child.label}
																className="text-sm text-gray-700 hover:text-[#DDB35F] hover:bg-[#DDB35F]/5 rounded-lg px-3 py-2 cursor-pointer outline-none transition-colors"
																onClick={() => scrollToSection(child)}
															>
																{child.label}
															</DropdownMenu.Item>
														))}
													</DropdownMenu.Content>
												</DropdownMenu.Portal>
											</DropdownMenu.Root>
										);
									}

									return (
										<React.Fragment key={key}>{triggerButton}</React.Fragment>
									);
								})}
							</div>
							{/* Removed indicator dot */}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		);
	}

	// --- VERTICAL RENDER ---

	// Helper for recursive vertical rendering
	const renderVerticalItem = (item: SubNavbarItem, level = 0) => {
		const itemId = item.id || item.target || "";
		// Check active: exact match or child active (if collapsed mechanism used)
		const isActive = activeId === itemId;
		const Icon = item.icon;
		const hasChildren = item.items && item.items.length > 0;
		const isExpanded = expandedItems.includes(itemId);

		const indent = level * 12;

		return (
			<React.Fragment key={itemId || item.label}>
				<button
					onClick={() => {
						if (hasChildren) {
							// If has children, scroll AND toggle
							if (itemId) scrollToSection(item);
							// Also toggle
							if (!isExpanded) {
								setExpandedItems((prev) => [...prev, itemId]);
							} else {
								setExpandedItems((prev) => prev.filter((i) => i !== itemId));
							}
						} else {
							scrollToSection(item);
						}
					}}
					className={cn(
						"group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 w-full text-left",
						isActive
							? "bg-[#D4A024]/10 text-[#D4A024] font-medium"
							: "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
						isCollapsed ? "justify-center px-2" : ""
					)}
					style={{ paddingLeft: !isCollapsed ? `${12 + indent}px` : undefined }}
					title={undefined}
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
							className="truncate flex-1"
						>
							{item.label}
						</motion.span>
					)}
					{!isCollapsed && hasChildren && (
						<div
							className="p-1 rounded-sm hover:bg-black/5"
							onClick={(e) => toggleExpanded(itemId, e)}
						>
							<ChevronDown
								className={cn(
									"w-4 h-4 transition-transform duration-200",
									isExpanded ? "rotate-180" : ""
								)}
							/>
						</div>
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

				{/* Children */}
				{!isCollapsed && hasChildren && isExpanded && (
					<div className="flex flex-col gap-1 w-full relative">
						{/* Optional: vertical line guide */}
						<div
							className="absolute bg-slate-200 w-px top-0 bottom-0"
							style={{ left: `${20 + indent}px` }}
						/>
						{item.items!.map((child) => renderVerticalItem(child, level + 1))}
					</div>
				)}
			</React.Fragment>
		);
	};

	return (
		<motion.div
			className={cn(
				"sticky z-30 flex flex-col gap-2 transition-all duration-300 self-start",
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
					// Top level items
					if (isCollapsed) {
						// Render tooltips
						return (
							<Tooltip
								key={item.id || item.target}
								content={item.label}
								side="right"
								className="w-full justify-center"
							>
								{/* Render simpler button for collapsed state */}
								<button
									onClick={() => scrollToSection(item)}
									className={cn(
										"group relative flex items-center justify-center p-2.5 rounded-lg text-sm transition-all duration-200 w-full",
										activeId === item.id
											? "bg-[#D4A024]/10 text-[#D4A024]"
											: "text-slate-500 hover:bg-slate-100"
									)}
								>
									{item.icon && <item.icon className="w-5 h-5" />}
									{!item.icon && (
										<span className="font-bold text-xs">
											{item.label.substring(0, 2)}
										</span>
									)}
								</button>
							</Tooltip>
						);
					}

					return renderVerticalItem(item);
				})}
			</div>
		</motion.div>
	);
};

export default SubNavbar;
