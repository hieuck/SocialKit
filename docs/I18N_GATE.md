# I18N Gate Strategy

## Language Support

- **Primary**: Vietnamese (UI, docs, error messages)
- **Secondary**: English (technical interfaces, provider contracts)
- All user-facing strings go through i18n gate

## Implementation

- `@socialkit/core` exports string constants in Vietnamese
- Provider packages use English for internal constants (API endpoints, error codes)
- UI layer (desktop, dashboard, CLI) uses i18n library (TBD)

## Current Status

All package source code and docs: **Vietnamese** and **English**.
