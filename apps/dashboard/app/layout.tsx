import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ChatWidget from "@/components/ChatWidget";

export const metadata: Metadata = {
	title: "Commertize Dashboard",
	description: "Commertize investor dashboard",
	icons: {
		icon: "/assets/logo.png",
		apple: "/assets/logo.png",
	},
};

const suppressWarningsScript = `
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
`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: suppressWarningsScript }} />
			</head>
			<body>
				<Providers>
					{children}
					<ChatWidget />
				</Providers>
			</body>
		</html>
	);
}
