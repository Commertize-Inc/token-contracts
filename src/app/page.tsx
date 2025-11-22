"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
	Building,
	Wallet,
	LayoutDashboard,
	PieChart,
	FileText,
	Settings,
	LogOut,
	TrendingUp,
	ShieldCheck,
	ChevronRight,
	Menu,
	X,
	Bell,
	Search,
	Filter,
	DollarSign,
	Activity
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

// --- Mock Data ---
const MOCK_PROPERTIES = [
	{ id: 1, title: 'Highland Logistics Hub', type: 'Industrial', location: 'Austin, TX', return: '12.5%', funded: 78, min: '25k', valuation: '42.5M' },
	{ id: 2, title: 'Azure Bay Residences', type: 'Multi-Family', location: 'Miami, FL', return: '9.2%', funded: 100, min: '10k', valuation: '18.2M' },
	{ id: 3, title: 'Tech Park Plaza', type: 'Office', location: 'San Francisco, CA', return: '14.0%', funded: 35, min: '50k', valuation: '115M' },
	{ id: 4, title: 'Meridian Cold Storage', type: 'Industrial', location: 'Chicago, IL', return: '11.8%', funded: 12, min: '25k', valuation: '33.1M' },
];

const MOCK_STATS = [
	{ label: 'Assets Tokenized', value: '$1.2B' },
	{ label: 'Target APY', value: '11.4%' },
	{ label: 'Global Investors', value: '14,000+' },
];

// --- Specialized UI Components ---

interface SectionHeadingProps {
	subtitle: string;
	title: string;
	align?: 'center' | 'left';
}

const SectionHeading = ({ subtitle, title, align = 'center' }: SectionHeadingProps) => (
	<div className={`${styles.sectionHeading} ${align === 'center' ? styles.sectionHeadingCenter : styles.sectionHeadingLeft}`}>
		<div className={styles.subtitle}>{subtitle}</div>
		<h2 className={styles.title}>{title}</h2>
	</div>
);

