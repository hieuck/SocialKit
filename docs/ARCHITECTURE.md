# SocialKit Architecture

## Directory Layout

```
socialkit/
├── apps/
│   ├── desktop/          # Desktop app (end-user)
│   ├── dashboard/        # Web dashboard (future)
│   └── playground/       # Dev/test environment
├── packages/
│   ├── core/             # Contracts, types, errors, config, logger
│   ├── automation/       # Workflow engine, queue, retry, scheduler
│   ├── analyzer/         # Content analysis, reporting, scoring
│   ├── cli/              # Command-line tool
│   ├── testing/          # Shared mocks, test utilities (dev-only)
│   ├── ui/               # Shared UI components
│   └── providers/
│       ├── facebook/     # Facebook Graph API implementation
│       ├── instagram/    # Instagram Graph API implementation
│       └── zalo/         # Zalo API implementation
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PROVIDER_CONTRACT.md
│   ├── AUTOMATION_ENGINE.md
│   ├── DESKTOP_ARCHITECTURE.md
│   ├── SECURITY_POLICY.md
│   └── I18N_GATE.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

## Dependency Rules

```
core --x--> nothing (zero deps on other SocialKit packages)
providers/* --> core
automation   --> core
analyzer     --> core
testing      --> core
cli          --> core + automation + providers + analyzer
desktop      --> automation + analyzer + ui          # không gọi providers trực tiếp
dashboard    --> core + analyzer + ui
playground   --> all packages
```

## Data Flow

```
desktop → automation → providers/* → core
         ↗
analyzer
```

Desktop không gọi provider API trực tiếp. Mọi orchestration qua automation. Cần gọi provider API? Viết method trong automation rồi expose ra.

## Forbidden Patterns

- core → bất kỳ SocialKit package nào khác
- providers/* → automation, analyzer
- analyzer → providers/*
- Apps (desktop, dashboard) chứa business logic chính

## Tech Stack

- **Runtime**: Node.js ES2022
- **Language**: TypeScript (strict mode)
- **Package manager**: pnpm (workspaces)
- **Build**: Turbo
- **Test**: Jest + ts-jest, nock for HTTP mocking
- **Shared test utils**: @socialkit/testing (MockSocialProvider, call tracking)
- **Design principle**: Provider-agnostic core, all platform logic in providers/
