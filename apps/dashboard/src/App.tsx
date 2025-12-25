import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Providers } from "./providers";
import { AuthGuard } from "./components/AuthGuard";
import DashboardHome from "./pages/Dashboard";
import AuthPage from "./pages/Auth";
import Marketplace from "./pages/Marketplace";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import AdminNews from "./pages/AdminNews";
import ListingDetails from "./pages/ListingDetails";
import CreateListing from "./pages/listings/CreateListing";
import EditListing from "./pages/listings/EditListing";
import SponsorDashboard from "./pages/SponsorDashboard";
import Invest from "./pages/Invest";
import Analytics from "./pages/Analytics";
import { SponsorGuard } from "./components/SponsorGuard";
import { KycGuard } from "./components/KycGuard";
import { ScrollToTop } from "./components/ScrollToTop";
import { ScrollToTopButton } from "@commertize/ui";
import AdminReviews from "./pages/admin/Reviews";
import Submissions from "./pages/Submissions";
import { IncompleteProfileBanner } from "./components/IncompleteProfileBanner";

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<ScrollToTopButton />
			<Providers>
				<IncompleteProfileBanner />
				<Routes>
					<Route path="/auth" element={<AuthPage />} />
					<Route
						path="/"
						element={
							<AuthGuard>
								<DashboardHome />
							</AuthGuard>
						}
					/>
					<Route
						path="/marketplace"
						element={
							<AuthGuard>
								<Marketplace />
							</AuthGuard>
						}
					/>
					<Route
						path="/analytics"
						element={
							<AuthGuard>
								<Analytics />
							</AuthGuard>
						}
					/>
					<Route
						path="/onboarding"
						element={
							<AuthGuard>
								<Onboarding />
							</AuthGuard>
						}
					/>
					<Route
						path="/profile"
						element={
							<AuthGuard>
								<Profile />
							</AuthGuard>
						}
					/>
					<Route
						path="/sponsor/onboarding"
						element={<Navigate to="/onboarding" replace />}
					/>
					<Route
						path="/listings/new"
						element={
							<AuthGuard>
								<KycGuard>
									<SponsorGuard>
										<CreateListing />
									</SponsorGuard>
								</KycGuard>
							</AuthGuard>
						}
					/>
					<Route
						path="/listings/:id/edit"
						element={
							<AuthGuard>
								<SponsorGuard>
									<EditListing />
								</SponsorGuard>
							</AuthGuard>
						}
					/>
					<Route
						path="/sponsor/dashboard"
						element={
							<AuthGuard>
								<SponsorGuard>
									<SponsorDashboard />
								</SponsorGuard>
							</AuthGuard>
						}
					/>
					<Route
						path="/invest/:id"
						element={
							<AuthGuard>
								<KycGuard>
									<Invest />
								</KycGuard>
							</AuthGuard>
						}
					/>
					<Route
						path="/admin/news"
						element={
							<AuthGuard>
								<AdminNews />
							</AuthGuard>
						}
					/>

					<Route
						path="/listing/:id"
						element={
							<AuthGuard>
								<ListingDetails />
							</AuthGuard>
						}
					/>
					<Route
						path="/submissions"
						element={
							<AuthGuard>
								<Submissions />
							</AuthGuard>
						}
					/>
					<Route
						path="/admin/reviews"
						element={
							<AuthGuard>
								<AdminReviews />
							</AuthGuard>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Providers>
		</BrowserRouter>
	);
}

export default App;
