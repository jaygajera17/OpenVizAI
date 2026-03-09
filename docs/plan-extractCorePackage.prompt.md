# Plan: OpenVizAI Server → `@openvizai/core` NPM Package Refactor

## TL;DR

Extract the AI visualization intelligence logic from the Express playground server into a standalone, zero-dependency-on-infrastructure npm package `@openvizai/core`. The core package exposes a single `analyzeChart()` function. The existing playground server becomes a thin consumer of this package. This requires untangling LLM logic from database/session/auth concerns, establishing clean type contracts, and restructuring the monorepo.

---

## Phase 0: Monorepo & Workspace Restructuring

**Goal:** Create the `packages/core` workspace and establish the build pipeline before moving any code.

1. **Create `packages/core/` directory structure:**
   ```
   packages/core/
     src/
       index.ts                     # Public API entry point
       analysis/
         analyzeChart.ts            # Main orchestrator function
         datasetSampler.ts          # Extract N sample rows
         schemaInspector.ts         # Infer column types from data
       agents/
         embeddingGeneratorAgent.ts # LLM call + structured output
       prompts/
         responseFormatterPrompt.ts # System prompt builder
       config/
         defaults.ts               # Default config values
         zodSchemas.ts             # Zod validation schemas
       types/
         index.ts                  # All exported types
         chart.ts                  # ChartType, ChartEmbedding, ChartMeta
         api.ts                    # AnalyzeChartInput, AnalyzeChartResult
         embedding.ts              # EmbeddingField, EmbeddingSchema
       utils/
         formatData.ts             # The formatData helper
         validation.ts             # Input validation logic
       errors/
         index.ts                  # Custom error classes
     package.json
     tsconfig.json
     README.md
   ```

2. **Create `packages/core/package.json`:**
   - Name: `@openvizai/core`
   - Version: `0.1.0`
   - Type: `module`
   - Exports: `./src/index.ts` (dev) and `./dist/index.js` (published)
   - Peer dependencies: `@langchain/openai`, `@langchain/core`, `zod`
   - Dev dependencies: `typescript`, `vitest` (for testing)
   - NO dependencies on: `pg`, `prisma`, `express`, `jsonwebtoken`, `winston`

3. **Create `packages/core/tsconfig.json`:**
   - Extend from `../../tsconfig.base.json`
   - Use `ESNext` module (not commonjs)
   - Output to `dist/`
   - Enable `declaration` and `declarationMap`

4. **Update `pnpm-workspace.yaml`** — already includes `packages/*`, no change needed.

5. **Update root `package.json`** — add build script: `"build:core": "cd packages/core && npm run build"`

---

## Phase 1: Define the Type Contract

**Goal:** Establish all public types that become the API contract between core, playground, and external consumers.

6. **Move `SUPPORTED_CHART_TYPES` and `ChartType`** — Already in `packages/shared-types/src/index.ts`. Keep as is, core will import from `@openvizai/shared-types`.

7. **Create `packages/core/src/types/embedding.ts`:**
   - Extract `EmbeddingFieldSchema`, `EmbeddingFieldTypeSchema`, `EmbeddingSchema` from current `apps/server/src/services/AI/config/zodSchema.ts`
   - Export both the Zod schemas AND inferred TypeScript types (`z.infer<>`)
   - Types to export: `EmbeddingField`, `EmbeddingFieldWithType`, `ChartEmbedding`

8. **Create `packages/core/src/types/chart.ts`:**
   - `ChartMeta` — `{ title: string; subtitle: string | null; query_explanation: string }`
   - `ChartResult` — `{ response_type: "graphical"; meta: ChartMeta; chart: { chart_type: ChartType; embedding: ChartEmbedding } }`
   - Re-export `ChartType` from `@openvizai/shared-types`

9. **Create `packages/core/src/types/api.ts`:**
   - `AnalyzeChartInput` — `{ prompt: string; data: Record<string, unknown>[]; config?: AnalyzeChartConfig }`
   - `AnalyzeChartConfig` — `{ apiKey?: string; model?: string; sampleRows?: number; maxRetries?: number; baseURL?: string }`
   - `AnalyzeChartResult` — `{ result: ChartResult; sampleUsed: Record<string, unknown>[] }`

10. **Create `packages/core/src/types/index.ts`** — barrel export all types.

---

## Phase 2: Extract Core Logic (No DB, No HTTP, No Auth)

**Goal:** Move the pure visualization intelligence functions into `packages/core/`.

11. **Create `packages/core/src/analysis/datasetSampler.ts`:**
    - Extract from current `prepareSampleData()` in `responseFormatter.ts`
    - Function: `sampleDataset(data: Record<string, unknown>[], sampleRows: number): Record<string, unknown>[]`
    - Takes full dataset, returns first N rows

