---
name: add-or-extend-cli-command
description: Workflow command scaffold for add-or-extend-cli-command in SocialKit.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-extend-cli-command

Use this workflow when working on **add-or-extend-cli-command** in `SocialKit`.

## Goal

Adds a new CLI command or extends CLI capabilities, including argument parsing and tests.

## Common Files

- `packages/cli/src/cli.ts`
- `packages/cli/src/args.ts`
- `packages/cli/src/cli-entry.ts`
- `packages/cli/src/*.ts`
- `packages/cli/__tests__/*.test.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Implement or update CLI logic in src/cli.ts, src/args.ts, or related files.
- Add or update command-specific files (e.g., src/login.ts, src/configure.ts).
- Update or add tests in __tests__ (e.g., config.test.ts, configure.test.ts, login.test.ts).
- Update CLI entry point if needed (src/cli-entry.ts).

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.