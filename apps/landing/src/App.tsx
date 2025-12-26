import { ScrollToTopButton } from "@commertize/ui";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import FAQ from "./pages/FAQ";
import Landing from "./pages/Landing";

import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Nexus from "./pages/Nexus";
import Waitlist from "./pages/Waitlist";
import { Providers } from "./providers";

// Lazy load other pages to reduce initial bundle size
import { lazy, Suspense } from "react";
import {
	PostHogFeatureFlags,
	useFeatureFlag,
} from "../../../packages/utils/src/posthog";

const Team = lazy(() => import("./pages/Team"));
const OmniGrid = lazy(() => import("./pages/OmniGrid"));
const Analytics = lazy(() => import("./pages/Analytics"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const AMLPolicy = lazy(() => import("./pages/AMLPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const KYBPolicy = lazy(() => import("./pages/KYBPolicy"));
const Download = lazy(() => import("./pages/Download"));
const AdminNews = lazy(() => import("./pages/admin/News"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Placeholder pages for less critical routes
const QuoteCard = lazy(() => import("./pages/QuoteCard"));
const SocialImage = lazy(() => import("./pages/SocialImage"));

const LoadingFallback = () => (
	<div className="min-h-screen flex items-center justify-center">
		<div className="text-center">
			<div className="w-8 h-8 border-4 border-[#D4A024] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
			<p className="text-gray-600">Loading...</p>
		</div>
	</div>
);

function App() {
	const isAiNewsEnabled = useFeatureFlag(PostHogFeatureFlags.NEWS_GENERATION);

	return (
		<Providers>
			<BrowserRouter>
				<div className="min-h-screen bg-[#FAFAF9]">
					<Navbar />
					<ScrollToTopButton />
					<Suspense fallback={<LoadingFallback />}>
						<Routes>
							<Route path="/" element={<Landing />} />

							<Route path="/nexus" element={<Nexus />} />
							{isAiNewsEnabled && (
								<>
									<Route path="/news" element={<News />} />
									<Route path="/news/:slug" element={<NewsArticle />} />
									<Route path="/admin/news" element={<AdminNews />} />
								</>
							)}
							<Route path="/team" element={<Team />} />
							<Route path="/waitlist" element={<Waitlist />} />
							<Route path="/omnigrid" element={<OmniGrid />} />
							<Route path="/analytics" element={<Analytics />} />
							<Route path="/faq" element={<FAQ />} />
							<Route path="/aml-policy" element={<AMLPolicy />} />
							<Route path="/cookie-policy" element={<CookiePolicy />} />
							<Route path="/disclaimer" element={<Disclaimer />} />
							<Route path="/kyb-policy" element={<KYBPolicy />} />
							<Route path="/privacy" element={<PrivacyPolicy />} />
							<Route path="/terms" element={<Terms />} />
							<Route path="/download" element={<Download />} />
							<Route path="/quote-card" element={<QuoteCard />} />
							<Route path="/social-image" element={<SocialImage />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Suspense>
					<Footer />
				</div>
			</BrowserRouter>
		</Providers>
	);
}

export default App;
