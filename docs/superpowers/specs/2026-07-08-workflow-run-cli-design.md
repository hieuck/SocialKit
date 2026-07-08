# Design: `socialkit workflow run` CLI Command

## Goal

Add a CLI command that lets users execute a declarative workflow definition from a JSON file against a logged-in platform. This exposes the new `WorkflowEngine` to end users without requiring them to write TypeScript code.

## User Interface

```bash
socialkit workflow run <file> [--platform <platform>]
```

- `<file>` — path to a JSON workflow definition (required).
- `--platform <platform>` — optional override of the active platform. If omitted, the CLI uses the active session platform.

### Example

```bash
socialkit workflow run ./workflows/announce.json --platform facebook
```

### Output

On success:

```
Workflow announce-v1 completed.
  post1: post_123
  comment1: comment_456
```

On failure:

```
Workflow announce-v1 failed at step comment1: Post not found
```

## Workflow Definition Format

The JSON file must match the existing `WorkflowDefinition` type from `@socialkit/automation`.

```json
{
  "id": "announce-v1",
  "name": "Product Announcement",
  "initialContext": {
    "productName": "SocialKit"
  },
  "steps": [
    {
      "id": "post1",
      "action": "post",
      "inputs": {
        "pageId": "me",
        "message": "Introducing {{productName}}!"
      },
      "transitions": {
        "onSuccess": "comment1"
      }
    },
    {
      "id": "comment1",
      "action": "comment",
      "inputs": {
        "postId": "{{steps.post1.id}}",
        "message": "Thanks for the support!"
      }
    }
  ]
}
```

## Execution Flow

1. Parse CLI args to extract `file` and optional `platform`.
2. Resolve the provider for the selected platform using `ProviderRegistry` + `Session`.
3. Read the JSON file and validate it against a minimal schema (at least `id`, `name`, and `steps` array with `id` and `action` on each step).
4. Construct `WorkflowEngine(provider)` and call `execute(definition)`.
5. Render the execution result:
   - If `status === 'done'`, print step outputs.
   - If `status === 'failed'`, print the failing step id and error message.

## Error Handling

- Missing file → `Error: Workflow file not found: <path>`
- Invalid JSON → `Error: Invalid workflow JSON: <message>`
- Invalid workflow shape → `Error: Invalid workflow: <message>`
- No active platform and no `--platform` → `Error: Specify a platform with --platform or log in first.`
- Provider not available → `Error: Unknown platform: <platform>`
- Workflow execution failure → printed as failure output (not thrown)

## Files Changed

- `packages/cli/src/args.ts` — add `'workflow'` to `CliCommand` and parsing for `workflow run <file>`.
- `packages/cli/src/workflow.ts` — new module with `workflowCommand` and validation.
- `packages/cli/src/cli.ts` — wire `workflow` command into `Cli.run` and `help()`.
- `packages/cli/__tests__/workflow.test.ts` — new test suite.
- `packages/cli/__tests__/args.test.ts` — add workflow arg parsing tests.
- `packages/cli/__tests__/cli.test.ts` — integration tests for the CLI command.

## Testing Strategy

- Unit tests for `workflowCommand` using `MockSocialProvider`.
- Tests for missing file, invalid JSON, invalid shape, unknown platform.
- Tests for successful execution and failure handling.
- Integration tests through `Cli.run`.

## Dependencies

- `@socialkit/core` for `SocialProvider`.
- `@socialkit/automation` for `WorkflowEngine`, `WorkflowDefinition`, and `WorkflowExecution`.
- `@socialkit/testing` for `MockSocialProvider` (dev dependency).

## Out of Scope

- Scheduling workflows (`workflow schedule`) — follow-up feature.
- Built-in workflow templates — follow-up feature.
- Interactive workflow editing.
- YAML workflow definitions.
