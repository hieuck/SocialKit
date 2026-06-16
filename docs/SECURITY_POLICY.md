# Security Policy

## Token Handling

- Access tokens NEVER logged (console, files, network)
- `SocialProvider` exposes tokens only via `getAccessToken()` / `setAccessToken()`
- Desktop app stores tokens in OS keychain (not localStorage)
- CLI stores tokens in encrypted config file

## Authentication

- OAuth 2.0 for all providers
- No password-based auth
- Token refresh flows must be explicit (not automatic)

## Audit Rules

- No secrets in git (`.env`, `*.local`, credentials)
- All provider errors must be sanitized before user display
- Rate limit errors must not expose retry timing in production
