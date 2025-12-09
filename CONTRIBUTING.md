# Contributing to Commertize

Thank you for your interest in contributing to Commertize! This guide will help you get started with our development workflow and standards.

## Development Workflow

1.  **Branching**: Create a new branch for each feature or fix.
    -   `feature/your-feature-name`
    -   `fix/your-fix-name`
2.  **Committing**: We use [Conventional Commits](https://www.conventionalcommits.org/).
    -   `feat: add new investment card`
    -   `fix: resolve hydration error in navbar`
    -   `docs: update readme`
    -   `chore: upgrade dependencies`
3.  **Pull Requests**:
    -   Open a PR to `main`.
    -   Ensure all checks pass (linting, build).
    -   Request a review from a team member.

## Code Style

-   **TypeScript**: We use strict TypeScript. Avoid `any`.
-   **Formatting**: Prettier is configured. Run `pnpm format` to auto-format.
-   **Linting**: ESLint is configured. Run `pnpm lint` to check for issues.
-   **Tailwind**: Sort classes logically (though we don't strictly enforce a sorter yet, try to group layout, spacing, and visual styles).

## Project Structure

-   `apps/`: Application source code.
-   `packages/`: Shared libraries.
-   `docs/`: Project documentation.

## Getting Help

If you're stuck, refer to the [Development Guide](DEVELOPMENT.md) or reach out to the team.
