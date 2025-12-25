import { Hono } from "hono";
import { put, del } from "@vercel/blob";
import { authMiddleware } from "../middleware/auth";
import { HonoEnv } from "../types";

const upload = new Hono<HonoEnv>();

upload.use("*", authMiddleware);

// Helper to get the correct blob token based on environment
const getBlobToken = () => {
	// Use production token in production, preview token otherwise
	const isProduction = process.env.NODE_ENV === "production";
	return isProduction
		? process.env.BLOB_PROD_READ_WRITE_TOKEN
		: process.env.BLOB_PREVIEW_READ_WRITE_TOKEN;
};

// POST /upload/document - Upload PDF document to Vercel Blob
upload.post("/document", async (c) => {
	try {
		const formData = await c.req.formData();
		const file = formData.get("file");

		if (!file || !(file instanceof File)) {
			return c.json({ error: "No file provided" }, 400);
		}

		// Validate file type
		if (file.type !== "application/pdf") {
			return c.json(
				{ error: "Invalid file type. Only PDF files are allowed." },
				400
			);
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB in bytes
		if (file.size > maxSize) {
			return c.json(
				{ error: "File size exceeds maximum limit of 10MB" },
				400
			);
		}

		// Generate a unique filename
		const timestamp = Date.now();
		const userId = c.get("userId");
		const filename = `documents/${userId}/${timestamp}-${file.name}`;

		// Upload to Vercel Blob with environment-specific token
		const blob = await put(filename, file, {
			access: "public",
			token: getBlobToken(),
		});

		return c.json({
			success: true,
			url: blob.url,
			filename: file.name,
			size: file.size,
		});
	} catch (error) {
		console.error("Error uploading file:", error);
		return c.json(
			{
				error: "Failed to upload file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500
		);
	}
});

// DELETE /upload/document - Delete a document from Vercel Blob
upload.delete("/document", async (c) => {
	try {
		const { url } = await c.req.json();

		if (!url) {
			return c.json({ error: "No URL provided" }, 400);
		}

		// Only delete if it's a Vercel Blob URL (not external URLs)
		if (url.includes("blob.vercel-storage.com") || url.includes(".r2.dev")) {
			await del(url, { token: getBlobToken() });
		}

		return c.json({ success: true });
	} catch (error) {
		console.error("Error deleting file:", error);
		return c.json(
			{
				error: "Failed to delete file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			500
		);
	}
});

export default upload;
