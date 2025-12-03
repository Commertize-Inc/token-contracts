import { useState, useEffect } from "react";

/**
 * A hook that returns `true` only after the component has mounted on the client.
 * This is useful to avoid hydration mismatches in Next.js SSR when rendering
 * components that depend on client-side APIs (like window, document, etc.).
 *
 * @returns {boolean} - `true` if the component is mounted, `false` otherwise
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const isMounted = useIsMounted();
 *
 *   return (
 *     <div>
 *       {isMounted && <ClientOnlyComponent />}
 *     </div>
 *   );
 * };
 * ```
 */
export function useIsMounted(): boolean {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		// This is a legitimate pattern for mount detection
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsMounted(true);
	}, []);

	return isMounted;
}
