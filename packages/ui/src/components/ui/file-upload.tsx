import * as React from "react";
import { Loader2, Upload, File as FileIcon, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Input } from "./input";

export interface FileUploadProps {
	value?: string;
	onChange: (url: string) => void;
	onBlur?: () => void;
	accept?: string;
	maxSizeMB?: number; // Default 10MB
	endpoint?: string;
	className?: string;
	placeholder?: string;
	disabled?: boolean;
}

export function FileUpload({
	value,
	onChange,
	onBlur,
	accept = "application/pdf",
	maxSizeMB = 10,
	endpoint = "/api/upload/document", // Default endpoint relative to app
	className,
	placeholder = "Upload PDF or enter URL",
	disabled = false,
}: FileUploadProps) {
	const [isUploading, setIsUploading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate type
		if (accept && !file.type.match(accept.replace("*", ".*"))) {
			setError(`Invalid file type. Accepted: ${accept}`);
			return;
		}

		// Validate size
		if (file.size > maxSizeMB * 1024 * 1024) {
			setError(`File too large. Max size: ${maxSizeMB}MB`);
			return;
		}

		setIsUploading(true);
		setError(null);

		try {
			const formData = new FormData();
			formData.append("file", file);

			// We assume the app (dashboard) has the API configured properly with base URLs if needed,
			// or we use a relative path if it's proxied.
			// Since this is a shared UI component, we might rely on the consumer properly configuring axios or fetch.
			// For simplicity and standard usage here, let's use fetch.
			// Ideally this should probably use an injected uploader function, but for now we hardcode fetch to the endpoint.

			// Use the provided endpoint. If it's relative, it will use the current origin.
			const token = localStorage.getItem("privy:token"); // Quick hack to get token if needed, or rely on cookies
			// Better approach: Since we are in a monorepo, the apps usually have an 'api' helper.
			// But UI package shouldn't depend on app logic.
			// We will try a standard fetch with Authorization header if we can find one.

			// NOTE: This component assumes the API is reachable at `endpoint`

			const res = await fetch(endpoint.startsWith("http") ? endpoint : `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${endpoint}`, {
				method: "POST",
				body: formData,
				headers: {
					// Try to get token from storage if available, generic way
					...(token ? { "Authorization": `Bearer ${token}` } : {})
				}
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Upload failed");
			}

			const data = await res.json();
			onChange(data.url);
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Upload failed");
		} finally {
			setIsUploading(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleClear = () => {
		onChange("");
		setError(null);
	};

	return (
		<div className={cn("w-full space-y-2", className)}>
			<div className="flex gap-2">
				<Input
					value={value || ""}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					placeholder={placeholder}
					className="flex-1"
					disabled={disabled || isUploading}
				/>
				{value ? (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={handleClear}
						disabled={disabled}
						className="shrink-0"
					>
						<X className="w-4 h-4 text-muted-foreground" />
					</Button>
				) : (
					<Button
						type="button"
						variant="outline"
						size="icon"
						onClick={() => fileInputRef.current?.click()}
						disabled={disabled || isUploading}
						className="shrink-0"
					>
						{isUploading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<Upload className="w-4 h-4" />
						)}
					</Button>
				)}
			</div>
			<input
				type="file"
				ref={fileInputRef}
				className="hidden"
				accept={accept}
				onChange={handleFileSelect}
			/>
			{value && (
				<div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
					<FileIcon className="w-3 h-3" />
					<span>File attached</span>
				</div>
			)}
			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
