import React from 'react';
import styles from './Logo.module.css';
import { Building } from 'lucide-react';

interface LogoProps {
	className?: string;
	theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "", theme = "dark" }) => (
	<div className={`${styles.logo} ${className}`}>
		<div className={styles.logoIcon}>
			<Building size={20} strokeWidth={2.5} />
		</div>
		<span className={`${styles.logoText} ${theme === 'light' ? styles.logoTextWhite : ''}`}>COMMERTIZE</span>
	</div>
);

export default Logo;