12. **Create `packages/core/src/analysis/schemaInspector.ts`:**
    - New function: `inspectSchema(sample: Record<string, unknown>[]): SchemaInfo`
    - Returns: column names, inferred types (string/number/date/boolean), row count
    - This feeds into prompt context for better LLM decisions

13. **Create `packages/core/src/utils/formatData.ts`:**
    - Move `formatData()` from `apps/server/src/services/AI/agents/responseFormatter.ts`
    - Pure function, no dependencies

14. **Create `packages/core/src/config/zodSchemas.ts`:**
    - Move `responseFormatterSchema` from `apps/server/src/services/AI/config/zodSchema.ts`
    - Import `SUPPORTED_CHART_TYPES` from `@openvizai/shared-types`

15. **Create `packages/core/src/prompts/responseFormatterPrompt.ts`:**
    - Move `responseFormatter()` from `apps/server/src/services/AI/prompts/responseFormatterPrompt.ts`
    - Pure function: `(prompt: string, sampleData: any) => string`

16. **Create `packages/core/src/prompts/chartIdentifierPrompt.ts`:**
    - Move `chartIdentifierPrompt()` from `apps/server/src/services/AI/prompts/chartIdentifierPrompt.ts`
    - Pure function, no dependencies

17. **Create `packages/core/src/config/defaults.ts`:**
    - Default config values: `{ model: "gpt-4.1-nano-2025-04-14", sampleRows: 3}`

18. **Create `packages/core/src/agents/embeddingGeneratorAgent.ts`:**
    - Extract from `responseFormatterNode()` in `apps/server/src/services/AI/agents/responseFormatter.ts`
    - **CRITICAL CHANGE:** Remove ALL database calls (ChatHistoryService, SessionService, Pool)
    - **CRITICAL CHANGE:** Remove LangGraph dependency — use plain `ChatOpenAI.withStructuredOutput()` directly
    - **CRITICAL CHANGE:** Accept `apiKey` and `model` as parameters instead of reading from env
    - Function signature:
      ```
      generateEmbedding(options: {
        prompt: string;
        sampleData: { columns: string[]; rows: string[][] };
        config: ResolvedConfig;
        chatHistory?: BaseMessage[];  // optional for conversation context
      }): Promise<ChartResult>
      ```
    - Internally: creates `ChatOpenAI` instance, builds system message, calls `withStructuredOutput(responseFormatterSchema)`, returns parsed result

19. **Create `packages/core/src/analysis/analyzeChart.ts`** — the main entry point:
    - Function: `analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartResult>`
    - Pipeline:
      1. Validate input (data must be non-empty array of objects)
      2. Resolve config (merge user config with defaults)
      3. Sample dataset → `datasetSampler.ts`
      4. Format sample → `formatData.ts`
      5. Optionally inspect schema → `schemaInspector.ts`
      6. Call embedding generator → `embeddingGeneratorAgent.ts`
      7. Return `{ result, sampleUsed }`
    - Error handling: throw typed errors (`InvalidInputError`, `LLMError`)

20. **Create `packages/core/src/errors/index.ts`:**
    - `OpenVizAIError` (base class)
    - `InvalidInputError` — dataset validation failures
    - `LLMError` — API call failures, structured output parse failures
    - `ConfigError` — missing API key, invalid model

21. **Create `packages/core/src/index.ts`** — public API:
    - Export `analyzeChart`
    - Export all types from `types/`
    - Export error classes
    - Export `SUPPORTED_CHART_TYPES` (re-export from shared-types)
    - Do NOT export internal helpers (formatData, prompts, etc.)

---

## Phase 3: Remove LangGraph from Core

**Goal:** The core package should NOT depend on LangGraph. LangGraph is a playground concern (checkpointing, graph state).

22. **Why:** LangGraph brings in `@langchain/langgraph`, `@langchain/langgraph-checkpoint-postgres`, and `pg` — all infrastructure concerns. The core package needs only `@langchain/openai` for the LLM call and `@langchain/core` for message types.

23. **In `packages/core/`:** The agent uses `ChatOpenAI` directly (not wrapped in a LangGraph node). No `StateGraph`, no `PostgresSaver`, no `Pool`.

24. **In `apps/server/` (playground):** Remains free to use LangGraph for its chat history and checkpointing. The playground's `responseFormatterNode` will call `analyzeChart()` from `@openvizai/core` instead of containing the LLM logic directly.

---

## Phase 4: Refactor Playground Server to Consume `@openvizai/core`

**Goal:** Make the existing Express server a thin wrapper that imports from `@openvizai/core`.

25. **Update `apps/server/package.json`:**
    - Add workspace dependency: `"@openvizai/core": "workspace:*"`
    - Keep all current dependencies (express, pg, prisma, langchain, etc.) — these are playground deps

