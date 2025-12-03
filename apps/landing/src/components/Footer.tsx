"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white relative z-20" id="contact">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="mb-4">
              <img src="/assets/logo.png" alt="Commertize" className="h-8 w-auto" />
            </div>
            <p className="text-sm mb-6">
              Commercial Real Estate, Revolutionized.<br />
              Liquid. Transparent. Global.
            </p>
            <div className="mb-4">
              <a href="mailto:support@commertize.com" className="text-sm text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">
                support@commertize.com
              </a>
            </div>
            <div className="mb-6">
              <h4 className="font-semibold mb-3 text-sm text-[#D4A024]">Social Links</h4>
              <div className="flex flex-wrap gap-3">
                <a href="https://linkedin.com/company/commertize" target="_blank" rel="noopener noreferrer" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors" title="LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://x.com/commertize" target="_blank" rel="noopener noreferrer" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors" title="X">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                </a>
                <a href="https://instagram.com/commertize" target="_blank" rel="noopener noreferrer" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors" title="Instagram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
                <a href="https://discord.gg/commertize" target="_blank" rel="noopener noreferrer" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors" title="Discord">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </a>
                <a href="https://t.me/commertize" target="_blank" rel="noopener noreferrer" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors" title="Telegram">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#D4A024]">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Explore Marketplace</Link></li>
              <li><Link href="/nexus" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Nexus DeFi</Link></li>
              <li><Link href="/news" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">News</Link></li>
              <li><a href="#contact" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#D4A024]">Divisions</h4>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Marketplace</Link></li>
              <li><Link href="/nexus" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">DeFi & Nexus</Link></li>
              <li><a href="#" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">OmniGrid</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#D4A024]">Legal</h4>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Terms of Service</a></li>
              <li><a href="/disclaimer" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Disclaimer</a></li>
              <li><a href="/aml-policy" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">AML Policy</a></li>
              <li><a href="/cookie-policy" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">Cookie Policy</a></li>
              <li><a href="/kyb-policy" className="text-[#D4A024] hover:text-[#D4A024]/80 transition-colors">KYB Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[#D4A024]">Newsletter</h4>
            <p className="text-sm mb-4 text-[#D4A024]">
              Stay updated with our latest properties and news
            </p>
            <form className="flex gap-2" id="subscribe">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-black placeholder:text-black bg-[#D4A024]/10 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A024]/50"
              />
              <button type="submit" className="px-4 py-2 bg-[#D4A024] text-white font-medium rounded-lg hover:bg-[#D4A024]/90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 space-y-4">
          <div className="text-center text-sm">
            <p>© 2025 Commertize. All rights reserved.</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-900">
            <p className="font-semibold mb-2">Legal & Regulatory Compliance</p>
            <p className="mb-2">
              Commertize operates in compliance with the GENIUS Act (Greater Equity and Nondiscrimination for Investors Using Security Tokens). 
              All tokenized securities offered on this platform are subject to federal securities laws and regulations.
            </p>
            <p className="mb-2">
              <strong>Investment Risks:</strong> Real estate investments involve substantial risk. Past performance does not guarantee future results. 
              Investors may lose all or a portion of their investment. All investments are subject to market, regulatory, and liquidity risks.
            </p>
            <p>
              <strong>Regulatory Status:</strong> Securities offered through this platform are conducted in accordance with applicable exemptions 
              under Regulation D (506(b)/506(c)), Regulation A+, or Regulation Crowdfunding. Investors must meet accreditation requirements where applicable.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
