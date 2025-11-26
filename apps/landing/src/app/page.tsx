"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
        Building,
        Building2,
        Wallet,
        LayoutDashboard,
        PieChart,
        FileText,
        Settings,
        LogOut,
        TrendingUp,
        ShieldCheck,
        ChevronRight,
        ChevronDown,
        Menu,
        X,
        Bell,
        Search,
        Filter,
        DollarSign,
        Activity,
        Coins,
        Shield,
        Warehouse,
        Home as HomeIcon,
        Layers,
        Sun,
        Wind,
        Calendar,
        Clock,
        ArrowRight,
        MapPin,
        Cookie,
        Link2,
        BarChart3,
        Sparkles,
        ArrowLeftRight,
        Users,
        Check,
        XCircle
} from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { Button, Logo, PropertyCard, PropertyData } from '@commertize/ui';
import ChatGPTWidget from '@/components/ChatGPTWidget';

const SAMPLE_PROPERTIES: PropertyData[] = [
        {
                id: '1',
                name: 'Gateway Medical Plaza',
                location: 'Austin, TX',
                imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop',
                propertyValue: 24500000,
                pricePerToken: 100,
                minInvestment: 25000,
                totalTokens: 245000,
                tokensSold: 147000,
                status: 'Active',
                propertyType: 'medical',
                targetedIRR: 14.5,
                capRate: 6.8,
                holdPeriod: 5,
                units: 48
        },
        {
                id: '2',
                name: 'Riverside Industrial Park',
                location: 'Phoenix, AZ',
                imageUrl: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop',
                propertyValue: 18750000,
                pricePerToken: 75,
                minInvestment: 50000,
                totalTokens: 250000,
                tokensSold: 200000,
                status: 'Active',
                propertyType: 'industrial',
                targetedIRR: 16.2,
                capRate: 7.5,
                holdPeriod: 7,
                units: 12
        },
        {
                id: '3',
                name: 'Metropolitan Tower',
                location: 'Denver, CO',
                imageUrl: 'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=600&h=400&fit=crop',
                propertyValue: 52000000,
                pricePerToken: 250,
                minInvestment: 100000,
                totalTokens: 208000,
                tokensSold: 83200,
                status: 'Active',
                propertyType: 'office',
                targetedIRR: 12.8,
                capRate: 5.9,
                holdPeriod: 10,
                units: 320
        },
        {
                id: '4',
                name: 'Sunrise Retail Center',
                location: 'Miami, FL',
                imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
                propertyValue: 15200000,
                pricePerToken: 50,
                minInvestment: 25000,
                totalTokens: 304000,
                tokensSold: 243200,
                status: 'Active',
                propertyType: 'retail',
                targetedIRR: 11.5,
                capRate: 6.2,
                holdPeriod: 5,
                units: 24
        },
        {
                id: '5',
                name: 'Pacific Heights Multifamily',
                location: 'Seattle, WA',
                imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop',
                propertyValue: 38000000,
                pricePerToken: 150,
                minInvestment: 50000,
                totalTokens: 253333,
                tokensSold: 177333,
                status: 'Active',
                propertyType: 'multifamily',
                targetedIRR: 13.2,
                capRate: 5.4,
                holdPeriod: 7,
                units: 156
        },
        {
                id: '6',
                name: 'Harbor View Hotel',
                location: 'San Diego, CA',
                imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
                propertyValue: 45000000,
                pricePerToken: 200,
                minInvestment: 75000,
                totalTokens: 225000,
                tokensSold: 0,
                status: 'Coming Soon',
                propertyType: 'hotel',
                targetedIRR: 15.8,
                capRate: 7.2,
                holdPeriod: 8,
                units: 180,
                comingSoon: true
        }
];

// --- Mock Data ---
const MOCK_PROPERTIES = [
        { 
                id: 1, 
                title: 'DoubleTree Hilton Head Inn', 
                type: 'HOTEL', 
                location: '36 S Forest Beach Dr, Hilton Head Island, SC', 
                sponsor: 'Passive Partners Capital',
                status: 'Funding Opens Soon',
                funded: 0, 
                units: 79,
                comingSoon: true,
                image: '/assets/doubletree-hilton-head.jpg'
        },
        { 
                id: 2, 
                title: 'Boardwalk Suites Lafayette', 
                type: 'HOTEL', 
                location: '1605 N University Ave Lafayette, LA', 
                sponsor: 'Passive Partners Capital',
                status: 'Funding Opens Soon',
                funded: 0, 
                units: 140,
                comingSoon: true,
                image: '/assets/boardwalk-suites-lafayette.jpg'
        },
        { 
                id: 3, 
                title: 'National Hotel under conversion to Hilton', 
                type: 'HOTEL', 
                location: '2 Water St Jackson, CA', 
                sponsor: 'Passive Partners Capital',
                status: 'Funding Opens Soon',
                funded: 0, 
                units: 36,
                comingSoon: true,
                image: '/assets/national-hotel-hilton.jpg'
        },
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
                handleScroll();
                window.addEventListener('scroll', handleScroll);
                return () => {
                        window.removeEventListener('scroll', handleScroll);
                        if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
                        if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
                };
        }, []);

        return (
                <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex items-center justify-between h-16">
                                        <Link href="/" className="flex-shrink-0">
                                                <Logo src="/assets/logo.png" width={240} height={75} />
                                        </Link>

                                        <div className="hidden md:flex items-center gap-6 lg:gap-8">
                                                <button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">Mission</button>
                                                <button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">Marketplace</button>
                                                <button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">Nexus</button>
                                                <button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light">OmniGrid</button>

                                                <div
                                                        className="relative"
                                                        onMouseEnter={() => {
                                                                if (intelligenceTimeoutRef.current) clearTimeout(intelligenceTimeoutRef.current);
                                                                setIntelligenceOpen(true);
                                                        }}
                                                        onMouseLeave={() => {
                                                                intelligenceTimeoutRef.current = setTimeout(() => setIntelligenceOpen(false), 150);
                                                        }}
                                                >
                                                        <button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light flex items-center gap-1">
                                                                Intelligence
                                                                <ChevronRight size={12} className={`transition-transform ${intelligenceOpen ? 'rotate-90' : ''}`} />
                                                        </button>
                                                        {intelligenceOpen && (
                                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Market Analytics</a>
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">AI Insights</a>
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Reports</a>
                                                                </div>
                                                        )}
                                                </div>

                                                <div
                                                        className="relative"
                                                        onMouseEnter={() => {
                                                                if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);
                                                                setCompanyOpen(true);
                                                        }}
                                                        onMouseLeave={() => {
                                                                companyTimeoutRef.current = setTimeout(() => setCompanyOpen(false), 150);
                                                        }}
                                                >
                                                        <button className="text-sm text-gray-700 hover:text-[#D4A024] transition-colors font-light flex items-center gap-1">
                                                                Company
                                                                <ChevronRight size={12} className={`transition-transform ${companyOpen ? 'rotate-90' : ''}`} />
                                                        </button>
                                                        {companyOpen && (
                                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">About Us</a>
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Contact</a>
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Careers</a>
                                                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#D4A024]">Press</a>
                                                                </div>
                                                        )}
                                                </div>
                                        </div>

                                        <div className="hidden md:block">
                                                <a 
                                                        href="http://localhost:3001" 
                                                        className="inline-flex items-center justify-center px-5 py-2 bg-[#D4A024] text-white text-sm font-light rounded-lg hover:bg-[#B8881C] transition-colors"
                                                >
                                                        Sign In
                                                </a>
                                        </div>

                                        <div className="md:hidden">
                                                <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2">
                                                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                                                </button>
                                        </div>
                                </div>
                        </div>

                        {isOpen && (
                                <div className="md:hidden fixed inset-0 top-16 bg-black/50" onClick={() => setIsOpen(false)}>
                                        <div className="bg-white p-4 shadow-lg" onClick={(e) => e.stopPropagation()}>
                                                <a href="#" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>Mission</a>
                                                <a href="#" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>Marketplace</a>
                                                <a href="#" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>Nexus</a>
                                                <a href="#" className="block py-3 text-gray-700 border-b border-gray-100" onClick={() => setIsOpen(false)}>OmniGrid</a>
                                                <div className="py-2">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Intelligence</div>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Market Analytics</a>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>AI Insights</a>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Reports</a>
                                                </div>
                                                <div className="py-2 border-t border-gray-100">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Company</div>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>About Us</a>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Contact</a>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Careers</a>
                                                        <a href="#" className="block py-2 pl-4 text-gray-600 text-sm" onClick={() => setIsOpen(false)}>Press</a>
                                                </div>
                                                <div className="pt-4 border-t border-gray-100">
                                                        <a 
                                                                href="http://localhost:3001" 
                                                                className="block w-full text-center px-5 py-3 bg-[#D4A024] text-white font-light rounded-lg"
                                                                onClick={() => setIsOpen(false)}
                                                        >
                                                                Sign In
                                                        </a>
                                                </div>
                                        </div>
                                </div>
                        )}
                </nav>
        );
};

