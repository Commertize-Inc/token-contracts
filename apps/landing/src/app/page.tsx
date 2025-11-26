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
        MapPin
} from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';
import { Button, Logo } from '@commertize/ui';

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
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'
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
                image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop'
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
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop'
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
                setIsVisible(true);
        }, []);

        if (!hasMounted || !isVisible) return null;

        return (
                <div className={styles.cookieConsent}>
                        <button className={styles.cookieClose} onClick={() => setIsVisible(false)}>
                                <X size={16} />
                        </button>
                        <h4 className={styles.cookieTitle}>Cookie Settings</h4>
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
                </div>
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
                                initial={{ scale: 1 }}
                                animate={{ scale: [1.0, 1.25] }}
                                transition={{
                                        duration: 12,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        repeatType: "reverse"
                                }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-white/60"></div>
                </div>

                <div className="container relative z-10 px-4">
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
                <section id="about" className="relative overflow-hidden min-h-[800px]">
                        <div className="absolute inset-0">
                                <motion.div
                                        className="absolute inset-0"
                                        animate={{ scale: [1.0, 1.15] }}
                                        transition={{
                                                duration: 25,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                repeatType: "reverse"
                                        }}
                                >
                                        <img 
                                                src="/assets/commertize-vision-bg.jpg"
                                                alt="" 
                                                className="w-full h-full object-cover"
                                        />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
                        </div>

                        <div className="container relative z-10 px-4 py-20 md:py-28">
                                <motion.div 
                                        className="max-w-4xl mx-auto"
                                        initial={{ opacity: 0, y: 60 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                >
                                        <motion.h2 
                                                className="text-3xl md:text-4xl font-logo font-light text-center mb-10 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, amount: 0.5 }}
                                                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                                        >
                                                The {companyName} Vision
                                        </motion.h2>
                                        
                                        <div className="prose max-w-none text-center space-y-6">
                                                <motion.p 
                                                        className="text-base md:text-lg font-logo font-light text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                                >
                                                        {companyName} is building the next-generation platform and ecosystem for commercial real estate and infrastructure, merging the power of AI, blockchain, tokenization, and decentralized finance (DeFi) into one intelligent network.
                                                </motion.p>
                                                <motion.p 
                                                        className="text-base md:text-lg font-logo font-light text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{ duration: 0.8, delay: 0.45, ease: "easeOut" }}
                                                >
                                                        Our mission is to create the digital foundation that connects real-world assets to global capital markets—enhancing liquidity, transparency, and access across the commercial real estate landscape.
                                                </motion.p>
                                                <motion.p 
                                                        className="text-base md:text-lg font-logo font-light text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                                                >
                                                        Through AI-driven analytics, blockchain-enabled trust, and a compliant financial infrastructure, {companyName} empowers investors and property owners to own, trade, and build the next era of real estate finance.
                                                </motion.p>
                                                <motion.p 
                                                        className="text-base md:text-lg font-logo font-light text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        whileInView={{ opacity: 1, y: 0 }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{ duration: 0.8, delay: 0.75, ease: "easeOut" }}
                                                >
                                                        From office buildings and multifamily properties to data centers, solar farms, and sustainable infrastructure, {companyName} is redefining how the world invests in the built environment—making real assets as dynamic, efficient, and borderless as digital ones.
                                                </motion.p>
                                        </div>
                                </motion.div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 flex items-center overflow-hidden">
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
                                                        <span className="text-xl md:text-2xl font-logo font-light text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                                                {phrase}
                                                        </span>
                                                </motion.div>
                                        ))}
                                </motion.div>
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
                                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-light rounded-[0.75rem] whitespace-nowrap border border-gray-200">{property.type}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                                                                <MapPin size={14} className="text-[#D4A024]" />
                                                                <span className="font-light">{property.location}</span>
                                                        </div>
                                                        
                                                        <div className="mb-3">
                                                                <div className="text-xs text-gray-400 font-light">Sponsor</div>
                                                                <div className="text-sm text-gray-700 font-light">{property.sponsor}</div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm text-gray-500 font-light">{property.status}</span>
                                                                <span className="text-sm text-gray-500 font-light">{property.funded}%</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4">
                                                                <div 
                                                                        className="h-full bg-[#D4A024] rounded-full transition-all duration-500"
                                                                        style={{ width: `${property.funded}%` }}
                                                                />
                                                        </div>
                                                        
                                                        <div className="text-center mb-4">
                                                                <div className="text-sm text-gray-700 font-light">More Details Coming Soon</div>
                                                                <div className="text-xs text-gray-400 font-light">Investment details available shortly.</div>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-center mb-4">
                                                                <span className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm font-light rounded-[0.75rem]">
                                                                        {property.units} Units
                                                                </span>
                                                        </div>
                                                        
                                                        <button className="w-full py-3 bg-[#D4A024] text-white text-sm font-light rounded-[0.75rem] hover:bg-[#B8860B] transition-colors">
                                                                View Property
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
                                        <motion.p 
                                                className="text-center text-gray-600 mb-12 text-lg font-light max-w-4xl mx-auto"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8 }}
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
                                        
                                        <div className="mb-8">
                                                <div className="relative h-[450px] md:h-[550px] w-full flex items-center justify-center overflow-hidden bg-white rounded-2xl border border-gray-200">
                                                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                                                                {propertyTypes.map((_, index) => {
                                                                        const angle = (index / propertyTypes.length) * 360 - 90;
                                                                        const radius = 180;
                                                                        const centerX = 50;
                                                                        const centerY = 50;
                                                                        const x = centerX + Math.cos(angle * Math.PI / 180) * (radius / 5);
                                                                        const y = centerY + Math.sin(angle * Math.PI / 180) * (radius / 5);
                                                                        return (
                                                                                <line
                                                                                        key={`line-${index}`}
                                                                                        x1="50%"
                                                                                        y1="50%"
                                                                                        x2={`${x}%`}
                                                                                        y2={`${y}%`}
                                                                                        stroke="#D4A024"
                                                                                        strokeWidth="1"
                                                                                        strokeOpacity="0.4"
                                                                                />
                                                                        );
                                                                })}
                                                        </svg>
                                                        
                                                        <motion.div
                                                                className="relative w-[380px] h-[380px] md:w-[480px] md:h-[480px]"
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                                                style={{ zIndex: 1 }}
                                                        >
                                                                {propertyTypes.map((type, index) => {
                                                                        const angle = (index / propertyTypes.length) * 360 - 90;
                                                                        const radius = 160;
                                                                        const x = Math.cos(angle * Math.PI / 180) * radius;
                                                                        const y = Math.sin(angle * Math.PI / 180) * radius;
                                                                        
                                                                        return (
                                                                                <motion.div
                                                                                        key={type.id}
                                                                                        className="absolute"
                                                                                        style={{ 
                                                                                                left: `calc(50% + ${x}px - 55px)`, 
                                                                                                top: `calc(50% + ${y}px - 16px)` 
                                                                                        }}
                                                                                        animate={{ rotate: -360 }}
                                                                                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                                                                                >
                                                                                        <div className="flex items-center space-x-2 bg-white border-2 border-[#D4A024] rounded-[0.75rem] px-3 py-2 shadow-sm hover:shadow-md transition-shadow">
                                                                                                <div className="w-6 h-6 rounded-full bg-[#D4A024] flex items-center justify-center">
                                                                                                        <type.icon className="w-3.5 h-3.5 text-white" />
                                                                                                </div>
                                                                                                <div className="text-xs font-light text-gray-800 whitespace-nowrap">{type.name}</div>
                                                                                        </div>
                                                                                </motion.div>
                                                                        );
                                                                })}
                                                        </motion.div>
                                                        
                                                        <div className="absolute flex items-center gap-2" style={{ zIndex: 2 }}>
                                                                <img src="/assets/logo.png" alt="Commertize" className="h-8 w-auto object-contain" />
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