26. **Refactor `apps/server/src/services/AI/agents/responseFormatter.ts`:**
    - Import `analyzeChart` from `@openvizai/core`
    - Remove duplicated LLM invocation code
    - Keep: session management, chat history storage, LangGraph node structure
    - The node now:
      1. Ensures session exists
      2. Saves human message to chat history
      3. Calls `analyzeChart({ prompt, data, config: { apiKey: OPENAI_API_KEY } })`
      4. Saves AI message to chat history
      5. Returns state

27. **Delete from `apps/server/src/services/AI/`** (moved to core):
    - `config/zodSchema.ts` → import from `@openvizai/core` internals or re-export
    - `prompts/responseFormatterPrompt.ts` → now lives in core
    - `prompts/chartIdentifierPrompt.ts` → now lives in core
    - Keep: `config/constants.ts` (playground-specific limits)

28. **Update `apps/server/src/controllers/ai.controller.ts`:**
    - No structural change, still calls `createSampleLangGraph()`
    - But the graph internally uses `@openvizai/core`

---

## Phase 5: Shared Types Consolidation

**Goal:** Consolidate duplicate type definitions scattered across frontend, backend, and shared-types.

29. **`packages/shared-types/`** — keeps: `SUPPORTED_CHART_TYPES`, `ChartType`

30. **`packages/core/`** — exports: `ChartEmbedding`, `ChartMeta`, `ChartResult`, `AnalyzeChartInput`, `AnalyzeChartResult`, `EmbeddingField` (these are the canonical embedding types)

31. **Frontend (`apps/web/src/types/chat.ts`):**
    - Import `ChartResult`, `ChartEmbedding`, `ChartMeta` from `@openvizai/core` instead of defining locally
    - Keep frontend-only types (`Message`, `Session`, `SessionMessageResponse`)

