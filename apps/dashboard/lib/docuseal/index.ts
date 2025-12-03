/**
 * DocuSeal API Integration
 *
 * This module provides a complete integration with DocuSeal's document signing API.
 *
 * @example Basic Usage
 * ```ts
 * import { createSubmission, getSubmission } from '@/lib/docuseal';
 *
 * // Create a new submission
 * const submission = await createSubmission({
 *   template_id: 1000001,
 *   send_email: true,
 *   submitters: [{
 *     role: 'Investor',
 *     email: 'investor@example.com',
 *     name: 'John Doe'
 *   }]
 * });
 *
 * // Check submission status
 * const current = await getSubmission(submission.id);
 * console.log(formatSubmissionStatus(current));
 * ```
 *
 * @example Environment Variables
 * ```env
 * # Required
 * DOCUSEAL_API_KEY=your_api_key_here
 *
 * # Optional (defaults to https://api.docuseal.com)
 * DOCUSEAL_API_URL=https://api.docuseal.com
 * ```
 */

// Client functions
export {
	docusealClient,
	createSubmission,
	getSubmission,
	listSubmissions,
	archiveSubmission,
	createTemplateFromPdf,
	getTemplate,
	listTemplates,
	updateTemplate,
	archiveTemplate,
} from "./client";

// Re-export DocuSeal API types
export type {
	CreateSubmissionData,
	CreateSubmissionResponse,
	GetSubmissionResponse,
	GetSubmissionsQuery,
	GetSubmissionsResponse,
	ArchiveSubmissionResponse,
	GetTemplateResponse,
	GetTemplatesQuery,
	GetTemplatesResponse,
	UpdateTemplateData,
	UpdateTemplateResponse,
	ArchiveTemplateResponse,
	CreateTemplateFromPdfData,
	CreateTemplateFromPdfResponse,
} from "@docuseal/api";

// Custom types
export type { DocuSealWebhookEvent } from "./types";

// Utility functions
export {
	isSubmissionCompleted,
	isSubmissionDeclined,
	isSubmissionPending,
	getNextSubmitter,
	getCompletedSubmitters,
	getSubmissionValues,
	getSubmissionDocuments,
	validateWebhookSignature,
	parseWebhookEvent,
	formatSubmissionStatus,
	getSubmissionProgress,
	getSubmitterLink,
} from "./utils";
