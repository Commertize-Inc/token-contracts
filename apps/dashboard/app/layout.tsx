import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "./ClientProviders";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
	title: "Commertize Dashboard",
	description: "Commertize investor dashboard",
	icons: {
		icon: "/assets/logo.png",
		apple: "/assets/logo.png",
	},
};

import { PostHogProvider } from "@commertize/utils/posthog";

// Force dynamic rendering to prevent SSR issues with Privy
export const dynamic = "force-dynamic";
export const dynamicParams = true;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<PostHogProvider>
					<ClientProviders>
						{children}
						<ChatWidget />
					</ClientProviders>
				</PostHogProvider>
				<Script
					id="suppress-warnings"
					strategy="beforeInteractive"
					dangerouslySetInnerHTML={{
						__html: `
(function() {
  var originalError = console.error;
  console.error = function() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] && typeof arguments[i] === 'string' && arguments[i].includes('delayedExecution')) {
        return;
      }
    }
    originalError.apply(console, arguments);
  };
})();
`,
					}}
				/>
			</body>
		</html>
	);
}
