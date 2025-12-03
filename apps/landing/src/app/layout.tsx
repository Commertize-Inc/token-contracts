import type { Metadata } from "next";
import {
	Playfair_Display,
	Plus_Jakarta_Sans,
	Space_Mono,
	Space_Grotesk,
	Orbitron,
} from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { ToastProvider } from "@/hooks/use-toast";

// 1. Configure the Serif (Institutional) Font
const playfair = Playfair_Display({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-playfair",
});

// 2. Configure the Sans (Modern UI) Font
const jakarta = Plus_Jakarta_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-jakarta",
});

// 3. Configure the Mono (Data) Font
const spaceMono = Space_Mono({
	subsets: ["latin"],
	weight: ["400", "700"],
	display: "swap",
	variable: "--font-space",
});

// 4. Configure Space Grotesk (Logo/Hero Font - Light 300)
const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	weight: ["300", "400", "500"],
	display: "swap",
	variable: "--font-grotesk",
});

// 5. Configure Orbitron (Geometric Sans - for OmniGrid logo)
const orbitron = Orbitron({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	display: "swap",
	variable: "--font-orbitron",
});

export const metadata: Metadata = {
	title: "Commertize | Tokenized Real Estate Investment",
	description:
		"Democratizing access to premium real estate investments through blockchain technology.",
	icons: {
		icon: "/assets/logo.png",
		apple: "/assets/logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${playfair.variable} ${jakarta.variable} ${spaceMono.variable} ${spaceGrotesk.variable} ${orbitron.variable}`}
		>
			<body>
				<QueryProvider>
					<ToastProvider>{children}</ToastProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
