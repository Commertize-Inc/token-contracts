# DocuSeal Integration Examples

Quick examples for using DocuSeal in your Commertize dashboard.

## 1. Send Investment Agreement for Signature

```typescript
// app/api/investments/send-agreement/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSubmission } from "@/lib/docuseal";

export async function POST(req: NextRequest) {
	try {
		const { userId, email, name, investmentAmount, propertyName } =
			await req.json();

		const submission = await createSubmission({
			template_id: 1000001, // Your investment agreement template ID
			send_email: true,
			submitters: [
				{
					role: "Investor",
					email,
					name,
				},
			],
			// Pre-fill form fields
			values: {
				"Investment Amount": investmentAmount,
				Property: propertyName,
				Date: new Date().toISOString().split("T")[0],
			},
			// Metadata to track in your database
			metadata: {
				userId,
				propertyName,
				amount: investmentAmount,
			},
			// Redirect after completion
			completed_redirect_url: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/investments/complete`,
		});

		return NextResponse.json({
			success: true,
			submissionId: submission.id,
		});
	} catch (error) {
		console.error("Failed to create submission:", error);
		return NextResponse.json(
			{ error: "Failed to send agreement" },
			{ status: 500 }
		);
	}
}
```

## 2. Check Document Status

```typescript
// app/api/documents/status/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
	getSubmission,
	formatSubmissionStatus,
	getSubmissionProgress,
} from "@/lib/docuseal";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const submission = await getSubmission(Number(params.id));

		return NextResponse.json({
			status: formatSubmissionStatus(submission),
			progress: getSubmissionProgress(submission),
			submitters: submission.submitters?.map((s) => ({
				email: s.email,
				status: s.status,
				completedAt: s.completed_at,
			})),
		});
	} catch (error) {
		console.error("Failed to get submission:", error);
		return NextResponse.json(
			{ error: "Failed to get document status" },
			{ status: 500 }
		);
	}
}
```

## 3. Handle Webhook Events

```typescript
// app/api/webhooks/docuseal/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseWebhookEvent, validateWebhookSignature } from "@/lib/docuseal";
import { getORM } from "@/lib/db/orm";
import { User } from "@/lib/db/entities/User";

export async function POST(req: NextRequest) {
	try {
		// Get raw body for signature validation
		const body = await req.text();
		const signature = req.headers.get("X-DocuSeal-Signature") || "";

		// Validate webhook signature (recommended for production)
		if (process.env.DOCUSEAL_WEBHOOK_SECRET) {
			const isValid = await validateWebhookSignature(
				body,
				signature,
				process.env.DOCUSEAL_WEBHOOK_SECRET
			);

			if (!isValid) {
				return NextResponse.json(
					{ error: "Invalid signature" },
					{ status: 401 }
				);
			}
		}

		// Parse event
		const event = parseWebhookEvent(JSON.parse(body));
		const { event_type, data } = event;

		// Handle different event types
		switch (event_type) {
			case "form.completed":
				// Document was signed by all parties
				console.log("Document completed:", data.submission_id);

				// Update user record
				if (data.metadata?.userId) {
					const orm = await getORM();
					const em = orm.em.fork();

					const user = await em.findOne(User, {
						id: data.metadata.userId as string,
					});
					if (user) {
						// Store submission ID or mark as completed
						await em.flush();
					}
				}

				// Send confirmation email, trigger next workflow step, etc.
				break;

			case "form.viewed":
				console.log("Document viewed:", data.submission_id);
				// Track engagement
				break;

			case "form.started":
				console.log("Document started:", data.submission_id);
				// Track progress
				break;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 }
		);
	}
}
```

## 4. Download Signed Documents

```typescript
// app/api/documents/download/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSubmission, getSubmissionDocuments } from "@/lib/docuseal";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const submission = await getSubmission(Number(params.id));
		const documents = getSubmissionDocuments(submission);

		if (documents.length === 0) {
			return NextResponse.json(
				{ error: "No documents available" },
				{ status: 404 }
			);
		}

		// Return document URLs
		return NextResponse.json({
			documents: documents.map((doc) => ({
				name: doc.name,
				url: doc.url,
				signedBy: doc.submitter,
			})),
		});
	} catch (error) {
		console.error("Failed to get documents:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve documents" },
			{ status: 500 }
		);
	}
}
```

## 5. List User's Documents

```typescript
// app/api/users/[userId]/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { listSubmissions } from "@/lib/docuseal";

export async function GET(
	req: NextRequest,
	{ params }: { params: { userId: string } }
) {
	try {
		// Get all submissions for this user
		const submissions = await listSubmissions({
			limit: 50,
			// You can filter by external_id if you store userId there
		});

		// Filter by metadata if you stored userId there
		const userSubmissions = submissions.data.filter(
			(sub) => sub.metadata?.userId === params.userId
		);

		return NextResponse.json({
			submissions: userSubmissions.map((sub) => ({
				id: sub.id,
				templateName: sub.template?.name,
				status: sub.status,
				createdAt: sub.created_at,
				submitters: sub.submitters,
			})),
		});
	} catch (error) {
		console.error("Failed to list submissions:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve documents" },
			{ status: 500 }
		);
	}
}
```

## 6. Client Component - Document Status

```typescript
// components/DocumentStatus.tsx
'use client';

import { useEffect, useState } from 'react';

interface DocumentStatusProps {
  submissionId: number;
}

export default function DocumentStatus({ submissionId }: DocumentStatusProps) {
  const [status, setStatus] = useState<string>('Loading...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch(`/api/documents/status/${submissionId}`);
        const data = await response.json();
        setStatus(data.status);
        setProgress(data.progress);
      } catch (error) {
        console.error('Failed to check status:', error);
        setStatus('Error');
      }
    }

    checkStatus();

    // Poll every 30 seconds if not completed
    const interval = setInterval(() => {
      if (progress < 100) {
        checkStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [submissionId, progress]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Document Status</span>
        <span className="text-sm text-gray-600">{status}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{progress}% complete</p>
    </div>
  );
}
```

## Environment Variables

Add to your `.env` file:

```env
# DocuSeal Configuration
DOCUSEAL_API_KEY=your_api_key_here

# Optional - for custom/self-hosted DocuSeal instance
DOCUSEAL_API_URL=https://api.docuseal.com

# Optional - for webhook signature validation
DOCUSEAL_WEBHOOK_SECRET=your_webhook_secret
```

## Common Use Cases for Commertize

### Investor Onboarding Flow

1. User completes KYC
2. Send investment agreement via DocuSeal
3. User signs electronically
4. Webhook notifies completion
5. Activate investor account

### Property Investment Documents

- Purchase agreements
- Subscription agreements
- Operating agreements
- Disclosure documents
- W-9 forms

### Compliance Documents

- Accreditation verification
- Risk acknowledgment forms
- Terms of service agreements
