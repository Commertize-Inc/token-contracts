"use client";

import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface TeamMember {
  name: string;
  title: string;
  image: string;
  linkedin?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Cameron Razaghi",
    title: "Founder & CEO",
    image: "/team/image3.png",
    linkedin: "https://www.linkedin.com/in/cameron-razaghi-07322226a"
  },
  {
    name: "Logan Moore",
    title: "Vice President of Business Development",
    image: "/team/logan-moore.png",
    linkedin: "https://www.linkedin.com/in/loganmoore22/"
  },
  {
    name: "Ethan Shokrian",
    title: "Vice President of Capital Markets & Sales",
    image: "/team/image4.png",
    linkedin: "https://www.linkedin.com/in/ethanshokrian/"
  },
  {
    name: "Daniel Soufer",
    title: "Chief Product & Innovation Officer (CPIO)",
    image: "/team/image2.png",
    linkedin: "https://www.linkedin.com/in/daniel-soufer/"
  },
  {
    name: "Abba Wada",
    title: "Head of RWA Strategy",
    image: "/team/image5.png",
    linkedin: "https://www.linkedin.com/in/abba-wada-63b999266/"
  },
  {
    name: "Iman Reihanian",
    title: "Chief Technology Officer (CTO)",
    image: "/team/image0.png",
    linkedin: "https://www.linkedin.com/in/imanreih/"
  },
  {
    name: "Hector Garcia",
    title: "Vice President of Acquisitions",
    image: "/team/image1.png",
    linkedin: "https://www.linkedin.com/in/hector-garcia-297a682b0/"
  },
  {
    name: "RUNE.CTZ",
    title: "AI Agent - Sales, Support & Outreach",
    image: "/team/image8.png"
  },
  {
    name: "CommertizerX",
    title: "AI Agent - Property Analysis & Investment Insights",
    image: "/team/image9.png"
  },
];

const getImageStyles = (memberName: string) => {
  const styles: { [key: string]: { objectPosition: string; transform?: string } } = {
    "Cameron Razaghi": { objectPosition: "center 35%" },
    "Logan Moore": { objectPosition: "center 40%" },
    "Ethan Shokrian": { objectPosition: "center 30%" },
    "Daniel Soufer": { objectPosition: "center 25%" },
    "Abba Wada": { objectPosition: "center 35%", transform: "scale(1.15)" },
    "Iman Reihanian": { objectPosition: "center 32%", transform: "scale(1.25)" },
    "Hector Garcia": { objectPosition: "center 25%" },
    "RUNE.CTZ": { objectPosition: "center 5%", transform: "scale(1.02)" },
    "CommertizerX": { objectPosition: "center 25%", transform: "scale(1.1)" }
  };
  
  return styles[memberName] || { objectPosition: "center center" };
};

const hasWhiteCircleInImage = (memberName: string) => {
  return ["Hector Garcia", "Daniel Soufer", "Ethan Shokrian"].includes(memberName);
};

const needsWhiteBackground = (memberName: string) => {
  return ["Logan Moore"].includes(memberName);
};

export default function TeamPage() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      
      {/* Background Image */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/team-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        animate={{
          scale: [1, 1.1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </motion.div>
      
      {/* Content Container */}
      <div className="relative z-10 pt-20">
        {/* Animated Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="container mx-auto max-w-6xl text-center relative z-10"
          >
            <motion.h1 
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-logo font-light text-white mb-6"
            >
              Meet Our{" "}
              <motion.span 
                className="text-white"
                animate={{ 
                  opacity: [1, 0.8, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Visionary Team
              </motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white font-logo font-light max-w-3xl mx-auto"
            >
              We're a team of innovators, deal-makers, and technologists with one mission: 
              to make commercial real estate investment faster, more transparent, and accessible 
              to more people through blockchain tokenization.
            </motion.p>
          </motion.div>
        </section>

        {/* Team Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {teamMembers.map((member, index) => (
                <motion.div 
                  key={index} 
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Profile Image */}
                  <div className="mb-6">
                    <div className={`w-48 h-48 mx-auto rounded-full overflow-hidden shadow-lg shadow-[#D4A024]/20 ring-4 ring-[#D4A024] ${
                      hasWhiteCircleInImage(member.name) ? '' : 'border-4 border-white'
                    } ${needsWhiteBackground(member.name) ? 'bg-white' : ''}`}>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        style={getImageStyles(member.name)}
                      />
                    </div>
                  </div>

                  {/* Member Details */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-logo font-light text-white">
                      {member.name}
                    </h3>
                    <p className="text-white text-lg font-logo font-light">
                      {member.title}
                    </p>

                    {/* LinkedIn Contact */}
                    {member.linkedin && (
                      <div className="flex justify-center pt-2">
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-[#D4A024] hover:bg-[#B8881C] text-white rounded-full transition-colors shadow-md"
                        >
                          <Linkedin className="w-5 h-5" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 px-4 relative overflow-hidden"
        >
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-4xl font-logo font-light text-white mb-6"
            >
              Ready to Join Our Mission?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white font-logo font-light mb-8"
            >
              Be part of the future of real estate investment with our innovative
              tokenization platform.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.a
                href="/waitlist"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center rounded-lg bg-[#D4A024] px-8 py-4 text-sm font-light text-white hover:bg-[#B8881C] transition-colors shadow-lg"
              >
                Join Waitlist
              </motion.a>
              <motion.a
                href="/marketplace"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center rounded-lg border border-white px-8 py-4 text-sm font-light text-white hover:bg-white/10 transition-colors"
              >
                Explore Marketplace
              </motion.a>
            </motion.div>
          </div>
        </motion.section>

        <Footer />
      </div>
    </div>
  );
}