32. **Frontend config files (`lineChartExamples.ts`, `barChartExamples.ts`, `pieChartExamples.ts`):**
    - Import `EmbeddingField` from `@openvizai/core` instead of local type definitions
    - These files still own their variant structures (they're frontend test data)

---

## Phase 6: Build, Test & Publish Pipeline

33. **Add `vitest` to `packages/core/`** — unit tests for:
    - `datasetSampler` — correct sampling, edge cases (empty array, 1 row, > sampleRows)
    - `formatData` — correct column/row extraction, null handling
    - `schemaInspector` — type inference accuracy
    - `validation` — input rejection for invalid data
    - `analyzeChart` — integration test with mocked LLM (mock `ChatOpenAI`)

34. **Add build script to `packages/core/package.json`:**
    - `"build": "tsc"`
    - `"test": "vitest run"`
    - `"prepublishOnly": "npm run build && npm test"`

35. **Configure `packages/core/package.json` for npm publish:**
    ```json
    {
      "name": "@openvizai/core",
      "version": "0.1.0",
      "type": "module",
      "main": "./dist/index.js",
      "types": "./dist/index.d.ts",
      "exports": {
        ".": {
          "types": "./dist/index.d.ts",
          "import": "./dist/index.js"
        }
      },
      "files": ["dist", "README.md", "LICENSE"],
      "engines": { "node": ">=18" },
      "peerDependencies": {
        "@langchain/openai": "^1.0.0",
        "@langchain/core": "^1.0.0"
      },
      "dependencies": {
        "zod": "^3.0.0",
        "@openvizai/shared-types": "workspace:*"
      }
    }
    ```

36. **Create `packages/core/README.md`** — usage documentation:
    - Installation
    - Quick start example
    - Configuration options
    - Type exports
    - Error handling guide

37. **Add `.npmignore` or `files` field** to ensure only `dist/`, `README.md`, and `LICENSE` are published.

---

## Phase 7: Documentation & Cleanup

38. **Update `docs/server-architecture.md`** — reflect new package structure

39. **Update root `README.md`** — add section about `@openvizai/core` package

40. **Remove stale files after migration:**
    - `apps/server/src/services/AI/prompts/` (if fully moved)
    - `apps/server/src/services/AI/config/zodSchema.ts` (if fully moved)

41. **Update `apps/server/tsconfig.json`:**
    - Add path alias for `@openvizai/core`
    - Or rely on pnpm workspace resolution

---

## Relevant Files

### Files to CREATE (in `packages/core/`)
- `packages/core/package.json` — package manifest
- `packages/core/tsconfig.json` — TS config extending base
- `packages/core/src/index.ts` — public barrel export
- `packages/core/src/analysis/analyzeChart.ts` — main entry point, orchestrates pipeline
- `packages/core/src/analysis/datasetSampler.ts` — extract from `prepareSampleData()` in responseFormatter.ts
- `packages/core/src/analysis/schemaInspector.ts` — new, infer column types
- `packages/core/src/agents/embeddingGeneratorAgent.ts` — extract LLM logic from responseFormatter.ts, remove DB deps
- `packages/core/src/prompts/responseFormatterPrompt.ts` — move from `apps/server/src/services/AI/prompts/responseFormatterPrompt.ts`
- `packages/core/src/prompts/chartIdentifierPrompt.ts` — move from `apps/server/src/services/AI/prompts/chartIdentifierPrompt.ts`
- `packages/core/src/config/zodSchemas.ts` — move from `apps/server/src/services/AI/config/zodSchema.ts`
- `packages/core/src/config/defaults.ts` — default configuration values
- `packages/core/src/types/index.ts` — barrel export types
- `packages/core/src/types/chart.ts` — ChartMeta, ChartResult
- `packages/core/src/types/api.ts` — AnalyzeChartInput, AnalyzeChartConfig, AnalyzeChartResult
- `packages/core/src/types/embedding.ts` — EmbeddingField, ChartEmbedding (inferred from Zod)
- `packages/core/src/utils/formatData.ts` — move from responseFormatter.ts
- `packages/core/src/utils/validation.ts` — input validation
- `packages/core/src/errors/index.ts` — custom error classes
- `packages/core/README.md` — usage docs

### Files to MODIFY
- `apps/server/src/services/AI/agents/responseFormatter.ts` — gut LLM logic, call `analyzeChart()` from core
- `apps/server/src/services/AI/graph/sampleLangGraph.ts` — simplify state, delegate to core
- `apps/server/package.json` — add `@openvizai/core` dependency
- `apps/web/src/types/chat.ts` — import types from `@openvizai/core`
- `root package.json` — add core build script
- `packages/shared-types/src/index.ts` — potentially export more shared types

### Files to DELETE (after migration)
- `apps/server/src/services/AI/config/zodSchema.ts` — moved to core
- `apps/server/src/services/AI/prompts/responseFormatterPrompt.ts` — moved to core
- `apps/server/src/services/AI/prompts/chartIdentifierPrompt.ts` — moved to core

### Reference files (patterns to reuse)
- `apps/server/src/services/AI/agents/responseFormatter.ts` — current `formatData()`, `prepareSampleData()`, LLM invocation pattern
- `apps/server/src/services/AI/config/zodSchema.ts` — `responseFormatterSchema` Zod schema
- `packages/shared-types/src/index.ts` — `SUPPORTED_CHART_TYPES` pattern
- `apps/web/src/config/lineChartExamples.ts` — embedding type structures as reference

---

## Verification

2. **Core builds cleanly:** `cd packages/core && pnpm build` — produces `dist/` with `.js` and `.d.ts` files
3. **Type exports work:** Create a test file that `import { analyzeChart, ChartResult, AnalyzeChartInput } from "@openvizai/core"` — no TS errors
4. **Playground still works E2E:** Start `pnpm dev`, login, submit prompt + data, verify chart renders correctly (same as before)
5. **No DB imports in core:** `grep -r "prisma\|Pool\|pg\|database" packages/core/src/` — returns nothing
6. **No Express imports in core:** `grep -r "express\|Request\|Response" packages/core/src/` — returns nothing
7. **No auth imports in core:** `grep -r "jwt\|token\|auth" packages/core/src/` — returns nothing
8. **Package can be consumed standalone:** Write a minimal Node.js script outside the monorepo that installs `@openvizai/core` and calls `analyzeChart()` successfully


---

## Decisions

- **LangGraph stays in playground only** — core uses plain `ChatOpenAI` for simplicity and fewer dependencies
- **`@langchain/openai` and `@langchain/core` are peer dependencies** — consumers must install them, keeping core lightweight
- **`zod` is a direct dependency** — needed for structured output validation, small footprint
- **`@openvizai/shared-types` stays separate** — it's the shared contract between core and frontend (just chart type constants)
- **No HTTP layer in core** — core exposes functions, not endpoints
- **Config is optional** — `apiKey` can come from config object OR `OPENAI_API_KEY` env var (fallback)
- **Chat history is playground's concern** — core's `analyzeChart()` optionally accepts `chatHistory` for multi-turn, but does not store it
- **ESM only for core** — `type: "module"`, modern Node.js targets

## Further Considerations

1. **Should `@openvizai/shared-types` be absorbed into `@openvizai/core`?** — Recommendation: Keep separate for now. The frontend needs `ChartType` without pulling in LangChain peer deps. If the types grow significantly, merge later.

2. **Should the core support providers beyond OpenAI?** — Recommendation: Start with OpenAI only (current state). Design the agent interface so swapping to Anthropic/Google later is a config change, not a rewrite. The `model` config field already supports this direction.

3. **Monorepo module format mismatch** — The server uses `commonjs` while core will use `ESM`. This works because pnpm workspaces handle resolution, and tsx (the dev runner) transpiles on the fly. For production, the server build step (`tsc && tsc-alias`) will handle interop. Flag for testing after Phase 4.
