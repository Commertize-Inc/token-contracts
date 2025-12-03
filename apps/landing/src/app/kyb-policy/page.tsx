"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";

export default function KYBPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A024]/10 rounded-full mb-6 border-2 border-[#D4A024]/30">
              <Building2 className="w-8 h-8 text-[#D4A024]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">KYB Policy</h1>
            <p className="text-gray-500 font-light">Know Your Business Verification</p>
            <p className="text-gray-400 font-light text-sm mt-2">Last updated: July 23, 2025</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 font-light leading-relaxed mb-8">
                  Commertize, Inc. ("Commertize," "we," "us," or "our") is committed to maintaining the highest standards of regulatory compliance and preventing financial crimes. This Know Your Business (KYB) Policy outlines the procedures and requirements for verifying the identity and legitimacy of business entities that wish to use our platform for real estate investment opportunities.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">1. Purpose</h2>
                <p className="text-gray-600 font-light mb-8">
                  The purpose of this KYB Policy is to establish a framework for identifying and verifying business entities, their ownership structures, and their sources of funds. This helps us comply with applicable anti-money laundering (AML) regulations, counter-terrorism financing (CTF) requirements, and securities laws, while protecting our platform and users from fraudulent activities.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">2. Scope</h2>
                <p className="text-gray-600 font-light mb-4">This policy applies to:</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    All business entities seeking to register on the Commertize platform
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Property sponsors and real estate developers
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Institutional investors and investment funds
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Corporate entities making investments through our platform
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Any other legal entities engaging with our services
                  </li>
                </ul>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">3. Information We Collect</h2>
                <p className="text-gray-600 font-light mb-4">As part of our KYB verification process, we collect the following information:</p>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Business Identification</p>
                    <p className="text-gray-600 font-light text-sm">Legal business name, trading names (if any), business registration number, date of incorporation, jurisdiction of registration, tax identification number (EIN/TIN).</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Business Address & Contact</p>
                    <p className="text-gray-600 font-light text-sm">Registered office address, principal place of business, business phone number, official email address, website (if applicable).</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Ownership Structure</p>
                    <p className="text-gray-600 font-light text-sm">Details of all beneficial owners holding 25% or more ownership, organizational chart, shareholder register, partnership agreements (if applicable).</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Authorized Representatives</p>
                    <p className="text-gray-600 font-light text-sm">Names and contact information of directors, officers, and authorized signatories, proof of authority to act on behalf of the entity.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Financial Information</p>
                    <p className="text-gray-600 font-light text-sm">Source of funds, bank account details, financial statements (if required), expected transaction volumes.</p>
                  </div>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">4. Required Documentation</h2>
                <p className="text-gray-600 font-light mb-4">Business entities must provide the following documents:</p>
                <ul className="space-y-2 mb-8">
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Certificate of Incorporation or equivalent formation document
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Articles of Incorporation, Bylaws, or Operating Agreement
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Certificate of Good Standing (issued within the last 90 days)
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Proof of business address (utility bill, bank statement, or lease agreement)
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Government-issued ID for all beneficial owners and authorized representatives
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Board resolution or power of attorney authorizing platform usage
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    W-9 form (for U.S. entities) or W-8BEN-E (for non-U.S. entities)
                  </li>
                </ul>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">5. Beneficial Ownership</h2>
                <p className="text-gray-600 font-light mb-4">
                  We are required to identify and verify all beneficial owners of business entities. A beneficial owner is defined as:
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light">Any individual who directly or indirectly owns 25% or more of the equity interests of the entity</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light">Any individual who exercises significant control over the entity, including senior officers or managers</p>
                  </div>
                </div>
                <p className="text-gray-600 font-light mb-8">
                  For each beneficial owner, we require personal identification information consistent with our KYC (Know Your Customer) requirements, including government-issued photo ID and proof of address.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">6. Verification Process</h2>
                <p className="text-gray-600 font-light mb-4">Our KYB verification process includes:</p>
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Document Verification</p>
                    <p className="text-gray-600 font-light text-sm">We verify the authenticity of all submitted documents through trusted third-party verification services and government databases.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Sanctions Screening</p>
                    <p className="text-gray-600 font-light text-sm">The business entity and all beneficial owners are screened against global sanctions lists, including OFAC, UN, EU, and other relevant watchlists.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Adverse Media Screening</p>
                    <p className="text-gray-600 font-light text-sm">We conduct searches for any negative news or adverse media related to the business and its key individuals.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">PEP Screening</p>
                    <p className="text-gray-600 font-light text-sm">Beneficial owners and authorized representatives are screened for Politically Exposed Person (PEP) status.</p>
                  </div>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">7. Risk Assessment</h2>
                <p className="text-gray-600 font-light mb-4">
                  Each business entity is assigned a risk rating based on factors including:
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Country of incorporation and operation
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Industry and business activities
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Ownership structure complexity
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    PEP involvement
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Source of funds
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Expected transaction patterns
                  </li>
                </ul>
                <p className="text-gray-600 font-light mb-8">
                  Higher-risk entities may be subject to enhanced due diligence (EDD) measures, including additional documentation requirements and more frequent reviews.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">8. Ongoing Monitoring</h2>
                <p className="text-gray-600 font-light mb-8">
                  KYB verification is not a one-time process. We conduct ongoing monitoring and periodic reviews to ensure continued compliance. This includes monitoring for changes in ownership structure, sanctions status, and any other material changes that may affect the entity's risk profile. Business entities are required to notify us promptly of any material changes to their information.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">9. Data Protection</h2>
                <p className="text-gray-600 font-light mb-8">
                  All information collected as part of our KYB process is handled in accordance with our Privacy Policy and applicable data protection laws. We employ appropriate technical and organizational measures to protect the confidentiality and security of your business information.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">10. Non-Compliance</h2>
                <p className="text-gray-600 font-light mb-8">
                  Failure to provide required information or documentation, or providing false or misleading information, may result in denial of access to our platform, termination of existing accounts, reporting to relevant authorities as required by law, and legal action where appropriate.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">11. Contact Us</h2>
                <p className="text-gray-600 font-light mb-4">For questions about our KYB requirements or to submit verification documents, please contact us at:</p>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-800">Commertize, Inc.</p>
                  <p className="text-gray-600 font-light">Attn: Compliance – KYB</p>
                  <p className="text-gray-600 font-light">20250 SW Acacia St. #130</p>
                  <p className="text-gray-600 font-light">Newport Beach, California 92660</p>
                  <p className="text-gray-600 font-light mt-2">Email: compliance@commertize.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/privacy" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A024] text-white rounded-xl hover:bg-[#B8860B] transition-colors"
              >
                Privacy Policy
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                href="/terms" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Terms of Service
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
