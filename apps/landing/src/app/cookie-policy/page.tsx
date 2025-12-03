"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Cookie, ArrowRight } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A024]/10 rounded-full mb-6 border-2 border-[#D4A024]/30">
              <Cookie className="w-8 h-8 text-[#D4A024]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-500 font-light">Last updated: July 23, 2025</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#D4A024]/30 p-8 md:p-12">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-600 font-light leading-relaxed mb-8">
                  This Cookie Policy explains how Commertize, Inc. ("Commertize," "we," "us," or "our") uses cookies and similar tracking technologies when you visit our website at www.commertize.com (the "Website"). By using our Website, you consent to our use of cookies as described in this policy.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">1. What Are Cookies?</h2>
                <p className="text-gray-600 font-light mb-8">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners useful information about how their site is being used.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">2. Types of Cookies We Use</h2>
                <p className="text-gray-600 font-light mb-4">We use the following categories of cookies on our Website:</p>
                
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Strictly Necessary Cookies</p>
                    <p className="text-gray-600 font-light text-sm">These cookies are essential for the Website to function properly. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies as they are necessary for the Website to operate.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Performance & Analytics Cookies</p>
                    <p className="text-gray-600 font-light text-sm">These cookies help us understand how visitors interact with our Website by collecting and reporting information anonymously. This helps us improve the Website's performance and user experience.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Functional Cookies</p>
                    <p className="text-gray-600 font-light text-sm">These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and login information.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Targeting & Advertising Cookies</p>
                    <p className="text-gray-600 font-light text-sm">These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns and limit the number of times you see an advertisement.</p>
                  </div>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">3. Third-Party Cookies</h2>
                <p className="text-gray-600 font-light mb-4">
                  In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide other services. These third parties include:
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Analytics providers (e.g., Google Analytics)
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Authentication services (e.g., Privy)
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Identity verification services (e.g., Plaid)
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    Social media platforms (when you interact with our social features)
                  </li>
                </ul>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">4. Cookie Duration</h2>
                <p className="text-gray-600 font-light mb-4">Cookies can be either session cookies or persistent cookies:</p>
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light"><span className="text-gray-800">Session Cookies:</span> These are temporary cookies that are deleted when you close your browser. They are used to maintain your session while you navigate our Website.</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 font-light"><span className="text-gray-800">Persistent Cookies:</span> These cookies remain on your device for a set period or until you delete them. They are used to remember your preferences and choices across multiple visits.</p>
                  </div>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">5. Managing Your Cookie Preferences</h2>
                <p className="text-gray-600 font-light mb-4">
                  You have several options for managing cookies:
                </p>
                <ul className="space-y-2 mb-8">
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <span><span className="text-gray-800">Browser Settings:</span> Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies, delete cookies, or alert you when a cookie is being set.</span>
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <span><span className="text-gray-800">Opt-Out Tools:</span> Some third-party services provide opt-out mechanisms. For example, you can opt out of Google Analytics by installing the Google Analytics Opt-out Browser Add-on.</span>
                  </li>
                  <li className="flex gap-3 text-gray-600 font-light">
                    <div className="w-2 h-2 rounded-full bg-[#D4A024] mt-2 flex-shrink-0"></div>
                    <span><span className="text-gray-800">Do Not Track:</span> Some browsers offer a "Do Not Track" feature. Our Website currently does not respond to "Do Not Track" signals.</span>
                  </li>
                </ul>
                <p className="text-gray-600 font-light mb-8">
                  Please note that disabling cookies may affect the functionality of our Website and limit your ability to use certain features.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">6. Similar Technologies</h2>
                <p className="text-gray-600 font-light mb-4">
                  In addition to cookies, we may also use other similar technologies:
                </p>
                <div className="space-y-4 mb-8">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Web Beacons (Pixel Tags)</p>
                    <p className="text-gray-600 font-light text-sm">Small graphic images embedded in web pages or emails that help us understand how users interact with our content.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Local Storage</p>
                    <p className="text-gray-600 font-light text-sm">Browser-based storage that allows us to store data locally on your device for improved performance.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-800 mb-1">Session Storage</p>
                    <p className="text-gray-600 font-light text-sm">Similar to local storage but is cleared when you close your browser session.</p>
                  </div>
                </div>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">7. Updates to This Policy</h2>
                <p className="text-gray-600 font-light mb-8">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our Website with a new "Last Updated" date. We encourage you to review this policy periodically.
                </p>

                <h2 className="text-2xl text-[#D4A024] mt-10 mb-6">8. Contact Us</h2>
                <p className="text-gray-600 font-light mb-4">If you have any questions about our use of cookies or this Cookie Policy, please contact us at:</p>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-800">Commertize, Inc.</p>
                  <p className="text-gray-600 font-light">Attn: Legal – Cookie Policy</p>
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