// --- Sections ---

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [intelligenceOpen, setIntelligenceOpen] = useState(false);
	const [companyOpen, setCompanyOpen] = useState(false);
	const intelligenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const companyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
			if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
		};
	}, []);

	return (
		<nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : styles.navbarTransparent}`}>
			<div className={styles.container}>
				<div className={styles.flexBetween}>
					{/* Logo with Image */}
					<Link href="/" className={styles.logoLink}>
						<Image src="/assets/logo.png" alt="Commertize" width={120} height={40} className={styles.logoImage} />
					</Link>

					<div className={styles.navLinks}>
						<button className={styles.navLink}>Mission</button>
						<button className={styles.navLink}>Marketplace</button>
						<button className={styles.navLink}>Nexus</button>
						<button className={styles.navLink}>OmniGrid</button>

						{/* Intelligence Dropdown */}
						<div
							className={styles.navDropdown}
							onMouseEnter={() => {
								if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
								setIntelligenceOpen(true);
							}}
							onMouseLeave={() => {
								intelligenceTimeoutRef.current = setTimeout(() => {
									setIntelligenceOpen(false);
								}, 150);
							}}
						>
							<button className={styles.navLinkDropdown}>
								Intelligence
								<ChevronRight size={12} className={styles.chevron} style={{ transform: intelligenceOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
							</button>
							{intelligenceOpen && (
								<div
									className={styles.dropdownMenu}
									onMouseEnter={() => {
										if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
									}}
									onMouseLeave={() => {
										intelligenceTimeoutRef.current = setTimeout(() => {
											setIntelligenceOpen(false);
										}, 150);
									}}
								>
									<a href="#" className={styles.dropdownItem}>Market Analytics</a>
									<a href="#" className={styles.dropdownItem}>AI Insights</a>
									<a href="#" className={styles.dropdownItem}>Reports</a>
								</div>
							)}
						</div>

						{/* Company Dropdown */}
						<div
							className={styles.navDropdown}
							onMouseEnter={() => {
								if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
								setCompanyOpen(true);
							}}
							onMouseLeave={() => {
								companyTimeoutRef.current = setTimeout(() => {
									setCompanyOpen(false);
								}, 150);
							}}
						>
							<button className={styles.navLinkDropdown}>
								Company
								<ChevronRight size={12} className={styles.chevron} style={{ transform: companyOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} />
							</button>
							{companyOpen && (
								<div
									className={styles.dropdownMenu}
									onMouseEnter={() => {
										if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
									}}
									onMouseLeave={() => {
										companyTimeoutRef.current = setTimeout(() => {
											setCompanyOpen(false);
										}, 150);
									}}
								>
									<a href="#" className={styles.dropdownItem}>About Us</a>
									<a href="#" className={styles.dropdownItem}>Contact</a>
									<a href="#" className={styles.dropdownItem}>Careers</a>
									<a href="#" className={styles.dropdownItem}>Press</a>
								</div>
							)}
						</div>
					</div>

					<div className={styles.navActions}>
						<Link href="#subscribe" className={styles.signInBtn}>Sign In</Link>
					</div>
					<div className={styles.mobileMenuBtn}>
						<button onClick={() => setIsOpen(!isOpen)} className={styles.hamburger}>
							{isOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
};

const Hero = () => (
	<div className={styles.hero}>
		{/* Architectural Graphic Elements */}
		<div className={styles.heroBgRight} />
		<div className={styles.heroBgBlur} />

		<div className={`${styles.container} ${styles.heroContent}`}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
				{/* <div className={styles.regBadge}>
					<div className={styles.pulseDot} />
					<span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', letterSpacing: '0.025em' }}>SEC REGULATED PLATFORM</span>
				</div> */}

				<h1 className={styles.heroTitle}>
					Commercial Real Estate. <br />
					<span className={styles.textGradient}>Revolutionized.</span>
				</h1>

				<p className={styles.heroDesc}>
					The first fully liquid, transparent, and global commercial real estate marketplace.
					Invest in premium properties with AI-powered insights and blockchain security.
				</p>

				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem' }}>
					<Link href="#subscribe">
						<Button style={{ height: '3.5rem', padding: '0 2.5rem', fontSize: '1rem' }}>
							View Properties
						</Button>
					</Link>
					<Link href="#contact">
						<Button variant="outlined" style={{ height: '3.5rem', padding: '0 2.5rem', fontSize: '1rem' }}>
							Contact Us
						</Button>
					</Link>
				</div>

				<div className={styles.heroStats}>
					{MOCK_STATS.map((stat) => (
						<div key={stat.label}>
							<div className={styles.statValue}>{stat.value}</div>
							<div className={styles.statLabel}>{stat.label}</div>
						</div>
					))}
				</div>
			</div>

			{/* Hero Visual */}
			<div className={styles.heroVisual}>
				<div className={styles.visualGlow} />

				{/* Card 1: The Asset */}
				<div className={styles.cardAsset}>
					<div className={styles.cardImage}>
						<div className={styles.cardImageBg} />
						<div className={styles.cardTag}>Class A Office</div>
					</div>
					<div className={styles.flexBetween} style={{ alignItems: 'flex-end' }}>
						<div>
							<h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>Skyline Tower I</h3>
							<p style={{ fontSize: '0.875rem', color: '#64748b' }}>Manhattan, NY</p>
						</div>
						<div style={{ textAlign: 'right' }}>
							<div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Target IRR</div>
							<div className={styles.financialData} style={{ fontSize: '1.25rem' }}>14.2%</div>
						</div>
					</div>
				</div>

				{/* Card 2: The Graph */}
				<div className={styles.cardGraph}>
					<div className={styles.flexCenter} style={{ justifyContent: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
						<div style={{ padding: '0.5rem', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '0.5rem' }}><Activity size={18} /></div>
						<div>
							<div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Distributions Paid</div>
							<div className={styles.financialDataNeutral} style={{ fontSize: '1.125rem' }}>$245,000</div>
						</div>
					</div>
					<div className={styles.graphBars}>
						{[40, 65, 55, 80, 70, 90, 85].map((h, i) => (
							<div key={i} style={{ height: `${h}%` }} className={styles.graphBar} />
						))}
					</div>
				</div>
			</div>
		</div>
	</div>
);

const BentoFeatures = () => (
	<div className={styles.bentoSection}>
		<div className={styles.container}>
			<SectionHeading subtitle="Why Commertize" title="Institutional grade infrastructure." />

			<div className={styles.bentoGrid}>
				{/* Large Feature */}
				<div className={`${styles.bentoCard} ${styles.bentoLarge}`}>
					<div style={{ position: 'absolute', top: 0, right: 0, padding: '2.5rem', opacity: 0.1 }}>
						<ShieldCheck size={200} />
					</div>
					<div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
						<div>
							<div className={styles.bentoIconBox}><ShieldCheck size={24} color="#C59B26" /></div>
							<h3 className={styles.bentoTitle}>Blockchain Transparency</h3>
							<p className={styles.bentoText}>Every transaction is recorded on-chain, ensuring immutable ownership records and complete transparency. AI-powered insights provide real-time valuation and risk assessment.</p>
						</div>
						<div style={{ marginTop: '2rem' }}>
							<button className={styles.complianceBtn}>View Compliance Docs</button>
						</div>
					</div>
				</div>

				{/* Vertical Stack */}
				<div style={{ display: 'grid', gridTemplateRows: 'repeat(2, 1fr)', gap: '1.5rem' }}>
					<div className={`${styles.bentoCard} ${styles.bentoDark}`}>
						<div style={{ position: 'relative', zIndex: 10 }}>
							<TrendingUp style={{ marginBottom: '1rem', color: '#C59B26' }} size={32} />
							<h3 className={styles.bentoTitle}>Secondary Market Liquidity</h3>
							<p className={styles.bentoText}>Exit your positions when you want. Trade fractional shares instantly on our regulated secondary market.</p>
						</div>
					</div>
					<div className={`${styles.bentoCard} ${styles.bentoGold}`}>
						<PieChart style={{ marginBottom: '1rem', color: '#C59B26' }} size={32} />
						<h3 className={styles.bentoTitle}>Fractional Ownership</h3>
						<p className={styles.bentoText}>Access institutional-grade deals with lower minimums. Build a diversified portfolio across asset classes and geographies.</p>
					</div>
				</div>
			</div>
		</div>
	</div>
);

// --- Portal (Dashboard) Logic ---

interface SidebarItemProps {
	icon: React.ComponentType<{ size?: number }>;
	label: string;
	active: boolean;
	onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
	<button
		onClick={onClick}
		className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : styles.sidebarItemInactive}`}
	>
		<Icon size={20} />
		{label}
	</button>
);

