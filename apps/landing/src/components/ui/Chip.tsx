import React from 'react';
import styles from './Chip.module.css';

interface ChipProps {
	children: React.ReactNode;
	active?: boolean;
}

const Chip: React.FC<ChipProps> = ({ children, active }) => (
	<span className={`${styles.chip} ${active ? styles.chipActive : styles.chipInactive}`}>
		{children}
	</span>
);

export default Chip;
