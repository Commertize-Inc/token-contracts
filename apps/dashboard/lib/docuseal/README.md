# DocuSeal API Integration

Complete integration with DocuSeal's document signing API for the Commertize dashboard.

## Overview

This integration provides a type-safe, easy-to-use interface for DocuSeal's API, enabling document signing workflows for investor onboarding, KYC verification, and agreement management.

## Setup

### 1. Install Dependencies

The `@docuseal/api` package is already installed in the project.

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Required - Get your API key from https://console.docuseal.com/api
DOCUSEAL_API_KEY=your_api_key_here

# Optional - Defaults to https://api.docuseal.com
# Only needed if using a self-hosted DocuSeal instance
DOCUSEAL_API_URL=https://api.docuseal.com
```

### 3. Get Your API Key

1. Sign up at [DocuSeal](https://docuseal.com/sign_up)
2. Navigate to [API Console](https://console.docuseal.com/api)
3. Copy your API key
4. Add it to your `.env` file

## Usage

### Creating a Submission (Send Document for Signature)

```typescript
import { createSubmission } from '@/lib/docuseal';

// Send a document for signature
const submission = await createSubmission({
  template_id: 1000001, // Template ID from DocuSeal
  send_email: true,
  submitters: [
    {
      role: 'Investor',
      email: 'investor@example.com',
      name: 'John Doe'
    }
  ]
});

console.log('Submission created:', submission.id);
```

### Checking Submission Status

```typescript
import { getSubmission, formatSubmissionStatus } from '@/lib/docuseal';

const submission = await getSubmission(submissionId);
console.log('Status:', formatSubmissionStatus(submission));
```

### Getting Completed Documents

```typescript
import { getSubmission, getSubmissionDocuments } from '@/lib/docuseal';

const submission = await getSubmission(submissionId);
const documents = getSubmissionDocuments(submission);

documents.forEach(doc => {
  console.log(`${doc.name}: ${doc.url}`);
});
```

### Creating a Template

```typescript
import { createTemplate } from '@/lib/docuseal';

const template = await createTemplate({
  name: 'Investment Agreement',
  documents: [
    {
      name: 'agreement.pdf',
      url: 'https://example.com/agreement.pdf'
    }
  ],
  submitters: [
    { name: 'Investor' },
    { name: 'Company Representative' }
  ]
});
```

## API Reference

### Client Functions

#### `createSubmission(params)`
Create a new document submission for signing.

**Parameters:**
- `template_id` - Template ID from DocuSeal
- `submitters` - Array of submitter objects
- `send_email` - Whether to send email invitations (default: true)
- `order` - Signing order: 'preserved' or 'random'
- `metadata` - Custom metadata object

#### `getSubmission(id)`
Get a submission by ID.

#### `listSubmissions(params?)`
List submissions with optional filters.

#### `archiveSubmission(id)`
Archive a submission.

#### `createTemplate(params)`
Create a new document template.

#### `getTemplate(id)`
Get a template by ID.

#### `listTemplates(params?)`
List templates with optional filters.

### Utility Functions

#### `isSubmissionCompleted(submission)`
Check if all submitters have completed signing.

#### `isSubmissionPending(submission)`
Check if submission is waiting for signatures.

#### `getSubmissionProgress(submission)`
Calculate completion percentage (0-100).

#### `getSubmissionValues(submission)`
Extract all field values from a completed submission.

#### `getSubmissionDocuments(submission)`
Get all signed documents with URLs.

#### `formatSubmissionStatus(submission)`
Format status as human-readable string.

## Use Cases for Commertize

### 1. Investor Onboarding

```typescript
// Send investment agreement after KYC approval
const submission = await createSubmission({
  template_id: INVESTMENT_AGREEMENT_TEMPLATE_ID,
  send_email: true,
  submitters: [
    {
      role: 'Investor',
      email: user.email,
      name: user.name,
      fields: [
        { name: 'Investment Amount', default_value: '$50,000' },
        { name: 'Property', default_value: 'Ocean View Residences' }
      ]
    }
  ],
  metadata: {
    userId: user.id,
    propertyId: property.id
  }
});

// Store submission ID in database
await db.user.update({
  where: { id: user.id },
  data: { investmentAgreementSubmissionId: submission.id }
});
```

### 2. KYC Document Signing

```typescript
// Send KYC verification documents
const kycSubmission = await createSubmission({
  template_id: KYC_TEMPLATE_ID,
  send_email: true,
  submitters: [
    {
      role: 'User',
      email: user.email,
      name: user.name
    }
  ],
  completed_redirect_url: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/kyc/complete`,
  metadata: { userId: user.id }
});
```

### 3. Webhook Handler (API Route)

Create `app/api/webhooks/docuseal/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { parseWebhookEvent, validateWebhookSignature } from '@/lib/docuseal';

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature validation
    const body = await req.text();
    const signature = req.headers.get('X-DocuSeal-Signature') || '';

    // Validate webhook signature
    const isValid = await validateWebhookSignature(
      body,
      signature,
      process.env.DOCUSEAL_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse event
    const event = parseWebhookEvent(JSON.parse(body));

    // Handle different event types
    switch (event.event_type) {
      case 'form.completed':
        // Update user record when documents are signed
        console.log('Document completed:', event.data.submission_id);
        // Update database, send notifications, etc.
        break;

      case 'form.viewed':
        console.log('Document viewed:', event.data.submission_id);
        break;

      case 'form.started':
        console.log('Document started:', event.data.submission_id);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

### 4. Checking Document Status in UI

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function DocumentStatus({ submissionId }: { submissionId: number }) {
  const [status, setStatus] = useState('Loading...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function checkStatus() {
      const response = await fetch(`/api/documents/status/${submissionId}`);
      const { status, progress } = await response.json();
      setStatus(status);
      setProgress(progress);
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [submissionId]);

  return (
    <div>
      <p>Status: {status}</p>
      <progress value={progress} max={100} />
    </div>
  );
}
```

## Types

All TypeScript types are exported from the main module:

```typescript
import type {
  DocuSealSubmission,
  DocuSealSubmitter,
  DocuSealTemplate,
  CreateSubmissionParams,
  DocuSealWebhookEvent
} from '@/lib/docuseal';
```

## Error Handling

```typescript
import { createSubmission } from '@/lib/docuseal';

try {
  const submission = await createSubmission(params);
} catch (error) {
  if (error instanceof Error) {
    console.error('DocuSeal error:', error.message);
    // Handle specific errors
    if (error.message.includes('API key')) {
      // Handle authentication error
    }
  }
}
```

## Pricing

DocuSeal offers:
- **Sandbox**: Free unlimited testing
- **Production**: $0.20 per signed document

## Resources

- [DocuSeal API Documentation](https://www.docuseal.com/docs/api)
- [DocuSeal Guides](https://www.docuseal.com/guides)
- [Get API Key](https://console.docuseal.com/api)
- [Webhooks Setup](https://console.docuseal.com/webhooks)

## Support

For issues with the integration, check:
1. Environment variables are set correctly
2. API key is valid and not expired
3. Template IDs exist in your DocuSeal account

For DocuSeal API issues:
- Email: [support@docuseal.com](mailto:support@docuseal.com)
- Discord: [Join Community](https://discord.gg/qygYCDGck9)
