/**
 * DocuSeal API Types
 * Based on @docuseal/api package and DocuSeal API documentation
 */

export interface DocuSealSubmitter {
	role: string;
	email?: string;
	name?: string;
	phone?: string;
	fields?: Array<{
		name: string;
		default_value?: string | number | boolean;
		readonly?: boolean;
	}>;
	send_email?: boolean;
	send_sms?: boolean;
	message?: string;
	metadata?: Record<string, unknown>;
	external_id?: string;
	application_key?: string;
}

export interface DocuSealSubmission {
	id: number;
	source: string;
	submitters_order: string;
	slug: string;
	created_at: string;
	updated_at: string;
	archived_at?: string;
	template_id: number;
	template_folder_name?: string;
	template_name: string;
	audit_log_url: string;
	combined_document_url?: string;
	expire_at?: string;
	expired_at?: string;
	status?: "pending" | "completed" | "declined" | "archived";
	submitters: Array<{
		id: number;
		submission_id: number;
		uuid: string;
		email: string;
		slug: string;
		sent_at?: string;
		opened_at?: string;
		completed_at?: string;
		declined_at?: string;
		created_at: string;
		updated_at: string;
		name?: string;
		phone?: string;
		role?: string;
		external_id?: string;
		metadata?: Record<string, unknown>;
		status: "pending" | "sent" | "opened" | "completed" | "declined";
		values?: Array<{
			field: string;
			value: string | number | boolean;
		}>;
		documents?: Array<{
			name: string;
			url: string;
		}>;
	}>;
	metadata?: Record<string, unknown>;
}

export interface DocuSealTemplate {
	id: number;
	name: string;
	external_id?: string;
	created_at: string;
	updated_at: string;
	folder_name?: string;
	archived_at?: string;
	schema: Array<{
		attachment_uuid: string;
		name: string;
	}>;
	submitters: Array<{
		name: string;
		uuid: string;
	}>;
	documents: Array<{
		name: string;
		url: string;
		preview_image_url?: string;
		metadata?: Record<string, unknown>;
	}>;
	application_key?: string;
}

export interface CreateSubmissionParams {
	template_id: number;
	submitters: DocuSealSubmitter[];
	send_email?: boolean;
	send_sms?: boolean;
	reply_to?: string;
	message?: {
		subject?: string;
		body?: string;
	};
	completed_redirect_url?: string;
	order?: "preserved" | "random";
	metadata?: Record<string, unknown>;
	external_id?: string;
	expire_at?: string;
	bcc_completed?: string;
	preferences?: {
		auto_decline?: boolean;
		decline_reason_required?: boolean;
		sent_email?: boolean;
		completed_email?: boolean;
	};
}

export interface CreateTemplateParams {
	name: string;
	documents?: Array<{
		name: string;
		url: string;
	}>;
	fields?: Array<{
		name: string;
		submitter?: string;
		type?:
			| "text"
			| "signature"
			| "date"
			| "checkbox"
			| "image"
			| "select"
			| "cells"
			| "stamp"
			| "payment"
			| "file";
		required?: boolean;
		default_value?: string | number | boolean;
		readonly?: boolean;
		areas?: Array<{
			x: number;
			y: number;
			w: number;
			h: number;
			page: number;
		}>;
	}>;
	submitters?: Array<{
		name: string;
		uuid?: string;
	}>;
	external_id?: string;
	folder_name?: string;
	application_key?: string;
}

export interface DocuSealWebhookEvent {
	event_type: "form.viewed" | "form.started" | "form.completed";
	timestamp: string;
	data: {
		submission_id: number;
		submitter_id: number;
		template_id: number;
		template_name: string;
		status: string;
		email?: string;
		documents?: Array<{
			name: string;
			url: string;
		}>;
		values?: Array<{
			field: string;
			value: string | number | boolean;
		}>;
		audit_log_url?: string;
		metadata?: Record<string, unknown>;
	};
}

export interface ListSubmissionsParams {
	template_id?: number;
	external_id?: string;
	limit?: number;
	after?: number;
	before?: number;
}

export interface ListTemplatesParams {
	external_id?: string;
	folder?: string;
	application_key?: string;
	limit?: number;
	after?: number;
	before?: number;
}

export interface DocuSealAPIError {
	error: string;
	message?: string;
	details?: Record<string, unknown>;
}

export interface DocuSealConfig {
	key: string;
	url?: string;
}
