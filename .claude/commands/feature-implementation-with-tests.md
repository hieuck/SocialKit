---
name: feature-implementation-with-tests
description: Workflow command scaffold for feature-implementation-with-tests in SocialKit.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /feature-implementation-with-tests

Use this workflow when working on **feature-implementation-with-tests** in `SocialKit`.

## Goal

Implements a new feature or capability, along with corresponding unit/integration tests.

## Common Files

- `packages/*/src/*.ts`
- `packages/*/__tests__/*.test.ts`
- `apps/*/src/**/*.ts`
- `apps/*/__tests__/*.test.ts`
- `apps/*/package.json`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Implement new feature logic in source files (e.g., src/feature.ts).
- Add or update corresponding test files (e.g., __tests__/feature.test.ts).
- Update package.json or configuration if needed.
- Commit with a feat: or similar message.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.