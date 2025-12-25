# AI Agent Working Agreement

This document provides instructions for AI agents (Antigravity, Cursor, Claude, etc.) working on the Commertize platform.

## 1. Governance & Source of Truth

**Documentation is the primary source of truth for product requirements and architectural decisions.**

Attributes found in:

- `docs/product/`: Contains User Stories, Acceptance Criteria, and Product Requirements.
- `docs/technical/` (or root `docs/`): System architecture, guides, and technical references.
- `packages/data/src/entities`: The Database Schema is the ground truth for data structure.

## 2. Workflow Protocol

When starting a new task, you **MUST** follow this protocol:

### Phase 1: Context Loading

Before writing any code or plans:

1.  **Search Docs**: Check `docs/product/` for relevant user stories (e.g., `VERIFICATION_USER_STORIES.md`).
2.  **Align Understanding**: Verify that your understanding of the task matches the Acceptance Criteria defined in the docs.
3.  **Identify Gaps**: If the user request contradicts the docs or if explicit requirements are missing, **ask the user** for clarification.

### Phase 2: Design & Planning

1.  **Reference Definitions**: Explicitly cite the User Story or Requirement you are implementing in your `implementation_plan.md`.
2.  **Schema First**: If data changes are needed, refer to existing entities to maintain consistency (e.g., Use `VerificationRequest` pattern for approval flows).
3.  **TDD Alignment**: Proposed tests should directly verify the _Acceptance Criteria_ listed in the product docs.

### Phase 3: Implementation

1.  **Zero Hallucination**: Do not invent business logic. If logic is unspecified, check the docs. If not in docs, ask the user.
2.  **Update Docs**: If implementation decisions change the product behavior, **you must update the relevant documentation** as part of your PR/Commit.

## 3. Decision Making Framework

When faced with multiple implementation paths, use this hierarchy:

1.  **Explicit User Instruction**: (Highest priority for immediate task)
2.  **`docs/product` Requirements**: (Strategic alignment)
3.  **Existing Code Patterns**: (Consistency)
    - _Example_: "Since `SponsorUpdateRequest` extends `VerificationRequest`, the new `InvestorAccreditationRequest` should also extend `VerificationRequest`."

## 4. Key Architectural Patterns to Respect

- **Monorepo Structure**: Respect the boundaries between `apps/` and `packages/`.
- **Shared Data**: All entities, enums, and schemas dwell in `packages/data`.
- **Generic Abstractions**: Prefer generic patterns (like `VerificationRequest`) over one-off implementations for repeated workflows (like Approvals).