const FlippingText = () => {
        const prefixes = ["Token", "Digit", "Fractional", "Democrat", "Collateral", "Modern", "Global", "Revolution"];
        const [currentIndex, setCurrentIndex] = useState(0);
        const [animationKey, setAnimationKey] = useState(0);
        const [hasMounted, setHasMounted] = useState(false);

        useEffect(() => {
                setHasMounted(true);
        }, []);

        useEffect(() => {
                if (!hasMounted) return;
                const interval = setInterval(() => {
                        setAnimationKey(prev => prev + 1);
                        setTimeout(() => {
                                setCurrentIndex((prev) => (prev + 1) % prefixes.length);
                        }, 100);
                }, 2500);
                return () => clearInterval(interval);
        }, [hasMounted, prefixes.length]);

        return (
                <div className="relative h-12 sm:h-16 md:h-20 lg:h-24 flex items-center justify-center mt-4">
                        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 font-logo font-light flex items-baseline justify-center">
                                <span 
                                        key={hasMounted ? animationKey : 'initial'}
                                        className={hasMounted ? "text-flip inline-block" : "inline-block"}
                                >
                                        {prefixes[currentIndex]}
                                </span>
                                <span>ized.</span>
                        </div>
                </div>
        );
};

const CookieConsent = () => {
        const [isVisible, setIsVisible] = useState(false);
        const [hasMounted, setHasMounted] = useState(false);

        useEffect(() => {
                setHasMounted(true);
                const timer = setTimeout(() => setIsVisible(true), 1000);
                return () => clearTimeout(timer);
        }, []);

        if (!hasMounted || !isVisible) return null;

        return (
                <motion.div 
                        className={styles.cookieConsent}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                        <button className={styles.cookieClose} onClick={() => setIsVisible(false)}>
                                <X size={14} />
                        </button>
                        <div className={styles.cookieHeader}>
                                <div className={styles.cookieIcon}>
                                        <Cookie size={20} />
                                </div>
                                <h4 className={styles.cookieTitle}>Cookie Preferences</h4>
                        </div>
                        <p className={styles.cookieText}>
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. Please choose your preference.
                        </p>
                        <div className={styles.cookieButtons}>
                                <button className={styles.cookieBtnReject} onClick={() => setIsVisible(false)}>
                                        Reject All
                                </button>
                                <button className={styles.cookieBtnAccept} onClick={() => setIsVisible(false)}>
                                        Accept All
                                </button>
                        </div>
                </motion.div>
        );
};

const Hero = () => (
        <section className="relative min-h-screen flex items-center overflow-hidden">
                <div className="absolute inset-0">
                        <motion.div 
                                className="absolute inset-0 bg-no-repeat"
                                style={{ 
                                        backgroundImage: `url('/assets/hero-pattern.jpg')`,
                                        imageRendering: '-webkit-optimize-contrast' as React.CSSProperties['imageRendering'],
                                        WebkitBackfaceVisibility: 'hidden',
                                        backfaceVisibility: 'hidden',
                                        transform: 'translateZ(0)',
                                        willChange: 'transform',
                                        filter: 'contrast(1.0) brightness(1.0) saturate(1.0)',
                                        backgroundPosition: 'center center',
                                        backgroundSize: 'cover'
                                }}
                                initial={{ scale: 1.3 }}
                                animate={{ scale: [1.3, 1.7] }}
                                transition={{
                                        duration: 18,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatType: "reverse"
                                }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60"></div>
                </div>

                <div className="container relative z-10 px-4 pt-32 sm:pt-40 md:pt-48">
                        <div className="max-w-5xl mx-auto text-center flex flex-col items-center gap-4 sm:gap-6">
                                <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-gray-900 font-logo">
                                                <span className="block font-extralight text-xl sm:text-2xl md:text-4xl">
                                                        Commercial Real Estate
                                                </span>
                                                <FlippingText />
                                        </h1>
                                </motion.div>

                                <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                        className="mb-20"
                                >
                                        <p className="max-w-3xl mx-auto text-gray-800 drop-shadow-sm text-base sm:text-lg md:text-xl font-logo font-light px-4">
                                                Your Gateway to Commercial Real Estate's Digital Future.

                                                <motion.span 
                                                        className="block mt-4 text-gray-700 font-light"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 1.2, duration: 0.8 }}
                                                >
                                                        Welcome to<img 
                                                                src="/assets/logo.png" 
                                                                alt="Commertize" 
                                                                className="inline h-4 sm:h-5 w-auto"
                                                                style={{
                                                                        verticalAlign: "baseline",
                                                                        clipPath: "inset(0 0 0 20%)",
                                                                        transform: "translateY(4px) translateX(-22px)"
                                                                }}
                                                        />
                                                </motion.span>
                                        </p>
                                </motion.div>

                                <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.4 }}
                                        className="flex gap-3 sm:gap-4 justify-center mt-4"
                                >
                                        <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-[#D4A024] rounded-[0.75rem] text-sm sm:text-base font-light border-2 border-[#D4A024] hover:bg-[#D4A024]/5 transition-colors"
                                                onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                                        >
                                                Explore Marketplace
                                        </motion.button>
                                        <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#D4A024] text-white rounded-[0.75rem] text-sm sm:text-base font-light hover:bg-[#B8881C] transition-colors"
                                        >
                                                Join Waitlist
                                        </motion.button>
                                </motion.div>
                        </div>
                </div>

                <CookieConsent />
        </section>
);

