import { Link } from "react-router-dom";
import About from "../components/About";
import ContactForm from "../components/ContactForm";
import SubNavbar, { SubNavbarItem } from "@commertize/ui/SubNavbar";
import Hero from "../components/Hero";
import Information from "../components/information";
import OnboardingPage from "../components/OnboardingPage";
import SEO from "../components/SEO";

const NAV_ITEMS: SubNavbarItem[] = [
	{
		label: "Vision",
		id: "vision",
		offset: 300, // Scroll slightly into section to show header with animation complete
		items: [
			{ label: "Foundations", id: "foundations", offset: -280 }, // Show header and line above
		],
	},
	{
		label: "Platform",
		id: "digital-standard", // Default to top of info section
		items: [
			{ label: "Tokenization", id: "tokenization", offset: -50 },
			{ label: "Capital Layer", id: "capital-layer", offset: -110 },
		],
	},
	{
		label: "Solutions",
		id: "investor",
		offset: 50,
		items: [
			{
				label: "For Investors",
				id: "investor",
				offset: 50,
				tabAction: "investors",
			},
			{
				label: "For Sponsors",
				id: "investor",
				offset: 50,
				tabAction: "sponsors",
			},
		],
	},
	{ label: "Contact", id: "contact" },
];

export default function Landing() {
	return (
		<div className="font-sans bg-[#FAFAF9] text-gray-900">
			<SEO />
			<Hero />
			<About />
			<Information />
			<OnboardingPage />

			{/* Contact Us Section */}
			<section className="py-20 bg-[#FAFAF9] relative z-20" id="contact">
				<div className="container mx-auto px-4 sm:px-6 lg:px-8">
					<div className="w-full flex justify-center pb-12">
						<div
							className="w-[90%] h-[1px]"
							style={{
								background:
									"linear-gradient(90deg, rgba(197,155,38,0) 0%, rgba(197,155,38,0.6) 50%, rgba(197,155,38,0) 100%)",
							}}
						/>
					</div>
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
							Get in Touch or Join Our Waitlist
						</h2>
						<p className="text-gray-600 font-light max-w-xl mx-auto">
							Have questions? Visit our{" "}
							<Link
								to="/faq"
								className="text-[#DDB35F] hover:text-[#B8860B] underline underline-offset-2 transition-colors"
							>
								FAQ page
							</Link>
						</p>
						<p className="text-gray-600 font-light max-w-xl mx-auto mt-2">
							Ready to join? Fill out the form below.
						</p>
					</div>
					<ContactForm />
				</div>
			</section>

			<SubNavbar items={NAV_ITEMS} orientation="horizontal" />
		</div>
	);
}
