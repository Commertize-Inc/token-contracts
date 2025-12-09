import React, { ReactNode } from "react";
import styles from "./BentoBox.module.css";

export interface BentoBoxProps {
	children: ReactNode;
	footer?: ReactNode;
	className?: string;
	onClick?: () => void;
}

const BentoBox: React.FC<BentoBoxProps> = ({
	children,
	footer,
	className = "",
	onClick,
}) => {
	return (
		<div
			className={`${styles.card} ${className}`}
			onClick={onClick}
		>
			<div>
				{children}
			</div>
			{footer && (
				<div className="mt-6 pt-6 border-t border-gray-100">
					{footer}
				</div>
			)}
		</div>
	);
};

export default BentoBox;