const Marketplace = () => (
        <section className={styles.marketplaceSection} id="marketplace">
                <div className={styles.container}>
                        <SectionHeading subtitle="Featured Properties" title="Explore Our Marketplace" />
                        <p className={styles.marketplaceIntro}>
                                Discover institutional-grade commercial real estate investments, tokenized for accessibility and liquidity.
                        </p>
                        <div className={styles.marketplaceGrid}>
                                {SAMPLE_PROPERTIES.map((property) => (
                                        <PropertyCard
                                                key={property.id}
                                                property={property}
                                                showFavoriteButton={false}
                                        />
                                ))}
                        </div>
                        <div className={styles.marketplaceCta}>
                                <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={styles.marketplaceBtn}
                                >
                                        View All Properties
                                        <ArrowRight size={16} />
                                </motion.button>
                        </div>
                </div>
        </section>
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
                                                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
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

// --- About Us / Vision Section ---
const AboutUs = () => {
        const companyName = "Commertize";

        return (
                <section id="about" className="relative overflow-hidden min-h-[700px] md:min-h-[800px]">
                        <div className="absolute inset-0">
                                <motion.div
                                        className="absolute inset-0"
                                        initial={{ scale: 1 }}
                                        animate={{ scale: [1.0, 1.2] }}
                                        transition={{
                                                duration: 20,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                repeatType: "reverse"
                                        }}
                                >
                                        <img 
                                                src="/assets/vision-background.jpg"
                                                alt="" 
                                                className="w-full h-full object-cover"
                                                style={{ objectPosition: 'center center' }}
                                        />
                                </motion.div>
                                <div className="absolute inset-0 bg-white/30" />
                        </div>

                        <div className="absolute inset-0 flex items-center justify-start z-10 px-6 md:px-8 lg:pl-24">
                                <motion.div 
                                        className="max-w-2xl text-left"
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                >
                                        <motion.h2 
                                                className="text-3xl md:text-4xl lg:text-5xl font-logo font-light mb-8 md:mb-12 text-gray-900"
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                        >
                                                Our Vision
                                        </motion.h2>
                                        
                                        <div className="space-y-6 md:space-y-8">
                                                <motion.p 
                                                        className="text-base md:text-lg font-logo font-light text-gray-800 leading-relaxed"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                                >
                                                        {companyName} is building the platform that connects commercial real estate to global capital markets. By merging AI, blockchain-based tokenization, and decentralized finance with compliant financial infrastructure, we're enhancing liquidity, transparency, and access across the real estate landscape.
                                                </motion.p>
                                                <motion.p 
                                                        className="text-base md:text-lg font-logo font-light text-gray-800 leading-relaxed"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
                                                >
                                                        From office buildings and multifamily properties to data centers and solar farms, we empower investors and property owners to own, trade, and build the next era of real estate finance—making real assets as dynamic and borderless as digital ones.
                                                </motion.p>
                                        </div>
                                </motion.div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 flex items-center overflow-hidden bg-gradient-to-t from-white/80 to-transparent z-10">
                                <motion.div
                                        animate={{ x: [0, -1600] }}
                                        transition={{
                                                duration: 25,
                                                repeat: Infinity,
                                                ease: "linear",
                                                repeatType: "loop"
                                        }}
                                        className="flex items-center space-x-32 whitespace-nowrap"
                                        style={{ minWidth: "3200px" }}
                                >
                                        {["Shaping the Future of Ownership", "Digital Assets, Real-World Value", 
                                                "Shaping the Future of Ownership", "Digital Assets, Real-World Value",
                                                "Shaping the Future of Ownership", "Digital Assets, Real-World Value"].map((phrase, index) => (
                                                <motion.div
                                                        key={`${phrase}-${index}`}
                                                        whileHover={{ 
                                                                scale: 1.05,
                                                                color: "#D4A024",
                                                                transition: { duration: 0.2 }
                                                        }}
                                                        className="cursor-pointer group flex-shrink-0"
                                                        style={{ minWidth: "500px", textAlign: "center" }}
                                                >
                                                        <span className="text-xl md:text-2xl font-logo font-light text-gray-800">
                                                                {phrase}
                                                        </span>
                                                </motion.div>
                                        ))}
                                </motion.div>
                        </div>
                </section>
        );
};

// --- Why Commertize Section ---
const WhyCommertize = () => {
        const features = [
                {
                        icon: Link2,
                        title: "Blockchain Transparency",
                        description: "Every transaction is recorded on-chain, ensuring immutable ownership records and complete transparency. AI-powered insights provide real-time valuation and risk assessment.",
                        highlight: "On-Chain Verified"
                },
                {
                        icon: ArrowLeftRight,
                        title: "Secondary Market Liquidity",
                        description: "Exit your positions when you want. Trade fractional shares instantly on our regulated secondary market.",
                        highlight: "Trade Anytime"
                },
                {
                        icon: Users,
                        title: "Fractional Ownership",
                        description: "Access institutional-grade deals with lower minimums. Build a diversified portfolio across asset classes and geographies.",
                        highlight: "Lower Minimums"
                }
        ];

        const traditionalItems = [
                "$1M+ minimum investment",
                "7-10 year lockup periods",
                "Limited to local markets",
                "Complex paperwork"
        ];

        const commertizeItems = [
                "$1K minimum investment",
                "Liquid secondary market",
                "Global property access",
                "Streamlined digital process"
        ];

        return (
                <section className="relative py-20 md:py-28 overflow-hidden">
                        <motion.div 
                                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                style={{ backgroundImage: "url('/assets/why-commertize-bg.jpg')" }}
                                initial={{ scale: 1 }}
                                animate={{ scale: [1.0, 1.15] }}
                                transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatType: "reverse"
                                }}
                        />
                        <div className="absolute inset-0 bg-white/70" />
                        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                                <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-100px" }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="text-center mb-16"
                                >
                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-logo font-light text-gray-900 mb-4">
                                                Powered by <span className="text-[#D4A024]">Innovation</span>
                                        </h2>
                                        <p className="text-base md:text-lg font-logo font-light text-gray-600 max-w-2xl mx-auto">
                                                The future of real estate investing, powered by blockchain technology and institutional expertise.
                                        </p>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
                                        {features.map((feature, index) => (
                                                <motion.div
                                                        key={feature.title}
                                                        initial={{ opacity: 0, y: 40 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, margin: "-50px" }}
                                                        transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                                                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                                        className="relative group"
                                                >
                                                        <div className="bg-white rounded-2xl p-8 h-full border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#D4A024]/30 transition-all duration-300">
                                                                <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D4A024]/10 text-[#D4A024] border border-[#D4A024]/20">
                                                                                {feature.highlight}
                                                                        </span>
                                                                </div>
                                                                
                                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4A024]/10 to-[#D4A024]/5 flex items-center justify-center mb-6 group-hover:from-[#D4A024]/20 group-hover:to-[#D4A024]/10 transition-all duration-300">
                                                                        <feature.icon className="w-7 h-7 text-[#D4A024]" />
                                                                </div>
                                                                
                                                                <h3 className="text-xl font-logo font-medium text-gray-900 mb-4">
                                                                        {feature.title}
                                                                </h3>
                                                                
                                                                <p className="text-gray-600 font-logo font-light leading-relaxed">
                                                                        {feature.description}
                                                                </p>

                                                                <div className="mt-6 pt-6 border-t border-gray-100">
                                                                        <div className="flex items-center text-[#D4A024] font-logo text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                                                                                Learn more
                                                                                <ArrowRight className="w-4 h-4 ml-2" />
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </motion.div>
                                        ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                        <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, amount: 0.3 }}
                                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                                className="bg-[#FDF8F0] rounded-2xl p-6 border border-[#D4A024]/20"
                                        >
                                                <h3 className="text-xl font-logo font-medium text-gray-900 mb-4">Traditional CRE</h3>
                                                <div className="space-y-3">
                                                        {traditionalItems.map((item, index) => (
                                                                <div key={index} className="flex items-center gap-3">
                                                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                                                                                <X size={12} className="text-red-500" />
                                                                        </div>
                                                                        <span className="text-gray-700 font-logo font-light">{item}</span>
                                                                </div>
                                                        ))}
                                                </div>
                                        </motion.div>

                                        <motion.div
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, amount: 0.3 }}
                                                transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                                                className="bg-[#FDF8F0] rounded-2xl p-6 border border-[#D4A024]/30"
                                        >
                                                <h3 className="text-xl font-logo font-medium text-gray-900 mb-4">Commertize</h3>
                                                <div className="space-y-3">
                                                        {commertizeItems.map((item, index) => (
                                                                <div key={index} className="flex items-center gap-3">
                                                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                                                                <Check size={12} className="text-green-600" />
                                                                        </div>
                                                                        <span className="text-gray-700 font-logo font-light">{item}</span>
                                                                </div>
                                                        ))}
                                                </div>
                                        </motion.div>
                                </div>
                        </div>
                </section>
        );
};