interface PortalProps {
	onLogout: () => void;
}

const Portal = ({ onLogout }: PortalProps) => {
	const [activeTab, setActiveTab] = useState('overview');

	return (
		<div className={styles.portalContainer}>
			{/* Dark Mode Sidebar */}
			<div className={styles.sidebar}>
				<div style={{ padding: '2rem' }}>
					<Logo className="text-white" theme="light" />
				</div>

				<div style={{ flex: 1, paddingRight: '1rem' }}>
					<div className={styles.sidebarSectionTitle}>Main</div>
					<SidebarItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
					<SidebarItem icon={Building} label="Marketplace" active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
					<SidebarItem icon={PieChart} label="Portfolio" active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
					<SidebarItem icon={Activity} label="Secondary Market" active={activeTab === 'secondary'} onClick={() => setActiveTab('secondary')} />

					<div className={styles.sidebarSectionTitle} style={{ paddingTop: '1.5rem' }}>Account</div>
					<SidebarItem icon={FileText} label="Documents" active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} />
					<SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
				</div>

				<div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
					<button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>
						<LogOut size={16} /> Sign Out
					</button>
				</div>
			</div>

			{/* Content Area */}
			<div className={styles.portalContent}>
				{/* Top Bar */}
				<header className={styles.portalHeader}>
					<div className={styles.searchBar}>
						<Search className="text-slate-400" size={20} color="#94a3b8" />
						<input
							type="text"
							placeholder="Search properties, sponsors, or documents..."
							className={styles.searchInput}
						/>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
						<button style={{ position: 'relative', padding: '0.5rem', color: '#94a3b8' }}>
							<Bell size={20} />
							<span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', width: '0.5rem', height: '0.5rem', backgroundColor: '#ef4444', borderRadius: '9999px', border: '1px solid white' }}></span>
						</button>
						<div style={{ height: '2rem', width: '1px', backgroundColor: '#e2e8f0' }}></div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
							<div style={{ textAlign: 'right' }} className={styles.userInfoDesktop}>
								<div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a' }}>James Anderson</div>
								<div style={{ fontSize: '0.75rem', color: '#64748b' }}>Accredited Investor</div>
							</div>
							<div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#C59B26', color: 'white', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.125rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>J</div>
						</div>
					</div>
				</header>

				{/* Scrollable Dashboard Content */}
				<main className={styles.portalMain}>
					{activeTab === 'overview' && (
						<div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
							{/* Financial Header */}
							<div className={styles.flexBetween} style={{ alignItems: 'flex-end' }}>
								<div>
									<h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>Portfolio Performance</h1>
									<p style={{ color: '#64748b' }}>Last updated: Today, 09:41 AM</p>
								</div>
								<div style={{ display: 'flex', gap: '0.75rem' }}>
									<Button variant="outlined" style={{ backgroundColor: 'white', borderColor: '#e2e8f0', color: '#475569' }}>Download Report</Button>
									<Button>Add Capital</Button>
								</div>
							</div>

							{/* Cards Row */}
							<div className={styles.dashboardGrid}>
								<div className={styles.statCard}>
									<div className={styles.statCardHeader}>
										<div className={`${styles.statIcon} ${styles.statIconGreen}`}><DollarSign size={20} /></div>
										<span className={`${styles.statBadge} ${styles.statBadgeGreen}`}>+12.4%</span>
									</div>
									<div className={styles.statLabel}>Total Net Equity</div>
									<div className={styles.statValue}>$1,245,000.00</div>
								</div>
								<div className={styles.statCard}>
									<div className={styles.statCardHeader}>
										<div className={`${styles.statIcon} ${styles.statIconBlue}`}><Building size={20} /></div>
										<span className={`${styles.statBadge} ${styles.statBadgeGray}`}>4 Active</span>
									</div>
									<div className={styles.statLabel}>Properties Owned</div>
									<div className={styles.statValue}>12,450 <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '400' }}>Shares</span></div>
								</div>
								<div className={styles.statCard}>
									<div className={styles.statCardHeader}>
										<div className={`${styles.statIcon} ${styles.statIconPurple}`}><Wallet size={20} /></div>
										<span className={`${styles.statBadge} ${styles.statBadgeGray}`}>Pending</span>
									</div>
									<div className={styles.statLabel}>Uninvested Cash</div>
									<div className={styles.statValue}>$45,000.00</div>
								</div>
							</div>

							{/* Active Listings Table Section */}
							<div className={styles.tableContainer}>
								<div className={styles.tableHeader}>
									<h3 style={{ fontWeight: '700', fontSize: '1.125rem', color: '#0f172a' }}>Live Opportunities</h3>
									<div style={{ display: 'flex', gap: '0.5rem' }}>
										<button style={{ padding: '0.5rem', borderRadius: '0.25rem', color: '#94a3b8' }}><Filter size={18} /></button>
									</div>
								</div>
								<div style={{ overflowX: 'auto' }}>
									<table className={styles.table}>
										<thead>
											<tr>
												<th className={styles.th}>Property</th>
												<th className={styles.th}>Type</th>
												<th className={styles.th}>Valuation</th>
												<th className={styles.th}>Target Return</th>
												<th className={styles.th}>Min. Investment</th>
												<th className={styles.th}>Status</th>
												<th className={styles.th}></th>
											</tr>
										</thead>
										<tbody>
											{MOCK_PROPERTIES.map((prop) => (
												<tr key={prop.id} className={styles.tableRow}>
													<td className={styles.td}>
														<div style={{ fontWeight: '700', color: '#0f172a' }}>{prop.title}</div>
														<div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prop.location}</div>
													</td>
													<td className={styles.td} style={{ fontSize: '0.875rem', color: '#475569' }}>{prop.type}</td>
													<td className={styles.td}>
														<span className={styles.financialDataNeutral} style={{ fontSize: '0.875rem' }}>${prop.valuation}</span>
													</td>
													<td className={styles.td}>
														<span className={styles.financialData} style={{ fontSize: '0.875rem', color: '#16a34a' }}>{prop.return}</span>
													</td>
													<td className={styles.td}>
														<span className={styles.financialDataNeutral} style={{ fontSize: '0.875rem', color: '#475569' }}>${prop.min}</span>
													</td>
													<td className={styles.td}>
														<div className={styles.progressBar}>
															<div className={styles.progressFill} style={{ width: `${prop.funded}%` }}></div>
														</div>
														<div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{prop.funded}% Funded</div>
													</td>
													<td className={styles.td} style={{ textAlign: 'right' }}>
														<button className={styles.viewDealBtn}>View Deal</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}
					{activeTab !== 'overview' && (
						<div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
							<Building size={64} strokeWidth={1} style={{ marginBottom: '1rem' }} />
							<div style={{ fontSize: '1.25rem', fontWeight: '500', color: '#64748b' }}>Module Under Construction</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

// --- Main App Controller ---

export default function Home() {
	const [view, setView] = useState('landing');
	const [activeTab, setActiveTab] = useState('investors'); // For How It Works tabs

	const handleLogout = () => {
		setView('landing');
		window.scrollTo(0, 0);
	};

	if (view.includes('portal')) {
		return <Portal onLogout={handleLogout} />;
	}

	return (
		<div style={{ minHeight: '100vh', fontFamily: 'var(--font-sans)', backgroundColor: '#FAFAF9', color: '#0f172a' }}>
			<Navbar />
			<Hero />
			<BentoFeatures />

			{/* Mission Section */}
			<div className={styles.missionSection}>
				<div className={styles.container}>
					<SectionHeading subtitle="Our Mission" title="Democratizing Access to Institutional Real Estate" />
					<div className={styles.missionGrid}>
						<div className={styles.missionContent}>
							<p className={styles.missionText}>
								For decades, only institutions and ultra-high-net-worth individuals had access to premium commercial real estate investments. High minimums, long lock-up periods, and zero liquidity kept everyday accredited investors on the sidelines.
							</p>
							<p className={styles.missionText}>
								Commertize changes that. By leveraging blockchain technology, we fractionalize ownership and create a liquid secondary market. Now accredited investors can participate in institutional-grade deals with as little as $25,000.
							</p>
							<div className={styles.missionStats}>
								<div className={styles.missionStat}>
									<div className={styles.missionStatValue}>$25K</div>
									<div className={styles.missionStatLabel}>Minimum Investment vs $1M+ Traditional</div>
								</div>
								<div className={styles.missionStat}>
									<div className={styles.missionStatValue}>Days</div>
									<div className={styles.missionStatLabel}>Liquidity Timeline vs 7-10 Year Lockup</div>
								</div>
								<div className={styles.missionStat}>
									<div className={styles.missionStatValue}>24/7</div>
									<div className={styles.missionStatLabel}>Trading vs Business Hours Only</div>
								</div>
							</div>
						</div>
						<div className={styles.missionVisual}>
							<div className={styles.comparisonCard}>
								<h4 className={styles.comparisonTitle}>Traditional CRE</h4>
								<ul className={styles.comparisonList}>
									<li className={styles.comparisonItemNegative}>$1M+ minimum investment</li>
									<li className={styles.comparisonItemNegative}>7-10 year lockup periods</li>
									<li className={styles.comparisonItemNegative}>Limited to local markets</li>
									<li className={styles.comparisonItemNegative}>Complex paperwork</li>
								</ul>
							</div>
							<div className={styles.comparisonCard}>
								<h4 className={styles.comparisonTitle}>Commertize</h4>
								<ul className={styles.comparisonList}>
									<li className={styles.comparisonItemPositive}>$25K minimum investment</li>
									<li className={styles.comparisonItemPositive}>Liquid secondary market</li>
									<li className={styles.comparisonItemPositive}>Global property access</li>
									<li className={styles.comparisonItemPositive}>Streamlined digital process</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* How It Works Section */}
			<div className={styles.howItWorksSection}>
				<div className={styles.container}>
					<SectionHeading subtitle="The Process" title="How Commertize Works" />
					<div className={styles.tabsContainer}>
						<div className={styles.tabs}>
							<button
								className={`${styles.tab} ${activeTab === 'investors' ? styles.tabActive : ''}`}
								onClick={() => setActiveTab('investors')}
							>
								For Investors
							</button>
							<button
								className={`${styles.tab} ${activeTab === 'sponsors' ? styles.tabActive : ''}`}
								onClick={() => setActiveTab('sponsors')}
							>
								For Sponsors
							</button>
						</div>
					</div>
					<div className={styles.stepsGrid}>
						{activeTab === 'investors' ? (
							<>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>1</div>
									<h4 className={styles.stepTitle}>Verify Your Status</h4>
									<p className={styles.stepDesc}>Complete KYC/AML and accreditation verification through our secure platform.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>2</div>
									<h4 className={styles.stepTitle}>Browse Properties</h4>
									<p className={styles.stepDesc}>Explore vetted commercial properties across multiple asset classes and geographies.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>3</div>
									<h4 className={styles.stepTitle}>Invest</h4>
									<p className={styles.stepDesc}>Purchase fractional shares using fiat currency or cryptocurrency.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>4</div>
									<h4 className={styles.stepTitle}>Earn Distributions</h4>
									<p className={styles.stepDesc}>Receive quarterly distributions directly to your account or wallet.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>5</div>
									<h4 className={styles.stepTitle}>Trade Anytime</h4>
									<p className={styles.stepDesc}>Sell your shares on our regulated secondary market for instant liquidity.</p>
								</div>
							</>
						) : (
							<>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>1</div>
									<h4 className={styles.stepTitle}>Submit Property</h4>
									<p className={styles.stepDesc}>Upload property details and documentation through our streamlined submission portal.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>2</div>
									<h4 className={styles.stepTitle}>Due Diligence Review</h4>
									<p className={styles.stepDesc}>Commertize conducts comprehensive due diligence and compliance verification.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>3</div>
									<h4 className={styles.stepTitle}>List to Market</h4>
									<p className={styles.stepDesc}>Property goes live to our network of 14,000+ accredited investors.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>4</div>
									<h4 className={styles.stepTitle}>Raise Capital</h4>
									<p className={styles.stepDesc}>Fund faster than traditional methods with fractional ownership and blockchain efficiency.</p>
								</div>
								<div className={styles.stepCard}>
									<div className={styles.stepNumber}>5</div>
									<h4 className={styles.stepTitle}>Automated Management</h4>
									<p className={styles.stepDesc}>Streamlined distribution and reporting through our automated platform.</p>
								</div>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Technology Section */}
			<div className={styles.techSection}>
				<div className={styles.container}>
					<div className={styles.techHeading}>
						<div className={styles.techSubtitle}>Built on Blockchain</div>
						<h2 className={styles.techSectionTitle}>Dual-Chain Infrastructure</h2>
					</div>
					<div className={styles.techGrid}>
						<div className={styles.techCard}>
							<div className={styles.techIcon}>
								<ShieldCheck size={32} color="#C59B26" />
							</div>
							<h4 className={styles.techTitle}>Hedera Network</h4>
							<p className={styles.techDesc}>Property tokenization using ERC-3643 compliant security tokens for regulatory compliance and transfer restrictions.</p>
							<div className={styles.techFeatures}>
								<div className={styles.techFeature}>✓ Sub-second finality</div>
								<div className={styles.techFeature}>✓ Low transaction fees</div>
								<div className={styles.techFeature}>✓ Carbon negative</div>
							</div>
						</div>
						<div className={styles.techCard}>
							<div className={styles.techIcon}>
								<TrendingUp size={32} color="#64FFDA" />
							</div>
							<h4 className={styles.techTitle}>Ethereum Mainnet</h4>
							<p className={styles.techDesc}>DeFi integration for lending, liquidity provision, and advanced trading via Aave V3 and Uniswap protocols.</p>
							<div className={styles.techFeatures}>
								<div className={styles.techFeature}>✓ Deep liquidity pools</div>
								<div className={styles.techFeature}>✓ Composable DeFi</div>
								<div className={styles.techFeature}>✓ Decentralized trading</div>
							</div>
						</div>
					</div>
					<div className={styles.partnersSection}>
						<h4 className={styles.partnersTitle}>Integration Partners</h4>
						<div className={styles.partnersGrid}>
							<div className={styles.partnerBadge}>Plaid</div>
							<div className={styles.partnerBadge}>Propy</div>
							<div className={styles.partnerBadge}>Fireblocks</div>
							<div className={styles.partnerBadge}>Chainalysis</div>
						</div>
					</div>
				</div>
			</div>

			{/* Asset Classes Section */}
			<div className={styles.assetClassesSection}>
				<div className={styles.container}>
					<SectionHeading subtitle="Investment Opportunities" title="Diversified Asset Classes" />
					<div className={styles.assetGrid}>
						<div className={styles.assetCard}>
							<div className={styles.assetIcon}>🏢</div>
							<h4 className={styles.assetTitle}>Commercial Office</h4>
							<p className={styles.assetDesc}>Class A office buildings in prime urban locations with stable, long-term tenants.</p>
							<div className={styles.assetMetric}>Avg. APY: 10-12%</div>
						</div>
						<div className={styles.assetCard}>
							<div className={styles.assetIcon}>🏘️</div>
							<h4 className={styles.assetTitle}>Multi-Family</h4>
							<p className={styles.assetDesc}>Apartment complexes and residential communities with strong occupancy rates.</p>
							<div className={styles.assetMetric}>Avg. APY: 8-11%</div>
						</div>
						<div className={styles.assetCard}>
							<div className={styles.assetIcon}>🏭</div>
							<h4 className={styles.assetTitle}>Industrial</h4>
							<p className={styles.assetDesc}>Warehouses, distribution centers, and last-mile delivery facilities.</p>
							<div className={styles.assetMetric}>Avg. APY: 11-14%</div>
						</div>
						<div className={styles.assetCard}>
							<div className={styles.assetIcon}>🛒</div>
							<h4 className={styles.assetTitle}>Retail</h4>
							<p className={styles.assetDesc}>Shopping centers and standalone retail properties in high-traffic areas.</p>
							<div className={styles.assetMetric}>Avg. APY: 9-13%</div>
						</div>
						<div className={styles.assetCard}>
							<div className={styles.assetIcon}>💾</div>
							<h4 className={styles.assetTitle}>Data Centers</h4>
							<p className={styles.assetDesc}>Mission-critical infrastructure supporting cloud computing and AI workloads.</p>
							<div className={styles.assetMetric}>Avg. APY: 12-15%</div>
						</div>
						<div className={styles.assetCard}>
							<div className={styles.assetIcon}>❄️</div>
							<h4 className={styles.assetTitle}>Cold Storage</h4>
							<p className={styles.assetDesc}>Temperature-controlled facilities for food and pharmaceutical logistics.</p>
							<div className={styles.assetMetric}>Avg. APY: 10-13%</div>
						</div>
					</div>
				</div>
			</div >

			{/* FAQ Section */}
			< div className={styles.faqSection} >
				<div className={styles.container}>
					<SectionHeading subtitle="Common Questions" title="Frequently Asked Questions" />
					<div className={styles.faqGrid}>
						<div className={styles.faqItem}>
							<h4 className={styles.faqQuestion}>Is Commertize regulated?</h4>
							<p className={styles.faqAnswer}>Yes, we operate under Reg D 506(c) and use ERC-3643 compliant security tokens. Our platform adheres to SEC regulations and we maintain SOC 2 Type II certification.</p>
						</div>
						<div className={styles.faqItem}>
							<h4 className={styles.faqQuestion}>Who can invest on Commertize?</h4>
							<p className={styles.faqAnswer}>Only accredited investors can participate. This includes individuals with $200K+ annual income ($300K joint) or $1M+ net worth excluding primary residence.</p>
						</div>
						<div className={styles.faqItem}>
							<h4 className={styles.faqQuestion}>What is the minimum investment?</h4>
							<p className={styles.faqAnswer}>Minimum investment varies by property, typically ranging from $25,000 to $100,000. This is significantly lower than traditional CRE investments which often require $1M+.</p>
						</div>
						<div className={styles.faqItem}>
							<h4 className={styles.faqQuestion}>Can I sell my tokens?</h4>
							<p className={styles.faqAnswer}>Yes, you can trade your security tokens on our regulated secondary market. Some properties may have initial lock-up periods ranging from 90 days to 1 year.</p>
						</div>
						<div className={styles.faqItem}>
							<h4 className={styles.faqQuestion}>How are distributions paid?</h4>
							<p className={styles.faqAnswer}>Quarterly distributions are paid directly via ACH to your bank account or as stablecoins (USDC) to your connected wallet.</p>
						</div>
						<div className={styles.faqItem}>
							<h4 className={styles.faqQuestion}>What fees does Commertize charge?</h4>
							<p className={styles.faqAnswer}>We charge a 1% annual management fee. There are no transaction fees for primary purchases. Secondary market trades incur a 0.5% platform fee.</p>
						</div>
					</div>
				</div>
			</div >

			{/* Premium Footer */}
			< footer className={styles.footer} id="contact" >
				<div className={`${styles.container} ${styles.footerGrid}`}>
					<div style={{ gridColumn: 'span 1' }}>
						<Logo className="text-white" theme="light" />
						<p style={{ marginTop: '1.5rem', lineHeight: '1.625', opacity: 0.6 }}>
							The premier digital securities marketplace for institutional real estate.
							Member FINRA/SIPC.
						</p>
					</div>

					<div>
						<h4 className={styles.footerTitle}>Marketplace</h4>
						<ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
							<li><a href="#" className={styles.footerLink}>Residential Equity</a></li>
							<li><a href="#" className={styles.footerLink}>Commercial Debt</a></li>
							<li><a href="#" className={styles.footerLink}>Industrial Logistics</a></li>
							<li><a href="#" className={styles.footerLink}>Data Centers</a></li>
						</ul>
					</div>

					<div>
						<h4 className={styles.footerTitle}>Company</h4>
						<ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
							<li><a href="#" className={styles.footerLink}>About Us</a></li>
							<li><a href="#" className={styles.footerLink}>Contact</a></li>
							<li><a href="#" className={styles.footerLink}>Privacy Policy</a></li>
							<li><a href="#" className={styles.footerLink}>Terms of Service</a></li>
						</ul>
					</div>

					<div>
						<h4 className={styles.footerTitle}>Subscribe</h4>
						<div className={styles.subscribeBox} id="subscribe">
							<input type="email" placeholder="Enter your email" className={styles.subscribeInput} />
							<button className={styles.subscribeBtn}>Join</button>
						</div>
					</div>
				</div>
			</footer >
		</div >
	);
}
