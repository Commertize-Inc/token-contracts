# Platform User Stories: Verification & Approvals

## 1. Sponsor Information Management

### 1.1 Sponsor Onboarding (Initial Verification)

**As a** new Sponsor,
**I want to** submit my business details (Name, EIN, Address, Business Type) and supporting documents (Articles of Incorporation),
**So that** I can be verified and start listing properties on the platform.

**Acceptance Criteria:**

- User fills out the Sponsor Profile form.
- Status is set to `PENDING`.
- Admin sees the request in the Dashboard.
- Admin can Approve (sets status to `VERIFIED`) or Reject (sets status to `REJECTED` with feedback).

### 1.2 Sponsor Profile Update

**As a** verified Sponsor,
**I want to** request updates to my sensitive business information (Name, EIN, Address),
**So that** my profile remains accurate without losing my verified status immediately.

**Acceptance Criteria:**

- User submits a form with _proposed_ changes.
- A `SponsorUpdateRequest` is created with status `PENDING`.
- The actual Sponsor profile remains unchanged until approval.
- Admin sees the specific diff of changes.
- Admin Approves: Changes are applied to the Sponsor profile.
- Admin Rejects: Request is marked rejected; Sponsor profile is untouched.

## 2. Investor Compliance

### 2.1 Investor Accreditation

**As an** Investor,
**I want to** submit proof of my accredited investor status (e.g., Tax Returns, CPA Letter),
**So that** I can invest in Reg D 506(c) offerings.

**Acceptance Criteria:**

- User selects verification method (Income, Net Worth, Third-Party).
- User uploads required documents.
- Status becomes `PENDING`.
- Admin reviews documents.
- Admin Approves: `Investor.status` becomes `VERIFIED`, `verifiedAt` is set.
- Admin Rejects: `Investor.status` becomes `REJECTED`, user notified.

### 2.2 KYC/AML Verification

**As a** User,
**I want to** submit my personal identity information,
**So that** I comply with platform regulations.

**Acceptance Criteria:**

- User submits PII.
- System/Admin processes verification.
- Status tracks `PENDING` -> `APPROVED` / `REJECTED`.

## 3. Marketplace Operations

### 3.1 Listing Publication

**As a** Sponsor,
**I want to** submit my drafted Listing for platform review,
**So that** it can be published to the marketplace.

**Acceptance Criteria:**

- Listing starts in `DRAFT`.
- Sponsor clicks "Submit for Review".
- Listing status changes to `PENDING_REVIEW`.
- Admin reviews listing details, financials, and tokenomics.
- Admin Approves: Listing status becomes `APPROVED`.
- Admin Rejects: Listing status becomes `REJECTED` (or sent back to Draft).

## 4. Abstraction Potential

All the above flows share a common pattern:

1.  **Actor** submits **Payload** (Changes, Documents, New Entity).
2.  **Request** enters `PENDING` state.
3.  **Reviewer** (Admin) evaluates.
4.  **Action** is taken (Approve/Reject).
5.  **Outcome** is applied (Entity updated, Status changed).

The `VerificationRequest` entity can abstract these by normalizing:

- `requestedBy` (User)
- `status` (PENDING, APPROVED, REJECTED)
- `adminNotes` (Feedback)
- `documents` (Evidence)
- `createdAt`/`updatedAt`

Subclasses would handle the specific **Payload** and the **Apply Logic**.
