# SocialKit

Multi-platform social media toolkit. TypeScript monorepo with provider-agnostic core, 3 platform providers, automation engine, content analyzer, CLI, and desktop app.

```
pnpm install
pnpm test        # 209 tests
pnpm build       # 12 packages
```

## Architecture

```
packages/
├── core/           SocialProvider interface, types, errors, retry
├── providers/
│   ├── facebook/   Facebook Graph API (17 tests)
│   ├── instagram/  Instagram Business API (13 tests)
│   └── zalo/       Zalo OA API (13 tests)
├── automation/     Scheduler, engine, executor, TaskStore (38 tests)
├── analyzer/       PostAnalyzer, ContentScorer (13 tests)
├── cli/            CLI with 5 commands + daemon (42 tests)
├── testing/        MockSocialProvider (7 tests)
└── ui/             Button, Card, TextInput (7 tests)
apps/
├── desktop/        Electron + React app (15 tests)
├── dashboard/      Vite + React analyzer SPA (6 tests)
└── playground/     Cross-package smoke tests (5 tests)
```

## Quick Start

```bash
# CLI
export SOCIALKIT_FACEBOOK_APP_ID=your_app_id
export SOCIALKIT_FACEBOOK_APP_SECRET=your_app_secret
pnpm -r build
node packages/cli/dist/cli-entry.js login facebook
node packages/cli/dist/cli-entry.js whoami
node packages/cli/dist/cli-entry.js post --page me --message "Hello from SocialKit"
node packages/cli/dist/cli-entry.js schedule --page me --message "Later" --at "2099-01-01T09:00"

# Desktop (Electron)
cd apps/desktop && pnpm dev

# Dashboard (analytics SPA)
cd apps/dashboard && pnpm dev
```

## Dependency Rules

```
core → nothing
providers/* → core
automation → core
analyzer → core
cli → core + automation + providers
desktop → automation + analyzer + ui
dashboard → core + analyzer
```

## Development

All code is written test-first (TDD). See [AGENTS.md](AGENTS.md) for the development contract.

```
pnpm test          # run all 209 tests
pnpm -r build      # build all packages
pnpm -r lint       # lint all packages
```

## Platform Support

| Feature | Facebook | Instagram | Zalo |
|---------|----------|-----------|------|
| Auth | ✅ OAuth 2.0 | ✅ OAuth 2.0 | ✅ OAuth 2.0 |
| Profile | ✅ | ✅ | ✅ |
| Posts | ✅ | ✅ (media) | ❌ (no feed) |
| Publish | ✅ 1-step | ✅ 2-step | ✅ (broadcast) |
| Comments | ✅ | ✅ | ❌ |
| Likes | ✅ | ❌ | ❌ |

[Full contract](docs/PROVIDER_CONTRACT.md)

## License

MIT
