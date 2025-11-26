"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  Zap,
  Lock,
  ArrowRight,
  DollarSign,
  Building2,
  Users,
  Globe,
  Wallet,
  PiggyBank,
  LineChart,
  Target,
  CheckCircle,
  Clock
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
    color: "from-[#D4A024]/20 to-[#B8860B]/20"
  },
  {
    id: "lending",
    title: "Property-Backed Lending",
    description: "Borrow against your tokenized property holdings with competitive rates and flexible terms.",
    icon: DollarSign,
    features: ["Flexible LTV ratios", "Instant liquidity", "No credit checks"],
    color: "from-blue-500/20 to-blue-600/20"
  },
  {
    id: "farming",
    title: "Yield Farming",
    description: "Provide liquidity to CRE-USDC pools and earn enhanced yields plus CTZ governance tokens.",
    icon: Zap,
    features: ["Dual rewards", "LP incentives", "CTZ airdrops"],
    color: "from-green-500/20 to-green-600/20"
  },
  {
    id: "vaults",
    title: "Smart Vaults",
    description: "Automated yield optimization strategies across multiple property pools for maximum returns.",
    icon: Target,
    features: ["Auto-rebalancing", "Risk-adjusted", "Gas optimized"],
    color: "from-purple-500/20 to-purple-600/20"
  }
];

const securityFeatures = [
  {
    title: "Audited Smart Contracts",
    description: "All contracts will be audited by leading security firms before launch.",
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

const upcomingFeatures = [
  { label: "Total Value Locked", icon: Lock },
  { label: "Active Investors", icon: Users },
  { label: "Average APY", icon: LineChart },
  { label: "Properties Tokenized", icon: Building2 },
];

export default function Nexus() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50/20 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4A024]/5 via-transparent to-[#B8860B]/5" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Image
                    src="/assets/nexus-logo.png"
                    alt="Nexus"
                    width={400}
                    height={81}
                    className="max-w-[320px] md:max-w-[400px]"
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                  />
                </motion.div>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="inline-block px-4 py-1.5 bg-[#D4A024]/10 text-[#D4A024] text-sm font-medium rounded-full border border-[#D4A024]/30">
                  DeFi Protocol
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-medium rounded-full border border-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  Coming Soon
                </span>
              </div>
              <p className="text-xl text-gray-600 mb-4 font-light">
                The Liquidity Engine for Tokenized Real Estate
              </p>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 font-light">
                Unlock instant liquidity from your property investments. Stake, lend, borrow, 
                and earn yield on tokenized commercial real estate assets.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/marketplace"
                  className="inline-flex items-center px-6 py-3 bg-[#D4A024] hover:bg-[#B8860B] text-white font-light rounded-xl transition-colors"
                >
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <button 
                  className="inline-flex items-center px-6 py-3 border-2 border-[#D4A024] text-[#D4A024] hover:bg-[#D4A024]/10 font-light rounded-xl transition-colors"
                >
                  Join Waitlist
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Coming Soon Stats Section */}
        <section className="py-12 border-y border-[#D4A024]/20 bg-white/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {upcomingFeatures.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm border border-[#D4A024]/30 rounded-2xl p-6 text-center shadow-sm"
                >
                  <item.icon className="w-8 h-8 text-[#D4A024] mx-auto mb-3" />
                  <div className="text-2xl font-light mb-1 text-gray-400">--</div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-12">
              <div className="inline-flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                {["overview", "products", "security"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 text-sm font-light rounded-lg transition-all capitalize ${
                      activeTab === tab 
                        ? "bg-[#D4A024] text-white shadow-sm" 
                        : "text-gray-600 hover:text-[#D4A024]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024] rounded-2xl p-8 mb-12">
                  <h2 className="text-2xl font-light mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What is Nexus?</h2>
                  <p className="text-gray-600 mb-6 leading-relaxed font-light">
                    Nexus is Commertize's decentralized finance protocol — a liquidity engine enabling 
                    investors to borrow, lend, and earn yield from tokenized commercial real estate assets. 
                    Built on Ethereum, Nexus bridges traditional property value with DeFi lending pools, 
                    providing instant liquidity without selling your assets.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-start space-x-3">
                      <Wallet className="w-6 h-6 text-[#D4A024] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1 text-gray-900">Instant Liquidity</h4>
                        <p className="text-sm text-gray-500">Access funds without selling your property tokens</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <LineChart className="w-6 h-6 text-[#D4A024] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1 text-gray-900">Passive Yield</h4>
                        <p className="text-sm text-gray-500">Earn from rental income and DeFi rewards</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Globe className="w-6 h-6 text-[#D4A024] mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1 text-gray-900">24/7 Markets</h4>
                        <p className="text-sm text-gray-500">Trade and stake anytime, anywhere</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <h3 className="text-2xl font-light mb-6 text-center text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>How Nexus Works</h3>
                <div className="grid md:grid-cols-4 gap-4 mb-12">
                  {howItWorks.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-[#D4A024]/30 rounded-2xl p-6 text-center shadow-sm"
                    >
                      <div className="w-12 h-12 bg-[#D4A024] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-light">
                        {item.step}
                      </div>
                      <h4 className="font-medium mb-2 text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
              >
                <div className="text-center mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-full border border-amber-300">
                    <Clock className="w-4 h-4" />
                    All products launching soon
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {defiProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-gradient-to-br ${product.color} border-2 border-[#D4A024]/30 rounded-2xl p-6 transition-all duration-300 relative overflow-hidden`}
                    >
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-[#D4A024]/20 rounded-full flex items-center justify-center">
                          <product.icon className="w-6 h-6 text-[#D4A024]" />
                        </div>
                        <h3 className="text-xl font-light text-gray-900">{product.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4 font-light">{product.description}</p>
                      <div className="space-y-2 mb-4">
                        {product.features.map((feature) => (
                          <div key={feature} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button 
                        disabled
                        className="w-full py-3 bg-gray-300 text-gray-500 font-light rounded-xl cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div className="bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024] rounded-2xl p-8 mb-8 text-center">
                  <Shield className="w-16 h-16 text-[#D4A024] mx-auto mb-4" />
                  <h2 className="text-2xl font-light mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Security First</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto font-light">
                    Nexus will operate via audited smart contracts with built-in risk parameters 
                    and collateralization ratios to ensure platform integrity. Your assets will be 
                    protected by multiple layers of security.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {securityFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-[#D4A024]/30 rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#D4A024]/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-6 h-6 text-[#D4A024]" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 text-gray-900">{feature.title}</h4>
                          <p className="text-sm text-gray-500">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-[#D4A024]/10 to-[#B8860B]/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-3xl md:text-4xl font-light mb-4 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Be the First to Access Nexus
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto font-light">
                Join our waitlist to get early access when Nexus launches and start earning yield on your tokenized real estate holdings.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  className="inline-flex items-center px-6 py-3 bg-[#D4A024] hover:bg-[#B8860B] text-white font-light rounded-xl transition-colors"
                >
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
                <Link 
                  href="/marketplace"
                  className="inline-flex items-center px-6 py-3 border-2 border-[#D4A024] text-[#D4A024] hover:bg-[#D4A024]/10 font-light rounded-xl transition-colors"
                >
                  View Properties
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* RUNE.CTZ Chatbot */}
        <ChatGPTWidget />
      </div>
    </>
  );
}
