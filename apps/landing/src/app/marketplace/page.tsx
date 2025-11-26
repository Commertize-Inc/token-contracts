"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Sparkles, 
  Users, 
  BarChart3,
  MapPin,
  Percent,
  Calendar,
  ArrowUpRight,
  X
} from "lucide-react";
import Link from "next/link";
import { PROPERTY_STATUS } from "@/lib/propertyStatus";

interface Property {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  propertyValue: number;
  minInvestment: number;
  targetedIRR: number;
  capRate: number;
  status: string;
  type: string;
  propertyClass: string;
  riskFactor: string;
  holdPeriod: number;
  tokensSold: number;
  totalTokens: number;
}

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "1",
    name: "The Axis",
    location: "Miami, FL",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    propertyValue: 45000000,
    minInvestment: 1000,
    targetedIRR: 18.5,
    capRate: 7.2,
    status: "Live",
    type: "Office",
    propertyClass: "Class A",
    riskFactor: "moderate",
    holdPeriod: 5,
    tokensSold: 32000,
    totalTokens: 45000
  },
  {
    id: "2",
    name: "Gateway Medical Plaza",
    location: "Austin, TX",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    propertyValue: 24500000,
    minInvestment: 1000,
    targetedIRR: 14.5,
    capRate: 6.8,
    status: "Live",
    type: "Office",
    propertyClass: "Class A",
    riskFactor: "low",
    holdPeriod: 5,
    tokensSold: 147000,
    totalTokens: 245000
  },
  {
    id: "3",
    name: "Riverside Industrial Park",
    location: "Phoenix, AZ",
    imageUrl: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=400&fit=crop",
    propertyValue: 18750000,
    minInvestment: 1000,
    targetedIRR: 16.2,
    capRate: 7.5,
    status: "Live",
    type: "Industrial",
    propertyClass: "Class B",
    riskFactor: "moderate",
    holdPeriod: 7,
    tokensSold: 125000,
    totalTokens: 250000
  },
  {
    id: "4",
    name: "Metro Retail Center",
    location: "Denver, CO",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
    propertyValue: 32000000,
    minInvestment: 1000,
    targetedIRR: 12.8,
    capRate: 6.2,
    status: "Coming Soon",
    type: "Retail",
    propertyClass: "Class A",
    riskFactor: "low",
    holdPeriod: 5,
    tokensSold: 0,
    totalTokens: 320000
  },
  {
    id: "5",
    name: "Sunset Apartments",
    location: "San Diego, CA",
    imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    propertyValue: 28500000,
    minInvestment: 1000,
    targetedIRR: 13.5,
    capRate: 5.8,
    status: "Fully Funded",
    type: "Apartments",
    propertyClass: "Class A",
    riskFactor: "low",
    holdPeriod: 7,
    tokensSold: 285000,
    totalTokens: 285000
  },
  {
    id: "6",
    name: "Harbor View Hotel",
    location: "Seattle, WA",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    propertyValue: 52000000,
    minInvestment: 1000,
    targetedIRR: 15.8,
    capRate: 6.5,
    status: "Live",
    type: "Hospitality",
    propertyClass: "Class A",
    riskFactor: "moderate",
    holdPeriod: 10,
    tokensSold: 280000,
    totalTokens: 520000
  }
];

