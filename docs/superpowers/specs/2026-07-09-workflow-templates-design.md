# Design: Built-in Workflow Templates

## Goal

Add a small set of built-in workflow templates to `@socialkit/cli` so users can run common multi-step workflows without writing JSON from scratch.

## User Interface

```bash
# List available templates
socialkit workflow template list

# Show a template as JSON
socialkit workflow template show <name>

# Run a template directly against the active platform
socialkit workflow template run <name> [--platform <platform>]
```

### Examples

```bash
socialkit workflow template list
socialkit workflow template show announce
socialkit workflow template run cross-post --platform facebook
```

### Output

`template list`:

```
Available workflow templates:
  announce         Post a message and reply with a thank-you comment
  cross-post       Post the same message to multiple pages
  welcome-comment  Like and comment on a post
```

`template show announce`:

```json
{
  "id": "announce",
  "name": "Product Announcement",
  "steps": [...]
}
```

`template run announce`:

```
Workflow announce completed.
  post1: post_123
  comment1: comment_456
```

## Template Storage

Templates live in `packages/cli/src/templates/` as plain TypeScript modules that export `WorkflowDefinition` objects. A `templates/index.ts` barrel file collects them by name.

Example file:

```typescript
import type { WorkflowDefinition } from '@socialkit/automation'

export const announceTemplate: WorkflowDefinition = {
  id: 'announce',
  name: 'Product Announcement',
  steps: [
    {
      id: 'post1',
      action: 'post',
      inputs: { pageId: 'me', message: 'Hello from SocialKit!' },
      transitions: { onSuccess: 'comment1' },
    },
    {
      id: 'comment1',
      action: 'comment',
      inputs: { postId: '{{steps.post1.id}}', message: 'Thanks for your support!' },
    },
  ],
}
```

## Files Changed

- `packages/cli/src/templates/announce.ts` — announce template
- `packages/cli/src/templates/cross-post.ts` — cross-post template
- `packages/cli/src/templates/welcome-comment.ts` — welcome-comment template
- `packages/cli/src/templates/index.ts` — barrel registry
- `packages/cli/src/workflow.ts` — add `templateCommand` for list/show/run
- `packages/cli/src/args.ts` — parse `workflow template list/show/run <name>`
- `packages/cli/src/cli.ts` — wire template subcommand and update help
- `packages/cli/__tests__/templates.test.ts` — unit tests
- `packages/cli/__tests__/args.test.ts` — arg parsing tests
- `packages/cli/__tests__/cli.test.ts` — integration tests

## Error Handling

- Unknown template name → `Error: Unknown template: <name>`
- Missing name for show/run → `Usage: workflow template show <name>` / `Usage: workflow template run <name> [--platform <platform>]`
- No active platform and no `--platform` → `Error: Specify a platform with --platform or log in first.`
- Unknown platform → `Error: Unknown platform: <platform>`

## Testing Strategy

- Unit tests for `templateCommand` with `MockSocialProvider`.
- Tests for list, show, run, and unknown template errors.
- Integration tests through `Cli.run`.

## Out of Scope

- User-defined templates stored on disk.
- Template variables/interactive prompts (templates are static for now).
- Template editing or creation via CLI.
