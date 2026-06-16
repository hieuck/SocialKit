# Desktop App Architecture

## Structure

```
apps/desktop/
├── src/
│   ├── main/           # Electron main process
│   │   ├── index.ts
│   │   ├── ipc/        # IPC handlers
│   │   └── window.ts
│   ├── renderer/       # UI layer
│   │   ├── App.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   └── store/      # State management
│   ├── bridge/         # SocialKit bridge (calls packages)
│   │   ├── provider-manager.ts
│   │   ├── workflow-runner.ts
│   │   └── auth-store.ts
│   └── config/
└── package.json
```

## Design Rules

- No business logic in desktop/ — only UI orchestration
- All logic lives in packages (core, automation, providers)
- Desktop bridges packages via dependency injection
- Auth config stored securely (OS keychain)