export default function Marketplace() {
  const [status, setStatus] = useState<string>("all");
  const [propertyType, setPropertyType] = useState<string>("all");
  const [propertyClass, setPropertyClass] = useState<string>("all");
  const [riskLevel, setRiskLevel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const filteredProperties = SAMPLE_PROPERTIES.filter((property) => {
    if (status !== "all" && property.status !== status) return false;
    if (propertyType !== "all" && property.type !== propertyType) return false;
    if (propertyClass !== "all" && !property.propertyClass.includes(propertyClass)) return false;
    if (riskLevel !== "all" && property.riskFactor !== riskLevel.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!property.name.toLowerCase().includes(query) && 
          !property.location.toLowerCase().includes(query) &&
          !property.type.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (a.name === "The Axis") return -1;
    if (b.name === "The Axis") return 1;
    switch (sortBy) {
      case "name": return a.name.localeCompare(b.name);
      case "price": return a.minInvestment - b.minInvestment;
      case "irr": return b.targetedIRR - a.targetedIRR;
      case "location": return a.location.localeCompare(b.location);
      default: return 0;
    }
  });

  const clearAllFilters = () => {
    setStatus("all");
    setPropertyType("all");
    setPropertyClass("all");
    setRiskLevel("all");
    setSearchQuery("");
    setSortBy("name");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-5xl font-light">
              Discover <span className="text-[#D4A024]">Tokenized Properties</span>
            </h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Transform the Way You Invest in Commercial Real Estate
          </motion.p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-[#D4A024]/5 to-[#D4A024]/10 border-2 border-[#D4A024] rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-[#D4A024] mr-3" />
              <h2 className="text-2xl font-light">Welcome to the Marketplace!</h2>
            </div>
            <p className="mb-4 text-gray-700">
              At Commertize, you're not just a member — you're part of a network shaping the future of commercial real estate. Gain priority access to exclusive investment opportunities, cutting-edge insights, and advanced tools designed to give you an edge.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-sm text-gray-700">
                <motion.div
                  animate={{ y: [0, -2, 0], rotate: [0, 5, 0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <BarChart3 className="w-4 h-4 text-[#D4A024] mr-2" />
                </motion.div>
                <span>Proprietary analytics and insights</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Globe className="w-4 h-4 text-[#D4A024] mr-2" />
                </motion.div>
                <span>Global real estate opportunities</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              Disclaimer: Projected returns are estimates and may be subject to adjustment. Need assistance? Our dedicated sales agents are here to help.
            </p>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white border-2 border-[#D4A024] rounded-2xl p-6 shadow-lg">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search properties by name, location, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50 focus:border-[#D4A024]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100 pt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
                    >
                      <option value="all">All Status</option>
                      {Object.values(PROPERTY_STATUS).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <select 
                      value={propertyType} 
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
                    >
                      <option value="all">All Types</option>
                      <option value="Apartments">Apartments</option>
                      <option value="Office">Office</option>
                      <option value="Retail">Retail</option>
                      <option value="Hospitality">Hospitality</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Mixed Use">Mixed Use</option>
                    </select>

                    <select 
                      value={propertyClass} 
                      onChange={(e) => setPropertyClass(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
                    >
                      <option value="all">All Classes</option>
                      <option value="A">Class A</option>
                      <option value="B">Class B</option>
                      <option value="C">Class C</option>
                    </select>

                    <select 
                      value={riskLevel} 
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
                    >
                      <option value="all">All Risk Levels</option>
                      <option value="low">Low Risk</option>
                      <option value="moderate">Moderate Risk</option>
                      <option value="high">High Risk</option>
                    </select>

                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price">Sort by Price</option>
                      <option value="irr">Sort by IRR</option>
                      <option value="location">Sort by Location</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-medium text-[#D4A024]">{filteredProperties.length}</span> properties
          </p>
        </div>

        {/* Property Cards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="bg-white rounded-2xl border-2 border-[#D4A024]/30 overflow-hidden shadow-lg hover:shadow-xl hover:border-[#D4A024] transition-all group">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={property.imageUrl} 
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      property.status === "Live" ? "bg-green-500 text-white" :
                      property.status === "Coming Soon" ? "bg-[#D4A024] text-white" :
                      property.status === "Fully Funded" ? "bg-blue-500 text-white" :
                      "bg-gray-500 text-white"
                    }`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-700">
                      {property.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{property.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-[#D4A024]" />
                    {property.location}
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Percent className="w-3 h-3 mr-1" />
                        Target IRR
                      </div>
                      <div className="text-lg font-medium text-[#D4A024]">{property.targetedIRR}%</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Min. Investment
                      </div>
                      <div className="text-lg font-medium text-gray-900">{formatCurrency(property.minInvestment)}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Funded</span>
                      <span>{Math.round((property.tokensSold / property.totalTokens) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D4A024] to-yellow-500 rounded-full transition-all"
                        style={{ width: `${(property.tokensSold / property.totalTokens) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {property.holdPeriod} yr hold
                    </div>
                    <button className="flex items-center gap-1 px-4 py-2 bg-[#D4A024] text-white text-sm font-medium rounded-lg hover:bg-[#D4A024]/90 transition-colors">
                      View Details
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search query</p>
            <button 
              onClick={clearAllFilters}
              className="px-6 py-2 bg-[#D4A024] text-white rounded-lg hover:bg-[#D4A024]/90 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
