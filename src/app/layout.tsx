import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Commertize | Tokenized Real Estate Investment",
  description: "Democratizing access to premium real estate investments through blockchain technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} ${spaceMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
