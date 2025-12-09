import React from "react";
import styles from "./Chip.module.css";

interface ChipProps {
	children: React.ReactNode;
	active?: boolean;
	className?: string;
}

const Chip: React.FC<ChipProps> = ({ children, active, className }) => (
	<span
		className={`${styles.chip} ${active ? styles.chipActive : styles.chipInactive} ${className || ""}`}
	>
		{children}
	</span>
);

export default Chip;
