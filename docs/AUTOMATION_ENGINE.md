# Automation Engine

## Architecture

The automation package provides scheduled task execution on top of any SocialProvider.

```
AutomationEngine
  └── Scheduler        (cron + one-shot timers)
      └── AutoExecutor  (calls SocialProvider methods)
```

## Components

### Scheduler
- Pure task scheduler (no SocialKit dependencies)
- Supports one-shot (`runAt`) and cron-based (`cron`) tasks
- `onTaskDue` callback for task execution
- Status tracking: `pending` → `done` | `failed`

### AutomationEngine
- High-level API wrapping Scheduler
- Accepts a `SocialProvider` for token management
- Methods: `schedulePost`, `scheduleComment`, `scheduleLike`
- `setOnTaskDue` for custom execution (or use AutoExecutor)

### AutoExecutor
- Takes a `SocialProvider`
- Maps task types to provider methods:
  - `post` → `provider.publishPost(pageId, payload)`
  - `like` → `provider.likePost(postId)`
  - `comment` → `provider.replyToComment(postId, message)`
