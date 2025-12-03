import type {
	GetSubmissionResponse,
} from '@docuseal/api';
import type {
	DocuSealWebhookEvent,
} from './types';

/**
 * Check if a submission is completed
 */
export const isSubmissionCompleted = (submission: GetSubmissionResponse): boolean => {
	return submission.submitters?.every(submitter => submitter.status === 'completed') ?? false;
};

/**
 * Check if a submission has been declined
 */
export const isSubmissionDeclined = (submission: GetSubmissionResponse): boolean => {
	return submission.submitters?.some(submitter => submitter.status === 'declined') ?? false;
};

/**
 * Check if a submission is pending (waiting for signatures)
 */
export const isSubmissionPending = (submission: GetSubmissionResponse): boolean => {
	return submission.submitters?.some(submitter =>
		submitter.status === 'awaiting' || submitter.status === 'sent' || submitter.status === 'opened'
	) ?? false;
};

/**
 * Get the first incomplete submitter from a submission
 */
export const getNextSubmitter = (submission: GetSubmissionResponse) => {
	return submission.submitters?.find(
		submitter => submitter.status !== 'completed' && submitter.status !== 'declined'
	);
};

/**
 * Get all completed submitters from a submission
 */
export const getCompletedSubmitters = (submission: GetSubmissionResponse) => {
	return submission.submitters?.filter(submitter => submitter.status === 'completed') ?? [];
};

/**
 * Get field values from a completed submission
 */
export const getSubmissionValues = (submission: GetSubmissionResponse) => {
	const values: Record<string, unknown> = {};

	submission.submitters?.forEach(submitter => {
		if (submitter.values) {
			Object.entries(submitter.values).forEach(([field, value]) => {
				values[field] = value;
			});
		}
	});

	return values;
};

/**
 * Get all documents from a completed submission
 */
export const getSubmissionDocuments = (submission: GetSubmissionResponse) => {
	const documents: Array<{ name: string; url: string; submitter: string }> = [];

	submission.submitters?.forEach(submitter => {
		if (submitter.documents) {
			submitter.documents.forEach(doc => {
				documents.push({
					name: doc.name,
					url: doc.url,
					submitter: submitter.email || submitter.name || 'Unknown',
				});
			});
		}
	});

	return documents;
};

/**
 * Validate DocuSeal webhook signature
 * Use this in webhook handlers to verify requests are from DocuSeal
 *
 * @param payload - Raw webhook payload
 * @param signature - Signature from X-DocuSeal-Signature header
 * @param secret - Your webhook secret (from DocuSeal console)
 */
export const validateWebhookSignature = async (
	payload: string,
	signature: string,
	secret: string
): Promise<boolean> => {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	const signatureBytes = await crypto.subtle.sign(
		'HMAC',
		key,
		encoder.encode(payload)
	);

	const signatureHex = Array.from(new Uint8Array(signatureBytes))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');

	return signatureHex === signature;
};

/**
 * Parse and validate a DocuSeal webhook event
 */
export const parseWebhookEvent = (body: unknown): DocuSealWebhookEvent => {
	if (!body || typeof body !== 'object') {
		throw new Error('Invalid webhook payload');
	}

	const event = body as DocuSealWebhookEvent;

	if (!event.event_type || !event.timestamp || !event.data) {
		throw new Error('Invalid webhook event structure');
	}

	return event;
};

/**
 * Format a submission status for display
 */
export const formatSubmissionStatus = (submission: GetSubmissionResponse): string => {
	if (isSubmissionCompleted(submission)) {
		return 'Completed';
	}
	if (isSubmissionDeclined(submission)) {
		return 'Declined';
	}
	// Check if archived (if property exists)
	if ('archived_at' in submission && submission.archived_at) {
		return 'Archived';
	}
	return 'Pending';
};

/**
 * Calculate submission completion percentage
 */
export const getSubmissionProgress = (submission: GetSubmissionResponse): number => {
	if (!submission.submitters || submission.submitters.length === 0) return 0;

	const completed = submission.submitters.filter(s => s.status === 'completed').length;
	return Math.round((completed / submission.submitters.length) * 100);
};

/**
 * Generate a submission link for a specific submitter
 */
export const getSubmitterLink = (
	submission: GetSubmissionResponse,
	submitterEmail: string
): string | null => {
	const submitter = submission.submitters?.find(s => s.email === submitterEmail);
	if (!submitter) return null;

	return `https://docuseal.com/s/${submitter.slug}`;
};
