# SocialKit — Agents Guide

## Project

Multi-platform social media toolkit. Monorepo with pnpm + turbo.

## Quick Start

```bash
pnpm install
pnpm test            # run all tests across workspace
pnpm -r build        # build all packages
```

## Architecture

```
packages/core        → types, SocialProvider interface, errors, retry
packages/providers/* → facebook, instagram, zalo (implements SocialProvider)
packages/automation  → scheduler, engine, executor, TaskStore
packages/analyzer    → PostAnalyzer, ContentScorer
packages/cli         → CLI tool with session, registry, daemon
packages/testing     → MockSocialProvider
```

## Dependency Rules (CRITICAL)

```
core → nothing (zero SocialKit deps)
providers/* → core only
automation → core only
analyzer → core only
cli → core + automation + providers/*
testing → core only
```

## Development Rules

1. **Always TDD** — RED (failing test) → GREEN (minimal code) → REFACTOR
2. **Never write production code without a failing test first**
3. **Barrel exports required** — every package needs `src/index.ts`
4. **Module format** — ESM (`"type": "module"`), use `.js` extensions in imports
5. **Test framework** — Jest + ts-jest + nock (for HTTP mocking)
6. **pnpm workspace protocol** — internal deps use `"workspace:*"`

## Provider Contract

Every provider must implement `SocialProvider` from `@socialkit/core`.
Unsupported methods throw `PlatformError`. See `docs/PROVIDER_CONTRACT.md`.

## File Naming

- `{name}.ts` — kebab-case for all files
- `{name}.test.ts` — tests mirror src structure
- `{Platform}Provider` — PascalCase class names
