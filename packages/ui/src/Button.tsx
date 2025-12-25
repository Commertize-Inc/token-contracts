import React from "react";
import styles from "./Button.module.css";
import { LucideIcon } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outlined" | "text";
	width?: "auto" | "full";
	icon?: LucideIcon;
}

const Button: React.FC<ButtonProps> = ({
	children,
	variant = "primary",
	width = "auto",
	className = "",
	onClick,
	icon: Icon,
	style,
	...props
}) => {
	let variantClass = styles.btnPrimary;
	if (variant === "secondary") variantClass = styles.btnSecondary;
	if (variant === "outlined") variantClass = styles.btnOutlined;
	if (variant === "text") variantClass = styles.btnText;

	const widthClass = width === "full" ? styles.wFull : "";

	return (
		<button
			onClick={onClick}
			className={`${styles.buttonBase} ${variantClass} ${widthClass} ${className}`}
			style={style}
			{...props}
		>
			{children}
			{Icon && <Icon size={16} />}
		</button>
	);
};

export default Button;
