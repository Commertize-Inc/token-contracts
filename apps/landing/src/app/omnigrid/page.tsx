"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Sun,
  Server,
  Building2,
  Wrench,
  Link as LinkIcon,
  MapPin,
  Gem,
  Factory,
  Wheat,
  Trees,
  Droplets,
  ArrowDown
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ChatGPTWidget from "@/components/ChatGPTWidget";
import Footer from "@/components/Footer";

const infrastructureCategories = [
  {
    icon: Gem,
    title: "Resource Infrastructure",
    subtitle: "Foundational Layer: Precious & Industrial Metals",
    description: "Tokenized ownership of actual mining operations and facilities — gold, silver, platinum, palladium mines, lithium extraction sites, cobalt operations, and rare earth element mining infrastructure.",
    examples: "Physical mine ownership, mining operations, processing facilities, resource rights"
  },
  {
    icon: Sun,
    title: "Energy Infrastructure",
    subtitle: "Powering the Physical & Digital World",
    description: "Clean, renewable, and distributed energy projects — solar farms, wind turbines, hydropower, geothermal, and hydrogen production.",
    examples: "Energy credits, power purchase revenue, carbon offset yield"
  },
  {
    icon: Factory,
    title: "Industrial Infrastructure",
    subtitle: "Physical Facilities & Manufacturing Nodes",
    description: "Green manufacturing plants, EV battery gigafactories, sustainable material processing sites, and industrial logistics hubs.",
    examples: "Income-producing facilities, infrastructure bonds"
  },
  {
    icon: Server,
    title: "Digital Infrastructure",
    subtitle: "The Backbone of the Data Economy",
    description: "Data centers, edge computing sites, fiber optic networks, satellite nodes, and AI compute clusters powering the digital world.",
    examples: "Data capacity ownership, hosting yield, compute tokens"
  },
  {
    icon: Wheat,
    title: "Agricultural & Land Infrastructure",
    subtitle: "Sustainable Food & Resource Production",
    description: "Productive, sustainable land use — farmland, vineyards, timberland, aquaculture, and regenerative agriculture systems.",
    examples: "Yield tokens, crop revenue, carbon-linked income"
  },
  {
    icon: Trees,
    title: "Environmental Infrastructure",
    subtitle: "The Planet's Regenerative Layer",
    description: "Carbon capture projects, reforestation, biodiversity zones, water rights, and environmental restoration initiatives.",
    examples: "Carbon credits, biodiversity credits, ESG yield assets"
  },
  {
    icon: Building2,
    title: "Urban Infrastructure",
    subtitle: "Smart & Sustainable Cities",
    description: "Smart buildings, IoT-enabled CRE, green transportation hubs, EV charging networks, and circular economy facilities.",
    examples: "Utility revenue, lease participation, smart-city systems"
  },
  {
    icon: Droplets,
    title: "Water & Marine Infrastructure",
    subtitle: "Blue Economy Layer",
    description: "Water rights, purification plants, desalination systems, marine energy projects, and ocean-based infrastructure.",
    examples: "Water credit tokens, royalties, infrastructure-backed yield"
  }
];

const currentStatus = [
  {
    icon: Wrench,
    text: "Select developments currently under way"
  },
  {
    icon: LinkIcon,
    text: "Integrated within the Commertize ecosystem"
  },
  {
    icon: MapPin,
    text: "Expansion partnerships in multiple regions"
  }
];

