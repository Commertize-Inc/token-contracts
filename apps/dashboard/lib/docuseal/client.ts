import docuseal from '@docuseal/api';
import type {
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
} from '@docuseal/api';

/**
 * DocuSeal API Base URL
 * Use DOCUSEAL_API_URL env var for custom instances, defaults to DocuSeal cloud
 */
const DOCUSEAL_API_URL = process.env.DOCUSEAL_API_URL || 'https://api.docuseal.com';

/**
 * Initialize DocuSeal client with configuration
 * Throws if DOCUSEAL_API_KEY is not set
 */
export const initializeDocuSealClient = () => {
	const apiKey = process.env.DOCUSEAL_API_KEY;

	if (!apiKey) {
		throw new Error(
			'DOCUSEAL_API_KEY environment variable is not set. ' +
			'Please obtain an API key from https://console.docuseal.com/api'
		);
	}

	docuseal.configure({
		key: apiKey,
		url: DOCUSEAL_API_URL,
	});

	return docuseal;
};

/**
 * Create a document submission for signing
 *
 * @example
 * ```ts
 * const submission = await createSubmission({
 *   template_id: 1000001,
 *   send_email: true,
 *   submitters: [{
 *     role: 'Investor',
 *     email: 'investor@example.com',
 *     name: 'John Doe'
 *   }]
 * });
 * ```
 */
export const createSubmission = async (
	params: CreateSubmissionData
): Promise<CreateSubmissionResponse> => {
	const client = initializeDocuSealClient();
	return await client.createSubmission(params);
};

/**
 * Get a submission by ID
 */
export const getSubmission = async (id: number): Promise<GetSubmissionResponse> => {
	const client = initializeDocuSealClient();
	return await client.getSubmission(id);
};

/**
 * List submissions with optional filters
 *
 * @example
 * ```ts
 * const submissions = await listSubmissions({
 *   template_id: 1000001,
 *   limit: 10
 * });
 * ```
 */
export const listSubmissions = async (
	params?: GetSubmissionsQuery
): Promise<GetSubmissionsResponse> => {
	const client = initializeDocuSealClient();
	return await client.listSubmissions(params || {});
};

/**
 * Archive a submission
 */
export const archiveSubmission = async (id: number): Promise<ArchiveSubmissionResponse> => {
	const client = initializeDocuSealClient();
	return await client.archiveSubmission(id);
};

/**
 * Create a new template from PDF
 *
 * @example
 * ```ts
 * const template = await createTemplateFromPdf({
 *   name: 'Investment Agreement',
 *   documents: [{
 *     name: 'agreement.pdf',
 *     url: 'https://example.com/agreement.pdf'
 *   }]
 * });
 * ```
 */
export const createTemplateFromPdf = async (
	params: CreateTemplateFromPdfData
): Promise<CreateTemplateFromPdfResponse> => {
	const client = initializeDocuSealClient();
	return await client.createTemplateFromPdf(params);
};

/**
 * Get a template by ID
 */
export const getTemplate = async (id: number): Promise<GetTemplateResponse> => {
	const client = initializeDocuSealClient();
	return await client.getTemplate(id);
};

/**
 * List templates with optional filters
 */
export const listTemplates = async (
	params?: GetTemplatesQuery
): Promise<GetTemplatesResponse> => {
	const client = initializeDocuSealClient();
	return await client.listTemplates(params || {});
};

/**
 * Update a template
 */
export const updateTemplate = async (
	id: number,
	params: UpdateTemplateData
): Promise<UpdateTemplateResponse> => {
	const client = initializeDocuSealClient();
	return await client.updateTemplate(id, params);
};

/**
 * Archive a template
 */
export const archiveTemplate = async (id: number): Promise<ArchiveTemplateResponse> => {
	const client = initializeDocuSealClient();
	return await client.archiveTemplate(id);
};

/**
 * Singleton client instance
 * Use this for direct API access when needed
 */
export const docusealClient = (() => {
	try {
		return initializeDocuSealClient();
	} catch (error) {
		console.warn('DocuSeal client not initialized:', (error as Error).message);
		return null;
	}
})();
