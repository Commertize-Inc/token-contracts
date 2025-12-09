/**
 * Generic encryption utilities for sensitive data
 *
 * Uses AES-256-GCM encryption to secure sensitive data before storing in the database.
 * This includes access tokens, API keys, and other confidential information.
 *
 * IMPORTANT: Set AES_KEY environment variable (32-byte hex string)
 * Generate with: openssl rand -hex 32
 */

import crypto from "crypto";
import { loadEnv } from "@commertize/utils/env";

// Ensure env is loaded
loadEnv(process.cwd());

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For AES, this is always 16 bytes
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment variable
 * Falls back to a default key in development (NOT SECURE - for dev only)
 */
function getEncryptionKey(): Buffer {
	const envKey = process.env.AES_KEY;

	if (!envKey) {
		if (process.env.NODE_ENV === "production") {
			throw new Error(
				"AES_KEY environment variable is required in production. " +
				"Generate with: openssl rand -hex 32"
			);
		}

		// Silence warning in test/build if needed, or keep for dev awareness
		if (process.env.NODE_ENV !== "test") {
			console.warn(
				"[Security] Using default encryption key in development. " +
				"Set AES_KEY environment variable for production."
			);
		}

		// Default key for development only (32 bytes)
		return Buffer.from(
			"0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
			"hex"
		);
	}

	const key = Buffer.from(envKey, "hex");

	if (key.length !== 32) {
		throw new Error(
			"AES_KEY must be a 32-byte (64 character) hex string. " +
			"Generate with: openssl rand -hex 32"
		);
	}

	return key;
}

/**
 * Encrypt a plaintext string
 * Returns base64-encoded ciphertext with IV and auth tag prepended
 *
 * Format: [IV:16 bytes][Auth Tag:16 bytes][Ciphertext:variable]
 */
export function encrypt(plaintext: string): string {
	if (!plaintext) {
		throw new Error("Cannot encrypt empty string");
	}

	const key = getEncryptionKey();
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(plaintext, "utf8", "hex");
	encrypted += cipher.final("hex");

	const authTag = cipher.getAuthTag();

	// Combine IV + auth tag + encrypted data
	const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, "hex")]);

	return combined.toString("base64");
}

/**
 * Decrypt a ciphertext string
 * Expects base64-encoded input with IV and auth tag prepended
 */
export function decrypt(ciphertext: string): string {
	if (!ciphertext) {
		throw new Error("Cannot decrypt empty string");
	}

	const key = getEncryptionKey();
	const combined = Buffer.from(ciphertext, "base64");

	// Extract IV, auth tag, and encrypted data
	const iv = combined.subarray(0, IV_LENGTH);
	const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
	const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
	decrypted += decipher.final("utf8");

	return decrypted;
}

/**
 * Hash a string (one-way, for comparison only)
 * Useful for checking if a value has changed without storing the original
 */
export function hash(value: string): string {
	const salt = crypto.randomBytes(SALT_LENGTH);
	const hash = crypto.pbkdf2Sync(value, salt, 100000, 64, "sha512");

	return salt.toString("hex") + ":" + hash.toString("hex");
}

/**
 * Verify a value against a hash
 */
export function verifyHash(value: string, hashedValue: string): boolean {
	const [salt, originalHash] = hashedValue.split(":");
	const hash = crypto
		.pbkdf2Sync(value, Buffer.from(salt, "hex"), 100000, 64, "sha512")
		.toString("hex");

	return hash === originalHash;
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
	return !!process.env.AES_KEY;
}

/**
 * Generate a new encryption key (for setup/rotation)
 */
export function generateEncryptionKey(): string {
	return crypto.randomBytes(32).toString("hex");
}
