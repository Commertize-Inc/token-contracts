"use client";

import { ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect, ReactNode } from "react";
import { Logo } from "./Logo";
import styles from "./Navbar.module.css";

export interface NavbarUser {
	email?: {
		address?: string;
	};
	wallet?: {
		address?: string;
	};
}

export interface NavbarProps {
	user?: NavbarUser | null;
	onLogout?: () => Promise<void> | void;
	logoHref?: string;
	showStatusIndicator?: boolean;
	LinkComponent?: React.ComponentType<{ href: string; className?: string; children: ReactNode }>;
}

const Navbar: React.FC<NavbarProps> = ({
	user,
	onLogout,
	logoHref = "/",
	showStatusIndicator = true,
	LinkComponent,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getUserDisplay = () => {
		if (user?.email?.address) {
			return user.email.address;
		}
		if (user?.wallet?.address) {
			const addr = user.wallet.address;
			return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
		}
		return "User";
	};

	const handleLogout = async () => {
		setIsDropdownOpen(false);
		if (onLogout) {
			await onLogout();
		}
	};

	// Use provided LinkComponent or default to anchor tag
	const LogoLink = LinkComponent || (({ href, className, children }) => (
		<a href={href} className={className}>
			{children}
		</a>
	));

	return (
		<nav className={styles.navbar}>
			<div className={styles.container}>
				<div className={styles.content}>
					<LogoLink href={logoHref} className={styles.logoLink}>
						<Logo />
					</LogoLink>

					{user && (
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
										<span className={styles.userName}>
											{getUserDisplay()}
										</span>
									</div>
									<ChevronDown
										className={`${styles.chevronIcon} ${
											isDropdownOpen ? styles.chevronIconOpen : ""
										}`}
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
													{user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
												</p>
											</div>
										)}

										{/* Logout Button */}
										{onLogout && (
											<button
												onClick={handleLogout}
												className={styles.logoutButton}
											>
												<LogOut className={styles.logoutIcon} />
												Sign Out
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
