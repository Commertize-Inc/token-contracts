/// <reference types="vite/client" />
import { PostHogProvider } from "posthog-js/react";
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "./hooks/use-toast";
import { HelmetProvider } from "react-helmet-async";

export const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
	return (
		<PostHogProvider
			apiKey={import.meta.env.VITE_POSTHOG_KEY || ""}
			options={{
				api_host:
					import.meta.env.VITE_POSTHOG_HOST || "https://app.posthog.com",
			}}
		>
			<QueryClientProvider client={queryClient}>
				<HelmetProvider>
					<ToastProvider>{children}</ToastProvider>
				</HelmetProvider>
			</QueryClientProvider>
		</PostHogProvider>
	);
}
