"use client";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body>
				<div style={{ padding: "20px", fontFamily: "sans-serif" }}>
					<h1>Something went wrong!</h1>
					<p>An unexpected error occurred.</p>
					<button onClick={() => reset()}>Try again</button>
				</div>
			</body>
		</html>
	);
}