// --- Latest News Section ---
const sampleArticles = [
        {
                id: "1",
                title: "Tokenization Revolutionizes Commercial Real Estate",
                slug: "tokenization-revolutionizes-cre",
                summary: "How blockchain technology is transforming property investment and ownership.",
                category: "Tokenization",
                imageUrl: "/assets/building-modern.jpg",
                readTime: 5,
                publishedAt: "Jan 15, 2025"
        },
        {
                id: "2",
                title: "The Future of Fractional Property Investment",
                slug: "future-fractional-investment",
                summary: "Exploring how fractional ownership is democratizing real estate access.",
                category: "Markets",
                imageUrl: "/assets/building-tall.jpg",
                readTime: 4,
                publishedAt: "Jan 10, 2025"
        },
        {
                id: "3",
                title: "AI-Powered Property Valuation Models",
                slug: "ai-property-valuation",
                summary: "Machine learning is changing how we assess commercial property values.",
                category: "Technology",
                imageUrl: "/assets/building-curved.jpg",
                readTime: 6,
                publishedAt: "Jan 5, 2025"
        },
];

const LatestNews = () => {
        const getCategoryColor = (category: string) => {
                const colors: Record<string, string> = {
                        'Tokenization': 'bg-purple-100 text-purple-700',
                        'Markets': 'bg-yellow-100 text-yellow-700',
                        'Technology': 'bg-indigo-100 text-indigo-700',
                };
                return colors[category] || 'bg-gray-100 text-gray-700';
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

                                        <div className="grid md:grid-cols-3 gap-8">
                                                {sampleArticles.map((article, index) => (
                                                        <motion.article
                                                                key={article.id}
                                                                className="w-full"
                                                                initial={{ opacity: 0, y: 30 }}
                                                                whileInView={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                                                viewport={{ once: true }}
                                                        >
                                                                <div className="bg-white rounded-2xl shadow-sm border-2 border-[#D4A024] overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                                                                        <Link href={`/news/${article.slug}`}>
                                                                                <div className="cursor-pointer h-full flex flex-col">
                                                                                        <div className="relative h-48 overflow-hidden flex-shrink-0 bg-gray-200">
                                                                                                {article.imageUrl && (
                                                                                                        <img
                                                                                                                src={article.imageUrl}
                                                                                                                alt={article.title}
                                                                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                                                                        />
                                                                                                )}
                                                                                                <div className="absolute top-4 left-4">
                                                                                                        <span className={`px-3 py-1 rounded-full text-xs font-light ${getCategoryColor(article.category)}`}>
                                                                                                                {article.category}
                                                                                                        </span>
                                                                                                </div>
                                                                                        </div>

                                                                                        <div className="p-6 flex-grow flex flex-col">
                                                                                                <h3 className="text-lg font-logo font-light text-gray-900 mb-3 line-clamp-2 group-hover:text-[#D4A024] transition-colors">
                                                                                                        {article.title}
                                                                                                </h3>
                                                                                                
                                                                                                <p className="text-gray-600 font-logo font-light text-sm mb-4 line-clamp-3 flex-grow">
                                                                                                        {article.summary}
                                                                                                </p>

                                                                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                                                                                        <div className="flex items-center gap-1">
                                                                                                                <Calendar size={12} />
                                                                                                                <span>{article.publishedAt}</span>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1">
                                                                                                                <Clock size={12} />
                                                                                                                <span>{article.readTime} min</span>
                                                                                                        </div>
                                                                                                </div>

                                                                                                <div className="flex items-center gap-2 text-[#D4A024] text-sm font-light group-hover:gap-3 transition-all mt-auto">
                                                                                                        <span>Read More</span>
                                                                                                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        </Link>
                                                                </div>
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
                        <CommertizeCollection />
                        <TokenizationInfo />
                        <SubmitProperty />
                        <LatestNews />
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
                </div >
        );
}
