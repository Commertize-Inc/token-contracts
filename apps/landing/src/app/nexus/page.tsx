"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Shield,
  Zap,
  Lock,
  DollarSign,
  Building2,
  Globe,
  Wallet,
  PiggyBank,
  LineChart,
  Target,
  CheckCircle,
  ArrowDown
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ChatGPTWidget from "@/components/ChatGPTWidget";
import Footer from "@/components/Footer";

const defiProducts = [
  {
    id: "staking",
    title: "CRE Staking",
    description: "Stake your tokenized real estate assets to earn passive yield from rental income and appreciation.",
    icon: PiggyBank,
    features: ["Daily rewards", "No lock-up periods", "Auto-compound"],
  },
  {
    id: "lending",
    title: "Property-Backed Lending",
    description: "Borrow against your tokenized property holdings with competitive rates and flexible terms.",
    icon: DollarSign,
    features: ["Flexible LTV ratios", "Instant liquidity", "No credit checks"],
  },
  {
    id: "farming",
    title: "Yield Farming",
    description: "Provide liquidity to CRE-USDC pools and earn enhanced yields plus CTZ governance tokens.",
    icon: Zap,
    features: ["Dual rewards", "LP incentives", "CTZ airdrops"],
  },
  {
    id: "vaults",
    title: "Smart Vaults",
    description: "Automated yield optimization strategies across multiple property pools for maximum returns.",
    icon: Target,
    features: ["Auto-rebalancing", "Risk-adjusted", "Gas optimized"],
  }
];

const securityFeatures = [
  {
    title: "Audited Smart Contracts",
    description: "All contracts audited by leading security firms.",
    icon: Shield
  },
  {
    title: "Multi-Sig Treasury",
    description: "Protocol funds secured by multi-signature wallet with timelocked transactions.",
    icon: Lock
  },
  {
    title: "Real Estate Collateral",
    description: "Every token backed by verified commercial real estate assets with clear title.",
    icon: Building2
  },
  {
    title: "Insurance Coverage",
    description: "Smart contract coverage and property insurance through trusted carriers.",
    icon: CheckCircle
  }
];

const howItWorks = [
  { step: "1", title: "Connect Wallet", desc: "Link your Web3 wallet to access Nexus" },
  { step: "2", title: "Deposit Assets", desc: "Stake property tokens or stablecoins" },
  { step: "3", title: "Earn Yield", desc: "Receive rewards from protocol fees" },
  { step: "4", title: "Withdraw Anytime", desc: "Access your funds when you need them" }
];

const SectionTitle = ({ label, title, light = false }: { label: string; title: string; light?: boolean }) => (
  <div className="text-center mb-12">
    <span className={`inline-block px-4 py-1.5 ${light ? 'bg-[#D4A024]/20' : 'bg-[#D4A024]/10'} text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-4`}>
      {label}
    </span>
    <h2 className={`text-3xl md:text-4xl font-light ${light ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
      {title}
    </h2>
  </div>
);

export default function Nexus() {
  return (
    <>
      <Navbar />
      <div className="relative min-h-screen pt-16">
        {/* Fixed Full-Page Background */}
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/nexus-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-white/30" />
        </div>
        
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative py-24 md:py-32 overflow-hidden z-10">
          {/* Lighter overlay for hero */}
          <div className="absolute inset-0 bg-white/50" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <Image
                src="/assets/nexus-logo.png"
                alt="Nexus"
                width={400}
                height={81}
                className="max-w-[280px] md:max-w-[350px] mx-auto mb-8"
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
              <span className="inline-block px-4 py-2 bg-[#D4A024] text-white text-sm font-bold uppercase tracking-wider rounded-full mb-6">
                DeFi Protocol
              </span>
              <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                The Liquidity Engine for <span className="text-[#D4A024]">Tokenized Real Estate</span>
              </h1>
              <p className="text-gray-600 text-lg max-w-xl mx-auto">
                Stake, lend, borrow, and earn yield on tokenized commercial real estate assets.
              </p>
              <div className="mt-8">
                <ArrowDown className="w-6 h-6 text-[#D4A024] mx-auto animate-bounce" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================== APY SECTION ==================== */}
        <section className="relative py-16 z-10">
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-md mx-auto text-center">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border-2 border-[#D4A024] shadow-lg">
                <LineChart className="w-12 h-12 text-[#D4A024] mx-auto mb-4" />
                <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Protocol APY</div>
                <div className="text-5xl md:text-6xl font-light text-[#D4A024]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  --
                </div>
                <div className="text-sm text-gray-500 mt-2">Variable rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== WHAT IS NEXUS ==================== */}
        <section id="about" className="relative py-16 z-10">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <SectionTitle label="About" title="What is Nexus?" />
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-lg">
                <p className="text-gray-700 text-lg leading-relaxed text-center">
                  Nexus is Commertize's decentralized finance protocol — a liquidity engine enabling 
                  investors to borrow, lend, and earn yield from tokenized commercial real estate assets. 
                  Built on Ethereum, Nexus bridges traditional property value with DeFi lending pools, 
                  providing instant liquidity without selling your assets.
                </p>
              </div>
              
              {/* Key Benefits */}
              <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="text-center p-6">
                  <Wallet className="w-10 h-10 text-[#D4A024] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Liquidity</h3>
                  <p className="text-sm text-gray-600">Access funds without selling</p>
                </div>
                <div className="text-center p-6">
                  <LineChart className="w-10 h-10 text-[#D4A024] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Passive Yield</h3>
                  <p className="text-sm text-gray-600">Earn from rental income & DeFi</p>
                </div>
                <div className="text-center p-6">
                  <Globe className="w-10 h-10 text-[#D4A024] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">24/7 Markets</h3>
                  <p className="text-sm text-gray-600">Trade anytime, anywhere</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section id="how-it-works" className="relative py-16 z-10">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <SectionTitle label="Process" title="How It Works" />
              <div className="grid md:grid-cols-4 gap-4">
                {howItWorks.map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center border border-gray-200 shadow-lg"
                  >
                    <div className="w-10 h-10 bg-[#D4A024] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                      {item.step}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PRODUCTS ==================== */}
        <section id="products" className="relative py-16 z-10">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <SectionTitle label="Earn" title="DeFi Products" />
              <div className="grid md:grid-cols-2 gap-6">
                {defiProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/95 backdrop-blur-md rounded-xl p-6 border-2 border-gray-200 hover:border-[#D4A024] transition-colors shadow-lg"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#D4A024]/10 rounded-xl flex items-center justify-center">
                        <product.icon className="w-6 h-6 text-[#D4A024]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <div className="space-y-2">
                      {product.features.map((feature) => (
                        <div key={feature} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-[#D4A024] mr-2 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-[#D4A024] hover:bg-[#B8860B] text-white font-semibold rounded-lg transition-colors">
                      Enter {product.title}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECURITY ==================== */}
        <section id="security" className="relative py-16 z-10">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <SectionTitle label="Trust" title="Security First" />
              <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
                Your assets are protected by multiple layers of security including audited smart contracts 
                and collateralization ratios.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {securityFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-gray-200 flex items-start gap-4 shadow-lg"
                  >
                    <div className="w-12 h-12 bg-[#D4A024]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-[#D4A024]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="relative z-10 bg-white">
          <Footer />
        </div>

        {/* RUNE.CTZ Chatbot */}
        <ChatGPTWidget />
      </div>
    </>
  );
}