// --- Commertize Collection Section ---
const CommertizeCollection = () => (
        <section id="properties" className="py-16 md:py-24 bg-white">
                <div className="relative w-full overflow-hidden mb-6">
                        <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="text-center"
                        >
                                <div className="relative h-12 sm:h-16 md:h-20 flex items-center overflow-hidden mb-4 sm:mb-6">
                                        <motion.div
                                                animate={{ x: [0, -800] }}
                                                transition={{
                                                        duration: 16,
                                                        repeat: Infinity,
                                                        ease: "linear",
                                                        repeatType: "loop"
                                                }}
                                                className="flex items-center space-x-24"
                                                style={{ minWidth: "1600px" }}
                                        >
                                                {["The Commertize Collection", "The Commertize Collection", 
                                                        "The Commertize Collection", "The Commertize Collection"].map((text, index) => (
                                                        <motion.h2 
                                                                key={`${text}-${index}`}
                                                                className="text-3xl md:text-4xl lg:text-5xl font-logo font-light text-gray-900 flex-shrink-0"
                                                                style={{ minWidth: "400px", textAlign: "center" }}
                                                                whileHover={{ 
                                                                        scale: 1.05,
                                                                        transition: { duration: 0.2 }
                                                                }}
                                                        >
                                                                The Commertize <span className="text-[#D4A024]">Collection</span>
                                                        </motion.h2>
                                                ))}
                                        </motion.div>
                                </div>
                        </motion.div>
                </div>

                <div className="container mx-auto px-4">
                        <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                className="text-center mb-12 sm:mb-16 md:mb-20"
                        >
                                <p className="text-base md:text-lg max-w-2xl mx-auto text-gray-600 px-4 font-light">
                                        Explore a curated selection of commercial real estate opportunities across multiple sectors, sourced and vetted for quality and performance potential.
                                </p>
                        </motion.div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {MOCK_PROPERTIES.slice(0, 3).map((property, index) => (
                                        <motion.div
                                                key={property.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                                className="bg-white rounded-2xl border-2 border-[#D4A024] overflow-hidden hover:shadow-xl transition-all duration-300"
                                        >
                                                <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                                                        {property.image ? (
                                                                <img 
                                                                        src={property.image} 
                                                                        alt={property.title}
                                                                        className="w-full h-full object-cover"
                                                                />
                                                        ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                        <Building2 size={64} className="text-[#D4A024]/30" />
                                                                </div>
                                                        )}
                                                        {property.comingSoon && (
                                                                <div className="absolute top-4 left-4 px-3 py-1 bg-[#F59E0B] text-white text-xs font-light rounded-[0.75rem]">
                                                                        COMING SOON
                                                                </div>
                                                        )}
                                                </div>
                                                <div className="p-5">
                                                        <div className="flex items-start justify-between gap-2 mb-3">
                                                                <h3 className="text-lg font-logo font-light text-gray-900 leading-tight">{property.title}</h3>
                                                                <span className="px-3 py-1 bg-white text-[#92710A] text-xs font-medium rounded-[0.75rem] whitespace-nowrap border-2 border-[#D4A024]">{property.type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-gray-900 mb-4">
                                                                <MapPin size={14} className="text-[#D4A024]" />
                                                                <span className="font-light">{property.location}</span>
                                                        </div>
                                                        
                                                        <div className="mb-3">
                                                                <div className="text-xs text-gray-900 font-light">Sponsor</div>
                                                                <div className="text-sm text-gray-900 font-light">{property.sponsor}</div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm text-gray-900 font-light">{property.status}</span>
                                                                <span className="text-sm text-gray-900 font-light">{property.funded}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
                                                                <div 
                                                                        className="h-full bg-[#D4A024] rounded-full transition-all duration-500"
                                                                        style={{ width: `${property.funded}%` }}
                                                                />
                                                        </div>
                                                        
                                                        <div className="text-center mb-4">
                                                                <div className="text-sm text-gray-900 font-light">More Details Coming Soon</div>
                                                                <div className="text-xs text-gray-900 font-light">Investment details available shortly.</div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-center mb-4">
                                                                <span className="px-4 py-1.5 bg-white border-2 border-[#D4A024] text-[#92710A] text-sm font-medium rounded-[0.75rem]">
                                                                        {property.units} Units
                                                                </span>
                                                        </div>
                                                        
                                                        <button 
                                                                className="w-full py-3 bg-gray-300 text-gray-600 text-sm font-light rounded-[0.75rem] cursor-not-allowed"
                                                                disabled
                                                        >
                                                                Coming Soon
                                                        </button>
                                                </div>
                                        </motion.div>
                                ))}
                        </div>
                </div>
        </section>
);

// --- Tokenization Info Section ---
const tokenizationSections = [
        {
                title: "Real Estate Developers",
                description: "Tokenize Your Projects. Raise Capital Faster",
                details: [
                        "Offer fractional ownership to reduce funding time",
                        "Attract global investors with lower entry points",
                        "Increase liquidity for illiquid or early-stage assets",
                        "Monetize rental income or future developments",
                ],
        },
        {
                title: "Real Estate Companies",
                description: "Expand Access. Go Digital",
                details: [
                        "Lower the barrier for investors ($100-$1,000 instead of $100K+)",
                        "Diversify portfolio with global tokenized assets",
                        "Benefit from 24/7 trading, instant settlement & lower fees",
                        "Access broader investor base through digital platforms",
                ],
        },
        {
                title: "REITs & Real Estate Investment Funds",
                description: "Reach More Investors. Stay Flexible",
                details: [
                        "Expand beyond institutional investors without going public",
                        "Offer fractional shares with global accessibility",
                        "Improve transparency with on-chain reporting",
                        "Reduce operational costs through automation",
                ],
        },
        {
                title: "Institutional Investors",
                description: "Access Premium CRE Without Full Property Acquisition",
                details: [
                        "Pension funds, endowments, and insurance companies gain fractional exposure",
                        "Lower capital commitments with diversified CRE portfolios",
                        "Transparent, on-chain reporting for regulatory compliance",
                        "Instant settlement and reduced counterparty risk",
                ],
        },
        {
                title: "Accredited Retail Investors",
                description: "Access Institutional-Grade CRE with Low Minimums",
                details: [
                        "Previously locked out of premium commercial real estate deals",
                        "Access top-tier properties with $100-$1,000 minimums",
                        "Portfolio diversification beyond stocks and bonds",
                        "Passive income through automated rental distributions",
                ],
        },
        {
                title: "Family Offices",
                description: "Multi-Generational Wealth Management Simplified",
                details: [
                        "Easier estate planning and inheritance distribution through tokens",
                        "Diversification across multiple properties with smaller capital per asset",
                        "Simplified asset transfers between family members",
                        "Preserve wealth across generations with digital ownership records",
                ],
        },
        {
                title: "International Investors",
                description: "Global Access to U.S. Commercial Real Estate",
                details: [
                        "Cross-border investment without traditional barriers",
                        "No need for local banking relationships or complex wire transfers",
                        "24/7 access to U.S. commercial real estate from anywhere",
                        "Simplified compliance through blockchain verification",
                ],
        },
        {
                title: "Real Estate Brokers & Agents",
                description: "New Revenue Streams Through Tokenization",
                details: [
                        "Commission opportunities on fractional property sales",
                        "Access to global buyer networks through digital platforms",
                        "Modern tools for next-generation real estate transactions",
                        "Expand client services with tokenized investment offerings",
                ],
        },
        {
                title: "Financial Advisors & Wealth Managers",
                description: "Offer Clients a New Asset Class",
                details: [
                        "Diversification strategies beyond traditional securities",
                        "Easy portfolio rebalancing with liquid tokens",
                        "Technology-enabled client reporting and transparency",
                        "Access to institutional-grade real estate for all client types",
                ],
        },
        {
                title: "Property & Asset Managers",
                description: "Streamlined Operations with Blockchain Technology",
                details: [
                        "Automated yield distribution reduces operational overhead",
                        "Real-time reporting for multiple stakeholders",
                        "Transparent performance tracking and investor communications",
                        "Simplified compliance and audit trails",
                ],
        },
        {
                title: "High-Net-Worth Individuals",
                description: "Turn Private Assets Into Digital Investment Vehicles",
                details: [
                        "Tokenize personal property or portfolios",
                        "Sell fractional ownership while retaining control",
                        "Create family trusts or inheritance flows via tokens",
                        "Unlock capital without traditional sales processes",
                ],
        },
        {
                title: "Commercial Tenants",
                description: "Invest in the Properties You Occupy",
                details: [
                        "Build equity while paying rent",
                        "Aligned interests with property owners",
                        "Long-term stability and lease renewal incentives",
                        "Potential appreciation alongside property value growth",
                ],
        },
];

const TokenizationInfo = () => {
        const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

        const toggleSection = (index: number) => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has(index)) {
                        newExpanded.delete(index);
                } else {
                        newExpanded.add(index);
                }
                setExpandedSections(newExpanded);
        };

        return (
                <section className="py-20 relative overflow-hidden bg-gray-50">
                        <div className="container mx-auto px-4 relative z-10">
                                <div className="max-w-7xl mx-auto">
                                        <motion.h2 
                                                className="text-center text-3xl md:text-4xl font-logo font-light text-gray-900 mb-4"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8 }}
                                        >
                                                From Concrete to Capital — Who Wins
                                        </motion.h2>
                                        <motion.p 
                                                className="text-center text-gray-600 mb-12 text-lg font-light max-w-4xl mx-auto"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, delay: 0.1 }}
                                        >
                                                From unlocking liquidity to global investor access, tokenization changes the game for everyone in CRE.
                                        </motion.p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                                {tokenizationSections.map((section, index) => (
                                                        <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 50 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                viewport={{ once: true }}
                                                                transition={{ duration: 0.7, delay: index * 0.05 }}
                                                        >
                                                                <div className="bg-white border-2 border-[#D4A024] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                                                        <div className="p-6 pb-4">
                                                                                <div
                                                                                        className="flex items-center justify-between cursor-pointer"
                                                                                        onClick={() => toggleSection(index)}
                                                                                >
                                                                                        <div className="flex-1">
                                                                                                <h3 className="text-lg text-[#D4A024] mb-2 font-logo font-light">
                                                                                                        {section.title}
                                                                                                </h3>
                                                                                                <p className="text-sm text-gray-700 font-light font-logo">
                                                                                                        {section.description}
                                                                                                </p>
                                                                                        </div>
                                                                                        <motion.div 
                                                                                                className="ml-4 text-[#D4A024]"
                                                                                                animate={{ rotate: expandedSections.has(index) ? 0 : -90 }}
                                                                                                transition={{ duration: 0.3 }}
                                                                                        >
                                                                                                <ChevronDown className="h-5 w-5" />
                                                                                        </motion.div>
                                                                                </div>
                                                                        </div>

                                                                        <AnimatePresence>
                                                                                {expandedSections.has(index) && (
                                                                                        <motion.div
                                                                                                initial={{ height: 0, opacity: 0 }}
                                                                                                animate={{ height: "auto", opacity: 1 }}
                                                                                                exit={{ height: 0, opacity: 0 }}
                                                                                                transition={{ duration: 0.4 }}
                                                                                                style={{ overflow: "hidden" }}
                                                                                        >
                                                                                                <div className="px-6 pb-6 pt-0">
                                                                                                        <div className="border-t border-gray-200 pt-4">
                                                                                                                <ul className="space-y-2.5">
                                                                                                                        {section.details.map((detail, i) => (
                                                                                                                                <motion.li
                                                                                                                                        key={i}
                                                                                                                                        initial={{ x: -20, opacity: 0 }}
                                                                                                                                        animate={{ x: 0, opacity: 1 }}
                                                                                                                                        transition={{ delay: i * 0.1 }}
                                                                                                                                        className="flex items-start"
                                                                                                                                >
                                                                                                                                        <div className="w-2 h-2 bg-[#D4A024] rounded-full mt-2 mr-3" />
                                                                                                                                        <span className="text-gray-700 font-logo text-sm">
                                                                                                                                                {detail}
                                                                                                                                        </span>
                                                                                                                                </motion.li>
                                                                                                                        ))}
                                                                                                                </ul>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </motion.div>
                                                                                )}
                                                                        </AnimatePresence>
                                                                </div>
                                                        </motion.div>
                                                ))}
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

