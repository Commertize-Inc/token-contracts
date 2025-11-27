"use client";

import { useState } from "react";
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
  CheckCircle
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

const keyFeatures = [
  {
    icon: Wallet,
    title: "Instant Liquidity",
    description: "Access funds without selling your property tokens"
  },
  {
    icon: LineChart,
    title: "Passive Yield",
    description: "Earn from rental income and DeFi rewards"
  },
  {
    icon: Globe,
    title: "24/7 Markets",
    description: "Trade and stake anytime, anywhere"
  }
];

export default function Nexus() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white">
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
                    className="max-w-[300px] md:max-w-[400px]"
                    style={{ width: 'auto', height: 'auto' }}
                    priority
                  />
                </motion.div>
              </div>
              <span className="inline-block mb-6 px-5 py-2 bg-[#D4A024] text-white text-sm font-semibold rounded-full uppercase tracking-wider">
                DeFi Protocol
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                The Liquidity Engine for<br />
                <span className="text-[#D4A024]">Tokenized Real Estate</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                Unlock instant liquidity from your property investments. Stake, lend, borrow, 
                and earn yield on tokenized commercial real estate assets.
              </p>
            </motion.div>
          </div>
        </section>

        {/* APY Stats Section */}
        <section className="py-16 bg-[#D4A024]/5 border-y-2 border-[#D4A024]/20">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-[#D4A024] rounded-3xl p-10 text-center shadow-xl max-w-lg w-full"
              >
                <div className="w-20 h-20 bg-[#D4A024]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LineChart className="w-10 h-10 text-[#D4A024]" />
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest mb-3 font-semibold">Protocol APY</div>
                <div className="text-6xl md:text-7xl font-light text-[#D4A024] mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  --
                </div>
                <div className="text-gray-500">Variable rate based on protocol activity</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Why <span className="text-[#D4A024]">Nexus</span>?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                The first DeFi protocol purpose-built for tokenized commercial real estate
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 border-2 border-gray-200 hover:border-[#D4A024] rounded-2xl p-8 text-center transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-[#D4A024]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <feature.icon className="w-8 h-8 text-[#D4A024]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center mb-14">
              <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-lg border-2 border-gray-200">
                {["overview", "products", "security"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-3.5 text-sm font-semibold rounded-xl transition-all capitalize ${
                      activeTab === tab 
                        ? "bg-[#D4A024] text-white shadow-lg" 
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
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white border-2 border-[#D4A024] rounded-3xl p-10 mb-16 shadow-lg">
                  <h2 className="text-3xl font-light mb-6 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    What is <span className="text-[#D4A024]">Nexus</span>?
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    Nexus is Commertize's decentralized finance protocol — a liquidity engine enabling 
                    investors to borrow, lend, and earn yield from tokenized commercial real estate assets. 
                    Built on Ethereum, Nexus bridges traditional property value with DeFi lending pools, 
                    providing instant liquidity without selling your assets.
                  </p>
                </div>

                {/* How It Works */}
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-light text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    How <span className="text-[#D4A024]">Nexus</span> Works
                  </h3>
                </div>
                <div className="grid md:grid-cols-4 gap-6">
                  {howItWorks.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-gray-200 hover:border-[#D4A024] rounded-2xl p-8 text-center transition-all duration-300 shadow-md"
                    >
                      <div className="w-14 h-14 bg-[#D4A024] text-white rounded-full flex items-center justify-center mx-auto mb-5 text-2xl font-light">
                        {item.step}
                      </div>
                      <h4 className="font-semibold mb-3 text-gray-900 text-lg">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
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
                className="max-w-6xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-light text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    DeFi <span className="text-[#D4A024]">Products</span>
                  </h2>
                  <p className="text-gray-600 text-lg">Earn yield on your tokenized real estate in multiple ways</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {defiProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-gray-200 hover:border-[#D4A024] rounded-3xl p-8 transition-all duration-300 shadow-lg"
                    >
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-14 h-14 bg-[#D4A024]/10 rounded-2xl flex items-center justify-center">
                          <product.icon className="w-7 h-7 text-[#D4A024]" />
                        </div>
                        <h3 className="text-2xl font-light text-gray-900">{product.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                      <div className="space-y-3 mb-6">
                        {product.features.map((feature) => (
                          <div key={feature} className="flex items-center text-gray-700">
                            <CheckCircle className="w-5 h-5 text-[#D4A024] mr-3" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-4 bg-[#D4A024] hover:bg-[#B8860B] text-white font-semibold rounded-xl transition-colors text-lg">
                        Enter {product.title}
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
                className="max-w-5xl mx-auto"
              >
                <div className="bg-white border-2 border-[#D4A024] rounded-3xl p-10 mb-12 text-center shadow-lg">
                  <div className="w-24 h-24 bg-[#D4A024]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-12 h-12 text-[#D4A024]" />
                  </div>
                  <h2 className="text-3xl font-light mb-6 text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Security <span className="text-[#D4A024]">First</span>
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                    Nexus operates via audited smart contracts with built-in risk parameters 
                    and collateralization ratios to ensure platform integrity. Your assets are 
                    protected by multiple layers of security.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {securityFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border-2 border-gray-200 hover:border-[#D4A024] rounded-2xl p-8 transition-all duration-300 shadow-md"
                    >
                      <div className="flex items-start space-x-5">
                        <div className="w-14 h-14 bg-[#D4A024]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <feature.icon className="w-7 h-7 text-[#D4A024]" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-gray-900 text-xl">{feature.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
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
