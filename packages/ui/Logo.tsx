import React from 'react';
import styles from './Logo.module.css';
import { Building } from 'lucide-react';

interface LogoProps {
	className?: string;
	theme?: 'light' | 'dark';
	src?: string;
	alt?: string;
	width?: number;
	height?: number;
}

const Logo: React.FC<LogoProps> = ({
	className = "",
	theme = "dark",
	src,
	alt = "Commertize",
	width = 120,
	height = 40
}) => {
	// If image src is provided, use the image instead of icon + text
	if (src) {
		return (
			<img
				src={src}
				alt={alt}
				width={width}
				height={height}
				className={`${styles.logoImage} ${className}`}
			/>
		);
	}

	// Fallback to icon + text
	return (
		<div className={`${styles.logo} ${className}`}>
			<div className={styles.logoIcon}>
				<Building size={20} strokeWidth={2.5} />
			</div>
			<span className={`${styles.logoText} ${theme === 'light' ? styles.logoTextWhite : ''}`}>COMMERTIZE</span>
		</div>
	);
};

export default Logo;