// --- Submit Property Section ---
const propertyTypes = [
        { id: "ev-charging", name: "EV Charging Stations", icon: Activity },
        { id: "wind-farms", name: "Wind Farms", icon: Wind },
        { id: "solar-farms", name: "Solar Farms", icon: Sun },
        { id: "multifamily", name: "Multifamily", icon: Building2 },
        { id: "hospitality", name: "Hospitality", icon: Building },
        { id: "office", name: "Office", icon: Building },
        { id: "student-housing", name: "Student Housing", icon: HomeIcon },
        { id: "datacenters", name: "Datacenters", icon: Warehouse },
        { id: "mixed-use", name: "Mixed Use", icon: Layers },
        { id: "retail", name: "Retail", icon: Building2 },
        { id: "condominium", name: "Condominium", icon: HomeIcon },
        { id: "industrial", name: "Industrial", icon: Warehouse },
];

const paymentMethods = [
        { name: "USD", icon: DollarSign, description: "Traditional payments", currencies: ["USD"] },
        { name: "Stablecoins", icon: Coins, description: "Digital currency", currencies: ["USDC", "USDT"] },
];

const SubmitProperty = () => {
        return (
                <section className="py-20 bg-white">
                        <div className="container max-w-6xl mx-auto px-4">
                                <div className="text-center mb-12">
                                        <h2 className="text-3xl md:text-4xl font-logo font-light text-gray-900 mb-6">
                                                List Your Property on <span className="text-[#D4A024]">Commertize</span>
                                        </h2>
                                        <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto text-base md:text-lg font-light">
                                                Commertize connects your commercial property to a worldwide network of qualified investors. Whether you're an owner, developer, or asset manager, our platform makes it simple to tokenize your CRE and open it to fractional investment. Reach a broader audience, secure capital faster, and retain control — all with blockchain-powered transparency and efficiency.
                                        </p>
                                </div>
                                        
                                <div className="mb-12">
                                        <h3 className="text-2xl md:text-3xl font-light font-logo mb-8 text-gray-900 text-center">
                                                Your Property, Our Global Marketplace
                                        </h3>
                                        
                                        <div className="mb-16">
                                                <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden bg-white rounded-2xl border border-gray-200">
                                                        <motion.div
                                                                className="relative"
                                                                animate={{ rotate: 360 }}
                                                                transition={{
                                                                        duration: 35,
                                                                        repeat: Infinity,
                                                                        ease: "linear"
                                                                }}
                                                        >
                                                                {propertyTypes.map((type, index) => {
                                                                        const angle = (index / propertyTypes.length) * 360;
                                                                        const radius = 200;
                                                                        const x = Math.cos(angle * Math.PI / 180) * radius;
                                                                        const y = Math.sin(angle * Math.PI / 180) * radius;
                                                                        
                                                                        return (
                                                                                <div key={`subnet-${type.id}`}>
                                                                                        <div
                                                                                                className="absolute bg-[#D4A024]"
                                                                                                style={{
                                                                                                        left: 0,
                                                                                                        top: 0,
                                                                                                        width: Math.sqrt(x * x + y * y) + 'px',
                                                                                                        height: '1px',
                                                                                                        opacity: 0.4,
                                                                                                        transform: `rotate(${Math.atan2(y, x) * (180 / Math.PI)}deg)`,
                                                                                                        transformOrigin: '0 50%'
                                                                                                }}
                                                                                        />
                                                                                        
                                                                                        <motion.div
                                                                                                className="absolute"
                                                                                                style={{
                                                                                                        left: x - 60,
                                                                                                        top: y - 18
                                                                                                }}
                                                                                                animate={{ rotate: -360 }}
                                                                                                transition={{
                                                                                                        duration: 35,
                                                                                                        repeat: Infinity,
                                                                                                        ease: "linear"
                                                                                                }}
                                                                                        >
                                                                                                <div className="flex items-center space-x-2 bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024]/40 rounded-lg px-3 py-2 hover:from-[#D4A024]/10 hover:to-[#D4A024]/20 hover:border-[#D4A024]/60 transition-all duration-200 shadow-lg">
                                                                                                        <div className="w-7 h-7 rounded-full bg-[#D4A024]/20 border border-[#D4A024]/50 flex items-center justify-center">
                                                                                                                <type.icon className="w-4 h-4 text-[#D4A024]" />
                                                                                                        </div>
                                                                                                        <div>
                                                                                                                <div className="text-xs font-semibold text-gray-800">{type.name}</div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </motion.div>
                                                                                </div>
                                                                        );
                                                                })}
                                                                
                                                                {propertyTypes.map((_, index) => {
                                                                        const connections: React.ReactNode[] = [];
                                                                        
                                                                        [1, 2, 3, 4].forEach(offset => {
                                                                                const targetIndex = (index + offset) % propertyTypes.length;
                                                                                if (index < targetIndex || (index + offset >= propertyTypes.length)) {
                                                                                        const angle1 = (index / propertyTypes.length) * 360;
                                                                                        const angle2 = (targetIndex / propertyTypes.length) * 360;
                                                                                        const radius = 200;
                                                                                        const x1 = Math.cos(angle1 * Math.PI / 180) * radius;
                                                                                        const y1 = Math.sin(angle1 * Math.PI / 180) * radius;
                                                                                        const x2 = Math.cos(angle2 * Math.PI / 180) * radius;
                                                                                        const y2 = Math.sin(angle2 * Math.PI / 180) * radius;
                                                                                        
                                                                                        const deltaX = x2 - x1;
                                                                                        const deltaY = y2 - y1;
                                                                                        const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                                                                                        const rotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                                                                                        
                                                                                        const opacity = offset === 1 ? 0.35 : offset === 2 ? 0.25 : offset === 3 ? 0.18 : 0.12;
                                                                                        
                                                                                        connections.push(
                                                                                                <div
                                                                                                        key={`inter-${index}-${targetIndex}-${offset}`}
                                                                                                        className="absolute bg-[#D4A024]"
                                                                                                        style={{
                                                                                                                left: x1,
                                                                                                                top: y1,
                                                                                                                width: length + 'px',
                                                                                                                height: '1px',
                                                                                                                opacity: opacity,
                                                                                                                transform: `rotate(${rotation}deg)`,
                                                                                                                transformOrigin: '0 50%'
                                                                                                        }}
                                                                                                />
                                                                                        );
                                                                                }
                                                                        });
                                                                        
                                                                        return <div key={`connections-${index}`}>{connections}</div>;
                                                                })}
                                                        </motion.div>
                                                        
                                                        <div className="absolute flex items-center justify-center" style={{ zIndex: 2 }}>
                                                                <img src="/assets/logo.png" alt="Commertize" className="h-6 w-auto object-contain" />
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

// --- Latest News Section ---
interface NewsArticle {
        id: string;
        slug: string;
        title: string;
        summary: string;
        category: string;
        imageUrl?: string;
        readTime: number;
        publishedAt: string;
}

const fallbackArticles: NewsArticle[] = [
        {
                id: "1",
                title: "Tokenization Revolutionizes Commercial Real Estate",
                slug: "tokenization-revolutionizes-cre",
                summary: "How blockchain technology is transforming property investment and ownership.",
                category: "Tokenization",
                imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
                readTime: 5,
                publishedAt: "Jan 15, 2025"
        },
        {
                id: "2",
                title: "The Future of Fractional Property Investment",
                slug: "future-fractional-investment",
                summary: "Exploring how fractional ownership is democratizing real estate access.",
                category: "Markets",
                imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
                readTime: 4,
                publishedAt: "Jan 10, 2025"
        },
        {
                id: "3",
                title: "AI-Powered Property Valuation Models",
                slug: "ai-property-valuation",
                summary: "Machine learning is changing how we assess commercial property values.",
                category: "Technology",
                imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop",
                readTime: 6,
                publishedAt: "Jan 5, 2025"
        },
];

const formatNewsDate = (dateString: string) => {
        try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return dateString;
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
                return dateString;
        }
};

const LatestNews = () => {
        const [articles, setArticles] = useState<NewsArticle[]>(fallbackArticles);

        useEffect(() => {
                async function fetchNews() {
                        try {
                                const response = await fetch('/api/news?limit=3');
                                if (response.ok) {
                                        const result = await response.json();
                                        if (result.data && result.data.length > 0) {
                                                setArticles(result.data.slice(0, 3));
                                        }
                                }
                        } catch (error) {
                                console.error('Failed to fetch news:', error);
                        }
                }
                fetchNews();
        }, []);

        const getCategoryColor = (category: string) => {
                const colors: Record<string, string> = {
                        'CRE': 'bg-[#D4A024]',
                        'Tokenization': 'bg-purple-500',
                        'Markets': 'bg-yellow-500',
                        'Technology': 'bg-blue-500',
                        'Regulation': 'bg-red-500',
                        'DeFi': 'bg-cyan-500',
                        'RWA': 'bg-green-500',
                        'Crypto': 'bg-orange-500',
                        'Infrastructure': 'bg-teal-500',
                };
                return colors[category] || 'bg-gray-500';
        };

        return (
                <section className="py-24 bg-gradient-to-br from-gray-50/50 to-white relative overflow-hidden">
                        <div className="relative z-10 w-full overflow-hidden mb-6">
                                <div className="relative h-12 sm:h-16 md:h-20 flex items-center overflow-hidden mb-4">
                                        <motion.div
                                                animate={{ x: [0, -800] }}
                                                transition={{ duration: 16, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                                                className="flex items-center space-x-24"
                                                style={{ minWidth: "1600px" }}
                                        >
                                                {["Latest News & Insights", "Latest News & Insights", 
                                                        "Latest News & Insights", "Latest News & Insights"].map((text, index) => (
                                                        <motion.h2 
                                                                key={`${text}-${index}`}
                                                                className="text-3xl md:text-4xl lg:text-5xl font-logo font-light text-gray-900 flex-shrink-0"
                                                                style={{ minWidth: "400px", textAlign: "center" }}
                                                        >
                                                                Latest News & <span className="text-[#D4A024]">Insights</span>
                                                        </motion.h2>
                                                ))}
                                        </motion.div>
                                </div>
                        </div>

                        <div className="container mx-auto px-4 relative z-10">
                                <div className="max-w-6xl mx-auto">
                                        <div className="text-center mb-16">
                                                <div className="w-24 h-1 bg-gradient-to-r from-[#D4A024] to-yellow-600 rounded-full mx-auto mb-6"></div>
                                                <p className="text-xl text-gray-600 font-logo font-light max-w-3xl mx-auto">
                                                        Stay informed with the latest developments in commercial real estate and tokenization
                                                </p>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-6">
                                                {articles.map((article, index) => (
                                                        <motion.article
                                                                key={article.id}
                                                                className="w-full group cursor-pointer"
                                                                initial={{ opacity: 0, y: 30 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                                                viewport={{ once: true }}
                                                        >
                                                                <Link href={`/news/${article.slug}`}>
                                                                        <div className="bg-white rounded-xl border border-[#D4A024] hover:shadow-lg overflow-hidden transition-all duration-300 h-full flex flex-col">
                                                                                <div className="relative h-44 overflow-hidden flex-shrink-0">
                                                                                        <img
                                                                                                src={article.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop'}
                                                                                                alt={article.title}
                                                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                                        />
                                                                                        <div className="absolute top-3 left-3">
                                                                                                <span className={`px-3 py-1 rounded-full text-xs font-normal text-white ${getCategoryColor(article.category)}`}>
                                                                                                        {article.category}
                                                                                                </span>
                                                                                        </div>
                                                                                </div>

                                                                                <div className="p-5 flex-grow flex flex-col bg-white">
                                                                                        <h3 className="text-base font-normal text-gray-900 mb-2 line-clamp-2 leading-tight">
                                                                                                {article.title}
                                                                                        </h3>
                                                                                        
                                                                                        <p className="text-gray-500 text-sm font-light mb-4 line-clamp-3 flex-grow leading-relaxed">
                                                                                                {article.summary}
                                                                                        </p>

                                                                                        <div className="flex items-center gap-4 text-[#D4A024] text-xs">
                                                                                                <div className="flex items-center gap-1.5">
                                                                                                        <Calendar size={12} />
                                                                                                        <span>{formatNewsDate(article.publishedAt)}</span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1.5">
                                                                                                        <Clock size={12} />
                                                                                                        <span>{article.readTime} min read</span>
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                </Link>
                                                        </motion.article>
                                                ))}
                                        </div>

                                        <div className="text-center mt-12">
                                                <Link href="/news">
                                                        <button className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D4A024] to-yellow-600 text-white rounded-xl font-light hover:shadow-lg transition-all">
                                                                <span>View All News & Insights</span>
                                                                <ArrowRight size={18} />
                                                        </button>
                                                </Link>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

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
                                                                        <h3 style={{ fontWeight: '300', fontSize: '1.125rem', color: '#0f172a' }}>Upcoming Opportunities</h3>
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
                                                                                                <th className={styles.th}>Sponsor</th>
                                                                                                <th className={styles.th}>Units</th>
                                                                                                <th className={styles.th}>Status</th>
                                                                                                <th className={styles.th}></th>
                                                                                        </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                        {MOCK_PROPERTIES.map((prop) => (
                                                                                                <tr key={prop.id} className={styles.tableRow}>
                                                                                                        <td className={styles.td}>
                                                                                                                <div style={{ fontWeight: '300', color: '#0f172a' }}>{prop.title}</div>
                                                                                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prop.location}</div>
                                                                                                        </td>
                                                                                                        <td className={styles.td} style={{ fontSize: '0.875rem', color: '#475569' }}>{prop.type}</td>
                                                                                                        <td className={styles.td}>
                                                                                                                <span className={styles.financialDataNeutral} style={{ fontSize: '0.875rem' }}>{prop.sponsor}</span>
                                                                                                        </td>
                                                                                                        <td className={styles.td}>
                                                                                                                <span className={styles.financialData} style={{ fontSize: '0.875rem', color: '#475569' }}>{prop.units} Units</span>
                                                                                                        </td>
                                                                                                        <td className={styles.td}>
                                                                                                                <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: '300' }}>{prop.status}</span>
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
                        <AboutUs />
                        <WhyCommertize />
                        <CommertizeCollection />
                        <TokenizationInfo />
                        <SubmitProperty />
                        <LatestNews />

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
                                                                        <h4 className={styles.stepTitle}>Complete KYC Verification</h4>
                                                                        <p className={styles.stepDesc}>Investors must complete KYC/AML and accreditation verification before investing in properties.</p>
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
                                                                        <h4 className={styles.stepTitle}>Complete KYC Verification</h4>
                                                                        <p className={styles.stepDesc}>Sponsors must complete KYC/AML and accreditation verification before submitting properties to the platform.</p>
                                                                </div>
                                                                <div className={styles.stepCard}>
                                                                        <div className={styles.stepNumber}>2</div>
                                                                        <h4 className={styles.stepTitle}>Submit Property</h4>
                                                                        <p className={styles.stepDesc}>Upload property details and documentation through our streamlined submission portal.</p>
                                                                </div>
                                                                <div className={styles.stepCard}>
                                                                        <div className={styles.stepNumber}>3</div>
                                                                        <h4 className={styles.stepTitle}>Due Diligence Review</h4>
                                                                        <p className={styles.stepDesc}>Commertize conducts comprehensive due diligence and compliance verification.</p>
                                                                </div>
                                                                <div className={styles.stepCard}>
                                                                        <div className={styles.stepNumber}>4</div>
                                                                        <h4 className={styles.stepTitle}>List to Market</h4>
                                                                        <p className={styles.stepDesc}>Property goes live to our network of 14,000+ accredited investors.</p>
                                                                </div>
                                                                <div className={styles.stepCard}>
                                                                        <div className={styles.stepNumber}>5</div>
                                                                        <h4 className={styles.stepTitle}>Raise Capital</h4>
                                                                        <p className={styles.stepDesc}>Fund faster than traditional methods with fractional ownership and blockchain efficiency.</p>
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
                                                <h2 className={styles.techSectionTitle}>Multi-Chain Infrastructure</h2>
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
                                                        <div className={styles.partnerBadge}>Privy</div>
                                                        <div className={styles.partnerBadge}>Hedera</div>
                                                        <div className={styles.partnerBadge}>Arc</div>
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
                                                <ul className={styles.footerList}>
                                                        <li><a href="#" className={styles.footerLink}>Residential Equity</a></li>
                                                        <li><a href="#" className={styles.footerLink}>Commercial Debt</a></li>
                                                        <li><a href="#" className={styles.footerLink}>Industrial Logistics</a></li>
                                                        <li><a href="#" className={styles.footerLink}>Data Centers</a></li>
                                                </ul>
                                        </div>

                                        <div>
                                                <h4 className={styles.footerTitle}>Company</h4>
                                                <ul className={styles.footerList}>
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
                        <ChatGPTWidget />
                </div >
        );
}
