"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A024]/10 rounded-full mb-6 border-2 border-[#D4A024]/30">
              <AlertTriangle className="w-8 h-8 text-[#D4A024]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Disclaimer</h1>
            <p className="text-gray-500 font-light">Last updated: July 23, 2025</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
              <div className="prose prose-gray max-w-none">
                
                <div className="bg-amber-50 rounded-xl p-6 border border-[#D4A024]/30 mb-10">
                  <p className="text-gray-700 text-sm">
                    Please read this disclaimer carefully before using any information or services provided by Commertize, Inc. This disclaimer governs your use of our website, platform, and all related services.
                  </p>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Investment Risks</h2>
                <p className="text-gray-600 font-light mb-8">
                  Investing in commercial real estate involves substantial risks, including illiquidity, market volatility, and potential loss of principal. Investment values can fluctuate significantly, and investors may lose their entire investment. Carefully consider your financial situation and risk tolerance before investing.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">No Investment Advice & User Responsibility</h2>
                <p className="text-gray-600 font-light mb-8">
                  Commertize does not provide investment, legal, financial, or tax advice. All information on our platform is for informational purposes only. Users are solely responsible for conducting their own thorough due diligence and should consult qualified professionals before making investment decisions.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Forward-Looking Statements</h2>
                <p className="text-gray-600 font-light mb-8">
                  Any projections, estimates, or forward-looking statements provided are based on current expectations and assumptions which may prove incorrect or imprecise. Actual outcomes may differ significantly from expectations.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Third-Party Information & Links</h2>
                <p className="text-gray-600 font-light mb-8">
                  Commertize accepts no responsibility or liability concerning content, accuracy, or security of third-party websites, services, or information linked from our platform. Users access third-party content at their own risk.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">No Guarantee of Returns</h2>
                <p className="text-gray-600 font-light mb-8">
                  Past performance is not indicative of future results. There is no guarantee that any investment will achieve its objectives, generate positive returns, or avoid losses. Any historical returns, expected returns, or probability projections are for illustrative purposes only.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Regulatory Compliance</h2>
                <p className="text-gray-600 font-light mb-8">
                  Investments offered through Commertize may be subject to securities regulations and are available only to eligible investors as defined by applicable laws. It is the responsibility of each investor to ensure compliance with their local jurisdiction's laws and regulations.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Blockchain & Technology Risks</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light">Tokenized assets are subject to blockchain technology risks, including but not limited to smart contract vulnerabilities, network congestion, and regulatory changes.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light">Digital assets and tokens may be subject to high volatility and may not be suitable for all investors.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light">The regulatory landscape for tokenized securities continues to evolve, which may impact the value, transferability, or legality of tokens in certain jurisdictions.</p>
                  </div>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Limitation of Liability</h2>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
                  <p className="text-gray-600 font-light">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, COMMERTIZE, INC., ITS AFFILIATES, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AND LICENSORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
                  </p>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Changes to This Disclaimer</h2>
                <p className="text-gray-600 font-light mb-8">
                  Commertize reserves the right to modify this disclaimer at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services constitutes acceptance of any modifications.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">Contact Information</h2>
                <p className="text-gray-600 font-light mb-4">For questions regarding this Disclaimer, please contact us at:</p>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-800">Commertize, Inc.</p>
                  <p className="text-gray-600 font-light">Attn: Legal – Disclaimer</p>
                  <p className="text-gray-600 font-light">20250 SW Acacia St. #130</p>
                  <p className="text-gray-600 font-light">Newport Beach, California 92660</p>
                  <p className="text-gray-600 font-light mt-2">Email: support@commertize.com</p>
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
