**LLM Configuration**

- **Environment variable**: `CLAUDE_MODEL`
- **Recommended value**: `claude-sonnet-4.5`

This project reads the model selection from `process.env.CLAUDE_MODEL` via the helper at `lib/llm/config.ts`.

Usage example (server code):

```ts
import { getClaudeModel } from '@/lib/llm/config'

const model = getClaudeModel()
// use `model` when constructing requests to your LLM provider
```

Set the env var in your deployment platform or in a local `.env` file (see `.env.example`).