export default function OmniGrid() {
  const scrollToOverview = () => {
    const element = document.getElementById('overview');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative w-full min-h-screen flex flex-col">
        {/* Animated Background Image */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{ width: '150%', height: '100%' }}
            animate={{ x: ['0%', '-25%'] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
          >
            <Image
              src="/assets/omnigrid-bg-new.jpg"
              alt=""
              fill
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center z-10 pt-16">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-6">
                <div className="relative">
                  {/* Decorative lines above letters */}
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <svg width="700" height="30" viewBox="0 0 700 30" className="max-w-full">
                      {/* Lines connecting to letters - O M N I G R I D */}
                      <line x1="45" y1="28" x2="45" y2="10" stroke="white" strokeWidth="1.5" />
                      <line x1="45" y1="10" x2="120" y2="10" stroke="white" strokeWidth="1.5" />
                      <line x1="120" y1="10" x2="120" y2="28" stroke="white" strokeWidth="1.5" />
                      
                      <line x1="200" y1="28" x2="200" y2="5" stroke="white" strokeWidth="1.5" />
                      <line x1="200" y1="5" x2="320" y2="5" stroke="white" strokeWidth="1.5" />
                      <line x1="320" y1="5" x2="320" y2="28" stroke="white" strokeWidth="1.5" />
                      
                      <line x1="420" y1="28" x2="420" y2="12" stroke="white" strokeWidth="1.5" />
                      <line x1="420" y1="12" x2="540" y2="12" stroke="white" strokeWidth="1.5" />
                      <line x1="540" y1="12" x2="540" y2="28" stroke="white" strokeWidth="1.5" />
                      
                      <line x1="620" y1="28" x2="620" y2="8" stroke="white" strokeWidth="1.5" />
                      <line x1="620" y1="8" x2="660" y2="8" stroke="white" strokeWidth="1.5" />
                      <line x1="660" y1="8" x2="660" y2="28" stroke="white" strokeWidth="1.5" />
                    </svg>
                  </div>
                  {/* Main logo text */}
                  <h1 
                    className="text-6xl md:text-8xl font-extralight text-white tracking-[0.3em] pt-4"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    OMNIGRID
                  </h1>
                </div>
              </div>
              <div className="w-24 h-1 bg-[#D4A024] mx-auto mb-8" />
              <p className="text-xl md:text-2xl font-light text-white mb-8">
                The Infrastructure Intelligence Layer
              </p>
              <p className="text-lg font-light text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
                Mapping and tokenizing the world's critical infrastructure — from energy and resources to data and sustainability.
              </p>
              <button
                onClick={scrollToOverview}
                className="bg-white hover:bg-white/90 text-black font-light text-lg px-8 py-4 rounded-lg transition-colors"
              >
                Learn More
              </button>
            </motion.div>
          </div>
        </section>

        {/* Overview Section */}
        <section id="overview" className="py-24 bg-black/60 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-block px-4 py-1.5 bg-[#D4A024]/20 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                About
              </span>
              <h2 className="text-4xl md:text-5xl font-light mb-8 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Physical <span className="text-[#D4A024]">Meets</span> Digital
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-xl font-light text-white/90 leading-relaxed">
                  OmniGrid is Commertize's infrastructure and development division — connecting the physical and digital economies through sustainable, tokenization-ready assets across the globe.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 8 Infrastructure Pillars */}
        <section className="py-24 bg-black/40 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 bg-[#D4A024]/20 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                Pillars
              </span>
              <h2 className="text-4xl md:text-5xl font-light mb-4 text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Eight Pillars of <span className="text-[#D4A024]">Global Infrastructure</span>
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto mt-4">
                From earth's resources to digital networks — a comprehensive infrastructure intelligence layer
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {infrastructureCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/95 backdrop-blur-md border-2 border-[#D4A024]/50 hover:border-[#D4A024] rounded-2xl p-6 transition-all duration-300 shadow-xl"
                >
                  <div className="flex flex-col h-full">
                    <div className="w-14 h-14 bg-[#D4A024]/10 rounded-full flex items-center justify-center mb-4">
                      <category.icon className="w-7 h-7 text-[#D4A024]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-sm text-[#D4A024] font-medium mb-3">{category.subtitle}</p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-grow">
                      {category.description}
                    </p>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 italic">
                        {category.examples}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Statement - Glassmorphism Card */}
        <section className="py-24 bg-black/60 backdrop-blur-sm relative overflow-hidden z-10">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at center, #D4A024 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
          <div className="container mx-auto px-4 max-w-4xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <span className="inline-block px-4 py-1.5 bg-[#D4A024]/20 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-8">
                Vision
              </span>
              <div className="bg-white/10 backdrop-blur-lg border-2 border-[#D4A024] rounded-3xl p-10 md:p-14 shadow-2xl">
                <p className="text-xl md:text-2xl font-light leading-relaxed text-white">
                  OmniGrid represents Commertize's commitment to building the{" "}
                  <span className="text-[#D4A024] font-medium">physical backbone</span> of tomorrow's tokenized economy — integrating{" "}
                  <span className="text-[#D4A024] font-medium">sustainability</span>,{" "}
                  <span className="text-[#D4A024] font-medium">energy efficiency</span>, and{" "}
                  <span className="text-[#D4A024] font-medium">digital scalability</span> across every layer of infrastructure.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Current Status */}
        <section className="py-24 bg-black/40 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 bg-[#D4A024]/20 text-[#D4A024] text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                  Status
                </span>
                <h2 className="text-3xl md:text-4xl font-light text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Current <span className="text-[#D4A024]">Progress</span>
                </h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {currentStatus.map((status, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
                  >
                    <div className="w-14 h-14 bg-[#D4A024]/20 rounded-full flex items-center justify-center mx-auto mb-5">
                      <status.icon className="w-7 h-7 text-[#D4A024]" />
                    </div>
                    <p className="text-white font-light text-lg">{status.text}</p>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-center text-white/60 font-light italic">
                Further details will be announced through official releases.
              </p>
            </motion.div>
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
