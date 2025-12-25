"use client";

import { ChevronDown, LogOut, User, Layers } from "lucide-react";
import { useState, useRef, useEffect, ReactNode } from "react";
import styles from "./UserMenu.module.css";

export interface NavbarUser {
	email?: {
		address?: string;
	};
	wallet?: {
		address?: string;
	};
}

export interface UserMenuProps {
	user?: NavbarUser | null;
	username?: string;
	onLogout?: () => Promise<void> | void;
	showStatusIndicator?: boolean;
	LinkComponent?: React.ComponentType<{
		href: string;
		className?: string;
		children: ReactNode;
	}>;
}

// Default link component
const DefaultLink: React.FC<{
	href: string;
	className?: string;
	children: ReactNode;
}> = ({ href, className, children }) => (
	<a href={href} className={className}>
		{children}
	</a>
);

export const UserMenu: React.FC<UserMenuProps> = ({
	user,
	username,
	onLogout,
	showStatusIndicator = true,
	LinkComponent,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getUserDisplay = () => {
		if (username) {
			return `@${username}`;
		}
		if (user?.email?.address) {
			return user.email.address;
		}
		if (user?.wallet?.address) {
			const addr = user.wallet.address;
			return `${addr.slice(0, 6)}...${addr.slice(-4)} `;
		}
		return "User";
	};

	const handleLogout = async () => {
		setIsDropdownOpen(false);
		if (onLogout) {
			await onLogout();
		}
	};

	const ProfileLink = LinkComponent || DefaultLink;

	if (!user) return null;

	return (
		<div className={styles.userSection}>
			{/* User Status Indicator */}
			{showStatusIndicator && (
				<div className={styles.statusIndicator}>
					<div className={styles.statusDot}></div>
					<span className={styles.statusText}>Connected</span>
				</div>
			)}

			{/* User Dropdown */}
			<div className={styles.dropdownContainer} ref={dropdownRef}>
				<button
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className={styles.dropdownButton}
				>
					<div className={styles.userInfo}>
						<div className={styles.userAvatar}>
							<User className={styles.userAvatarIcon} />
						</div>
						<span className={styles.userName}>{getUserDisplay()}</span>
					</div>
					<ChevronDown
						className={`${styles.chevronIcon} ${
							isDropdownOpen ? styles.chevronIconOpen : ""
						} `}
					/>
				</button>

				{/* Dropdown Menu */}
				{isDropdownOpen && (
					<div className={styles.dropdownMenu}>
						{/* User Info Section */}
						<div className={styles.userInfoSection}>
							<p className={styles.userInfoLabel}>Signed in as</p>
							<p className={styles.userInfoValue}>
								{user?.email?.address || user?.wallet?.address}
							</p>
						</div>

						{/* Wallet Address (if applicable) */}
						{user?.wallet?.address && user?.email?.address && (
							<div className={styles.walletSection}>
								<p className={styles.walletLabel}>Wallet</p>
								<p className={styles.walletAddress}>
									{user.wallet.address.slice(0, 6)}...
									{user.wallet.address.slice(-4)}
								</p>
							</div>
						)}

						{/* Profile Link */}
						<ProfileLink href="/profile" className={styles.profileLink}>
							<User className={styles.profileIcon} />
							Profile
						</ProfileLink>

						{/* Submissions Link */}
						<ProfileLink href="/submissions" className={styles.profileLink}>
							<Layers className={styles.profileIcon} />
							My Submissions
						</ProfileLink>

						{/* Logout Button */}
						{onLogout && (
							<button onClick={handleLogout} className={styles.logoutButton}>
								<LogOut className={styles.logoutIcon} />
								Sign Out
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default UserMenu;
