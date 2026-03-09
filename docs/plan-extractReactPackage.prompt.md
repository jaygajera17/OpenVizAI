# Plan: OpenVizAI Frontend → `@openvizai/react` React Renderer Package

## TL;DR

Extract the chart rendering components, data transformation utilities, and ApexCharts integration from the playground web app into a standalone React package `@openvizai/react`. The package exports a single `<OpenVizRenderer />` component that takes embedding metadata + dataset and renders the correct chart. The existing playground app becomes a thin consumer. This requires separating rendering logic from authentication, session state, API calls, and playground UI concerns.

---

## Current Architecture Analysis

### What exists today (`apps/web/src/`)

**Chart rendering stack (EXTRACTABLE → `@openvizai/react`):**

- `components/ChartRenderer.tsx` — dispatcher: reads `chart_type`, routes to correct chart component
- `components/LineChart.tsx` — ApexCharts line/combo rendering, handles datetime, multi-axis, stacked, forecast
- `components/BarChart.tsx` — ApexCharts bar/column/range_bar, handles horizontal, stacked, is_range
- `components/PieChart.tsx` — ApexCharts pie/donut rendering
- `components/RadarChart.tsx` — ApexCharts radar rendering
- `utils/seriesBuilder.ts` — transforms raw data rows + embedding fields → ApexCharts series format
- `utils/chartData.ts` — type coercion helpers: `toFiniteNumber()`, `toCategoryString()`, `toMilliseconds()`
- `utils/apexBaseOptions.ts` — builds common ApexCharts options (title, subtitle, legend, toolbar)
- `context/chartContext.tsx` — provides `rows` state to chart components via React context

**Playground-only concerns (STAY in `apps/web/`):**

- `pages/Login.tsx` — email login form
- `pages/Home.tsx` — full page layout: topbar, sidebar, chart playground
- `components/Home/ChartPlayground.tsx` — prompt input, JSON data input, generates API call
- `components/Home/SessionSideBar.tsx` — session list with click-to-load
- `components/ProtectedRoute.tsx` — auth guard
- `router/AppRouter.tsx` — route definitions
- `providers/QueryProvider.tsx` — TanStack Query provider
- `services/apiService.ts` — generic HTTP client
- `services/auth/index.ts` — login, refresh, getCurrentUser
- `services/session/sessionService.ts` — fetch sessions, messages
- `hooks/auth/*` — useCurrentUser, useLoginWithEmail
- `hooks/session/*` — useSessions, useSessionMessages
- `hooks/ai/useGenerateAnswer.ts` — API mutation
- `constants/storage.ts`, `constants/queryKeys.ts` — local storage keys, query keys
- `utils/storage.ts` — localStorage helpers
- `types/chat.ts` — Message, Session types (playground-specific)
- `config/lineChartExamples.ts`, `config/barChartExamples.ts`, `config/pieChartExamples.ts`, `config/chartVariants.ts` — test data / demo fixtures
- `pages/Home.css` — playground styling
- `App.tsx`, `main.tsx` — app shell

### Key coupling point: `useChartState()` context

All four chart components currently call `useChartState()` to get `rows` (the dataset). This is the **single coupling point** between chart rendering and the playground. The package must receive `data` as a prop instead of pulling it from context.

### Type fragmentation

Embedding types are defined in THREE places:

1. `packages/core/src/types/embedding.ts` — canonical Zod-derived types (`ChartEmbedding`, `EmbeddingField`)
2. `apps/web/src/config/lineChartExamples.ts` — `EmbeddingAxisField`, `LineChartEmbedding` (local, slightly different shape)
3. `apps/web/src/config/barChartExamples.ts` — `BarChartEmbedding` (local, uses `is_range`, `start`/`end` as single objects not arrays)
4. `apps/web/src/config/pieChartExamples.ts` — `PieChartEmbedding` (local, uses `category`/`value` arrays)
5. `apps/web/src/types/chat.ts` — `ChartEmbedding` (local, loose `null | unknown` types)
6. `apps/web/src/hooks/ai/useGenerateAnswer.ts` — `ChartEmbedding` (duplicated inline)

The react package must use the canonical `ChartEmbedding` type from `@openvizai/core` (or `@openvizai/shared-types`) and accommodate both the strict Zod shape AND the looser shapes used by demo fixtures.

---

## Phase 0: Create `packages/react/` Workspace

**Goal:** Scaffold the package structure, build config, and dependencies.

1. **Create `packages/react/` directory structure:**

   ```
   packages/react/
     src/
       index.ts                          # Public API entry
       OpenVizRenderer.tsx               # Main component (dispatch by chart_type)
       charts/
         LineChart.tsx                    # Line/combo chart
         BarChart.tsx                     # Bar/column/range_bar chart
         PieChart.tsx                     # Pie/donut chart
         RadarChart.tsx                   # Radar chart
         index.ts                        # Barrel export
       charts/registry.ts                # Chart type → component registry
       embedding/
         seriesBuilder.ts                # Transform rows + embedding → ApexCharts series
         chartData.ts                    # Type coercion: toFiniteNumber, toCategoryString, toMilliseconds
         apexBaseOptions.ts              # Shared ApexCharts option builder
       types/
         index.ts                        # All public types
         renderer.ts                     # OpenVizRendererProps, OpenVizConfig
     package.json
     tsconfig.json
     README.md
   ```

2. **Create `packages/react/package.json`:**

   ```json
   {
     "name": "@openvizai/react",
     "version": "0.1.0",
     "private": true,
     "type": "module",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "exports": {
       ".": {
         "types": "./src/index.ts",
         "default": "./src/index.ts"
       }
     },
     "scripts": {
       "build": "tsc",
       "test": "vitest run"
     },
     "dependencies": {
       "@openvizai/shared-types": "workspace:*"
     },
     "peerDependencies": {
       "react": ">=18.0.0",
       "react-dom": ">=18.0.0",
       "apexcharts": ">=5.0.0",
       "react-apexcharts": ">=2.0.0"
     },
     "devDependencies": {
       "typescript": "^5.9.3",
       "vitest": "^3.2.3",
       "@types/react": "^19.2.7",
       "@types/react-dom": "^19.2.3",
       "react": "^19.2.0",
       "react-dom": "^19.2.0",
       "apexcharts": "^5.6.0",
       "react-apexcharts": "^2.0.1"
     }
   }
   ```

   **Dependency rationale:**
   - `react`, `react-dom` — peer deps, consumers bring their own React
   - `apexcharts`, `react-apexcharts` — peer deps, rendering engine
   - `@openvizai/shared-types` — workspace dep for `ChartType` constant and type
   - NO dependencies on: `@tanstack/react-query`, `react-router-dom`, `bootstrap`, `uuid`, `@langchain/*`, `zod`

3. **Create `packages/react/tsconfig.json`:**
   - Extend `../../tsconfig.base.json`
   - Add `"jsx": "react-jsx"`
   - Output to `dist/`
   - Enable `declaration` and `declarationMap`

4. **Update root `package.json`** — add: `"build:react": "cd packages/react && npm run build"`

---

## Phase 1: Define the Component Type Contract

**Goal:** Establish the public props interface for `<OpenVizRenderer />`.

5. **Create `packages/react/src/types/renderer.ts`:**

   ```ts
   import type { ChartType } from "@openvizai/shared-types";

   /** Field mapping from embedding metadata */
   export type EmbeddingField = {
     field: string;
     label: string;
     unit?: string | null;
     type?: string | null;
   };

   /** Full embedding metadata describing how to visualize the data */
   export type ChartEmbedding = {
     x?: EmbeddingField[] | null;
     y?: EmbeddingField[] | null;
     group?: EmbeddingField[] | null;
     category?: EmbeddingField[] | null;
     value?: EmbeddingField[] | null;
     source?: EmbeddingField[] | null;
     target?: EmbeddingField[] | null;
     start?: EmbeddingField | EmbeddingField[] | null;
     end?: EmbeddingField | EmbeddingField[] | null;
     series?: EmbeddingField[] | null;
     path?: EmbeddingField[] | null;
     is_stacked?: boolean;
     is_horizontal?: boolean;
     is_range?: boolean;
     is_donut?: boolean;
     isSemanticColors?: boolean;
     colorSemantic?: string | null;
     line_curve?: "smooth" | "straight" | "stepline";
     markers_size?: number;
     forecast_points?: number;
   };

   /** Chart metadata from the LLM response */
   export type ChartMeta = {
     title: string;
     subtitle?: string | null;
     query_explanation?: string | null;
   };

   /** Optional rendering configuration */
   export type OpenVizConfig = {
     height?: number;
     width?: string | number;
     legendPosition?: "top" | "bottom" | "left" | "right";
     dataLabelsEnabled?: boolean;
     toolbarVisible?: boolean;
     animations?: boolean;
   };

   /** Props for the main <OpenVizRenderer /> component */
   export type OpenVizRendererProps = {
     /** The dataset rows to visualize */
     data: Record<string, unknown>[];
     /** Chart type to render */
     chartType: ChartType;
     /** Embedding metadata describing field mappings */
     embedding: ChartEmbedding;
     /** Optional chart metadata (title, subtitle) */
     meta?: ChartMeta;
     /** Optional rendering config overrides */
     config?: OpenVizConfig;
     /** Optional CSS class name for the wrapper */
     className?: string;
   };
   ```

   **Design decisions for this type:**
   - `start`/`end` accept BOTH `EmbeddingField` (single object, used by bar chart examples) AND `EmbeddingField[]` (array, used by Zod schema from core). The rendering code normalizes this internally.
   - All embedding fields are optional with fallback to `null` — the renderer only reads what's relevant for each chart type.
   - `ChartEmbedding` here is a **rendering-focused superset** that accepts both the strict `@openvizai/core` output AND the looser shapes from demo fixtures. It does NOT import from `@openvizai/core` to avoid pulling in Zod/LangChain peer deps into the React package.
   - `OpenVizConfig` provides rendering overrides without affecting the embedding contract.

6. **Create `packages/react/src/types/index.ts`** — barrel export all types:
   ```ts
   export type {
     EmbeddingField,
     ChartEmbedding,
     ChartMeta,
     OpenVizConfig,
     OpenVizRendererProps,
   } from "./renderer";
   ```

---

## Phase 2: Extract Chart Components

**Goal:** Move chart rendering components into the package, removing the `useChartState()` context dependency.

### Critical change: `data` as prop, not context

Every chart component currently calls `const { rows } = useChartState()` to get the dataset. In the package, `data` (rows) is passed as a prop from `<OpenVizRenderer />` down to each chart. No React context needed.

7. **Create `packages/react/src/embedding/chartData.ts`:**
   - Move from `apps/web/src/utils/chartData.ts` (verbatim — pure functions, no deps)
   - Exports: `toFiniteNumber()`, `toCategoryString()`, `toMilliseconds()`

8. **Create `packages/react/src/embedding/seriesBuilder.ts`:**
   - Move from `apps/web/src/utils/seriesBuilder.ts`
   - Same exports: `buildCategorySeriesLabels()`, `buildNumericSeries()`, `buildNumericDataByField()`, `buildSingleValueSeries()`, `buildDatetimePoints()`, `buildRangeBarPoints()`
   - Import from local `./chartData` instead of `../utils/chartData`

9. **Create `packages/react/src/embedding/apexBaseOptions.ts`:**
   - Move from `apps/web/src/utils/apexBaseOptions.ts`
   - Same `buildApexBaseOptions()` function

10. **Create `packages/react/src/charts/LineChart.tsx`:**
    - Move from `apps/web/src/components/LineChart.tsx`
    - **CRITICAL CHANGE:** Remove `useChartState()` import — receive `data` and `embedding` and `meta` as props
    - **CRITICAL CHANGE:** Remove dependency on `LineChartVariant` type — use `OpenVizRendererProps` fields
    - Props: `{ data, embedding, meta, config }`
    - Internal logic stays the same: read `embedding.x`, `embedding.y`, build series, render `<Chart type="line" />`

11. **Create `packages/react/src/charts/BarChart.tsx`:**
    - Move from `apps/web/src/components/BarChart.tsx`
    - **CRITICAL CHANGE:** Remove `useChartState()` — receive `data`, `embedding`, `meta`, `chartType`, `config` as props
    - **CRITICAL CHANGE:** Remove `BarChartVariant` type dependency
    - Handle `start`/`end` being either a single `EmbeddingField` or `EmbeddingField[]` — normalize by picking first element of array or using as-is if single object

12. **Create `packages/react/src/charts/PieChart.tsx`:**
    - Move from `apps/web/src/components/PieChart.tsx`
    - Same pattern: props instead of context, remove `PieChartVariant` dependency
    - Read `embedding.category[0]`, `embedding.value[0]`

13. **Create `packages/react/src/charts/RadarChart.tsx`:**
    - Move from `apps/web/src/components/RadarChart.tsx`
    - Same pattern

14. **Create `packages/react/src/charts/index.ts`** — barrel export:
    ```ts
    export { default as LineChart } from "./LineChart";
    export { default as BarChart } from "./BarChart";
    export { default as PieChart } from "./PieChart";
    export { default as RadarChart } from "./RadarChart";
    ```

---

## Phase 3: Chart Registry & Main Component

**Goal:** Build the dispatch layer and the public `<OpenVizRenderer />` component.

15. **Create `packages/react/src/charts/registry.ts`:**

    ```ts
    import type { ComponentType } from "react";
    import type { ChartType } from "@openvizai/shared-types";
    import type { ChartComponentProps } from "./types";

    import LineChart from "./LineChart";
    import BarChart from "./BarChart";
    import PieChart from "./PieChart";
    import RadarChart from "./RadarChart";

    type ChartRegistry = Record<string, ComponentType<ChartComponentProps>>;

    const defaultRegistry: ChartRegistry = {
      line: LineChart,
      bar: BarChart,
      range_bar: BarChart,
      pie: PieChart,
      donut: PieChart,
      radar: RadarChart,
    };

    let registry: ChartRegistry = { ...defaultRegistry };

    /** Register a custom chart component for a chart type */
    export function registerChart(
      chartType: string,
      component: ComponentType<ChartComponentProps>,
    ): void {
      registry[chartType] = component;
    }

    /** Get the component for a chart type. Returns undefined if not registered. */
    export function getChartComponent(
      chartType: string,
    ): ComponentType<ChartComponentProps> | undefined {
      return registry[chartType];
    }

    /** Reset registry to defaults (useful for testing) */
    export function resetChartRegistry(): void {
      registry = { ...defaultRegistry };
    }
    ```

    **Why a registry:**
    - Contributors can add new chart types (heatmap, treemap, scatter) without modifying core components
    - `registerChart("heatmap", HeatmapChart)` — no fork needed
    - The default registry ships all current chart types built-in
    - The current `ChartRenderer` already uses if/else dispatch by `chart_type` — the registry formalizes this pattern

16. **Internal chart component props type:**

    ```ts
    // In packages/react/src/charts/types.ts
    export type ChartComponentProps = {
      data: Record<string, unknown>[];
      chartType: ChartType;
      embedding: ChartEmbedding;
      meta?: ChartMeta;
      config?: OpenVizConfig;
    };
    ```

17. **Create `packages/react/src/OpenVizRenderer.tsx`:**

    ```tsx
    import { getChartComponent } from "./charts/registry";
    import type { OpenVizRendererProps } from "./types/renderer";

    export default function OpenVizRenderer({
      data,
      chartType,
      embedding,
      meta,
      config,
      className,
    }: OpenVizRendererProps) {
      const ChartComponent = getChartComponent(chartType);

      if (!ChartComponent) {
        return null;
      }

      return (
        <div className={className}>
          <ChartComponent
            data={data}
            chartType={chartType}
            embedding={embedding}
            meta={meta}
            config={config}
          />
        </div>
      );
    }
    ```

    **Simple and focused:** no auth, no context providers, no state. Just: look up the chart component by type, pass props, render.

18. **Create `packages/react/src/index.ts`** — public API:

    ```ts
    // Main component
    export { default as OpenVizRenderer } from "./OpenVizRenderer";

    // Chart registry (for plugin system)
    export {
      registerChart,
      getChartComponent,
      resetChartRegistry,
    } from "./charts/registry";

    // Individual chart components (for advanced usage)
    export { LineChart, BarChart, PieChart, RadarChart } from "./charts";

    // Types
    export type {
      EmbeddingField,
      ChartEmbedding,
      ChartMeta,
      OpenVizConfig,
      OpenVizRendererProps,
    } from "./types";

    // Re-export chart type constants
    export { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";
    export type { ChartType } from "@openvizai/shared-types";
    ```

---

## Phase 4: Refactor Playground to Consume `@openvizai/react`

**Goal:** The playground web app imports `<OpenVizRenderer />` instead of owning chart components.

19. **Update `apps/web/package.json`:**
    - Add workspace dependency: `"@openvizai/react": "workspace:*"`

20. **Update `apps/web/vite.config.ts`:**
    - Add alias for `@openvizai/react` pointing to `../../packages/react/src` (for dev HMR)

21. **Refactor `apps/web/src/components/Home/ChartPlayground.tsx`:**
    - Replace:
      ```tsx
      import ChartRenderer from "../../components/ChartRenderer";
      // ...
      <ChartRenderer variant={{ id, label, result } as any} />;
      ```
    - With:
      ```tsx
      import { OpenVizRenderer } from "@openvizai/react";
      // ...
      <OpenVizRenderer
        data={rows}
        chartType={chartResult.chart.chart_type}
        embedding={chartResult.chart.embedding}
        meta={chartResult.meta}
      />;
      ```
    - No more `variant` wrapping, no `as any` cast — clean props

22. **Update playground's `chartContext.tsx`:**
    - Keep `rows`, `prompt`, `dataInput`, `chartResult` state
    - But `rows` is no longer consumed by chart components via context — only passed as `data` prop to `<OpenVizRenderer />`
    - The context still serves the playground's form state management (prompt input, data input)

23. **Delete from `apps/web/src/` after migration:**
    - `components/ChartRenderer.tsx` — replaced by `<OpenVizRenderer />`
    - `components/LineChart.tsx` — moved to package
    - `components/BarChart.tsx` — moved to package
    - `components/PieChart.tsx` — moved to package
    - `components/RadarChart.tsx` — moved to package
    - `utils/seriesBuilder.ts` — moved to package
    - `utils/chartData.ts` — moved to package
    - `utils/apexBaseOptions.ts` — moved to package

24. **Keep in `apps/web/src/` (playground-only):**
    - `config/lineChartExamples.ts`, `config/barChartExamples.ts`, `config/pieChartExamples.ts`, `config/chartVariants.ts` — these are demo fixtures. They may need minor type adjustments to use `ChartEmbedding` from `@openvizai/react`, or they can stay with loose local types since the renderer accepts flexible input.
    - ALL auth, session, API, routing, page components — untouched

---

## Phase 5: Type Alignment

**Goal:** Ensure type compatibility between `@openvizai/core` (LLM output), `@openvizai/react` (rendering input), and playground demo fixtures.

25. **`@openvizai/core` exports `ChartResult`:**

    ```ts
    {
      response_type: "graphical";
      meta: {
        title: string;
        subtitle: string | null;
        query_explanation: string;
      }
      chart: {
        chart_type: ChartType;
        embedding: ChartEmbedding;
      }
    }
    ```

    Where `ChartEmbedding` has `x: EmbeddingField[] | null`, etc. — arrays for all fields, Zod-strict.

26. **`@openvizai/react` accepts `OpenVizRendererProps`:**

    ```ts
    {
      data: Record<string, unknown>[];
      chartType: ChartType;
      embedding: ChartEmbedding;   // flexible: fields optional, start/end single or array
      meta?: ChartMeta;
    }
    ```

27. **Mapping from `@openvizai/core` output to `@openvizai/react` props is straightforward:**

    ```ts
    import { analyzeChart } from "@openvizai/core";
    import { OpenVizRenderer } from "@openvizai/react";

    const { result } = await analyzeChart({ prompt, data, config });

    <OpenVizRenderer
      data={data}
      chartType={result.chart.chart_type}
      embedding={result.chart.embedding}
      meta={result.meta}
    />
    ```

    Core's `ChartEmbedding` (strict Zod-derived) is assignable to react's `ChartEmbedding` (loose superset) without explicit casting.

28. **Demo fixture types (`lineChartExamples.ts`, etc.):**
    - These have slightly different shapes (e.g., `start: EmbeddingField` instead of `start: EmbeddingField[] | null`).
    - The react package's `ChartEmbedding` accepts both shapes via union type on `start`/`end`.
    - The fixture types can optionally be updated to import `EmbeddingField` from `@openvizai/react` to reduce duplication, but this is not required for the package to work.

---

## Phase 6: Build & Test Pipeline

29. **Add `vitest` to `packages/react/`** — unit tests for:
    - `chartData` — `toFiniteNumber()`, `toCategoryString()`, `toMilliseconds()` edge cases
    - `seriesBuilder` — series construction with various embedding shapes
    - `registry` — `registerChart()`, `getChartComponent()`, custom chart registration
    - `OpenVizRenderer` — renders correct chart component for each chart type (shallow render with mocked charts)

30. **Build script in `packages/react/package.json`:**

    ```json
    "scripts": {
      "build": "tsc",
      "test": "vitest run"
    }
    ```

31. **Package publishing config (for future — NOT now):**
    ```json
    {
      "main": "./dist/index.js",
      "types": "./dist/index.d.ts",
      "exports": {
        ".": {
          "types": "./dist/index.d.ts",
          "import": "./dist/index.js"
        }
      },
      "files": ["dist", "README.md", "LICENSE"],
      "engines": { "node": ">=18" }
    }
    ```

---

## Relevant Files

### Files to CREATE (in `packages/react/`)

- `packages/react/package.json`
- `packages/react/tsconfig.json`
- `packages/react/src/index.ts` — public barrel export
- `packages/react/src/OpenVizRenderer.tsx` — main component
- `packages/react/src/charts/LineChart.tsx` — extract from `apps/web/src/components/LineChart.tsx`, remove context
- `packages/react/src/charts/BarChart.tsx` — extract from `apps/web/src/components/BarChart.tsx`, remove context
- `packages/react/src/charts/PieChart.tsx` — extract from `apps/web/src/components/PieChart.tsx`, remove context
- `packages/react/src/charts/RadarChart.tsx` — extract from `apps/web/src/components/RadarChart.tsx`, remove context
- `packages/react/src/charts/registry.ts` — chart type → component registry + `registerChart()`
- `packages/react/src/charts/types.ts` — internal `ChartComponentProps`
- `packages/react/src/charts/index.ts` — barrel export
- `packages/react/src/embedding/seriesBuilder.ts` — move from `apps/web/src/utils/seriesBuilder.ts`
- `packages/react/src/embedding/chartData.ts` — move from `apps/web/src/utils/chartData.ts`
- `packages/react/src/embedding/apexBaseOptions.ts` — move from `apps/web/src/utils/apexBaseOptions.ts`
- `packages/react/src/types/index.ts` — barrel export types
- `packages/react/src/types/renderer.ts` — `OpenVizRendererProps`, `OpenVizConfig`, `ChartEmbedding`, `ChartMeta`, `EmbeddingField`
- `packages/react/README.md` — usage docs

### Files to MODIFY

- `apps/web/src/components/Home/ChartPlayground.tsx` — replace `<ChartRenderer>` with `<OpenVizRenderer>`
- `apps/web/package.json` — add `@openvizai/react` workspace dependency
- `apps/web/vite.config.ts` — add alias for `@openvizai/react`
- `apps/web/tsconfig.app.json` — add path for `@openvizai/react`
- `root package.json` — add `build:react` script

### Files to DELETE (after migration)

- `apps/web/src/components/ChartRenderer.tsx` — replaced by `<OpenVizRenderer />`
- `apps/web/src/components/LineChart.tsx` — moved to package
- `apps/web/src/components/BarChart.tsx` — moved to package
- `apps/web/src/components/PieChart.tsx` — moved to package
- `apps/web/src/components/RadarChart.tsx` — moved to package
- `apps/web/src/utils/seriesBuilder.ts` — moved to package
- `apps/web/src/utils/chartData.ts` — moved to package
- `apps/web/src/utils/apexBaseOptions.ts` — moved to package

### Files that STAY (playground-only)

- `apps/web/src/components/Home/ChartPlayground.tsx` (modified)
- `apps/web/src/components/Home/SessionSideBar.tsx`
- `apps/web/src/components/ProtectedRoute.tsx`
- `apps/web/src/context/chartContext.tsx`
- `apps/web/src/pages/Login.tsx`
- `apps/web/src/pages/Home.tsx`
- `apps/web/src/pages/Home.css`
- `apps/web/src/router/AppRouter.tsx`
- `apps/web/src/providers/QueryProvider.tsx`
- `apps/web/src/services/*`
- `apps/web/src/hooks/*`
- `apps/web/src/constants/*`
- `apps/web/src/utils/storage.ts`
- `apps/web/src/types/chat.ts`
- `apps/web/src/config/*` (demo fixtures)

---

## Verification

1. **Package builds cleanly:** `cd packages/react && pnpm build` — produces `dist/` with `.js`, `.d.ts`, and `.jsx` files
2. **Type exports work:** A test file with `import { OpenVizRenderer, ChartEmbedding, OpenVizRendererProps } from "@openvizai/react"` compiles without errors
3. **Playground still works E2E:** `pnpm dev`, login, submit prompt + data, verify chart renders correctly (identical output as before)
4. **No auth imports in package:** `grep -r "auth\|login\|token\|jwt" packages/react/src/` — returns nothing
5. **No API imports in package:** `grep -r "apiService\|fetch\|XMLHttp\|tanstack\|react-query" packages/react/src/` — returns nothing
6. **No session imports in package:** `grep -r "session\|localStorage\|storage" packages/react/src/` — returns nothing
7. **No routing in package:** `grep -r "react-router\|useNavigate\|BrowserRouter" packages/react/src/` — returns nothing
8. **Core → React integration works:** Passing `result.chart.embedding` from `@openvizai/core` output directly into `<OpenVizRenderer embedding={...} />` works without type errors
9. **Custom chart registration works:** `registerChart("scatter", ScatterChart)` followed by `<OpenVizRenderer chartType="scatter" ... />` renders the custom component

---

## Decisions

- **ApexCharts is a peer dependency, not bundled** — consumers install their preferred version. The package wraps `react-apexcharts` but doesn't vendor it.
- **`@openvizai/react` does NOT depend on `@openvizai/core`** — it depends only on `@openvizai/shared-types` (for `ChartType` constant). This means frontend consumers can use the renderer without installing LangChain/Zod/OpenAI. The type contract is purely structural.
- **`ChartEmbedding` is defined locally in the react package (not imported from core)** — core's `ChartEmbedding` requires `zod` as a transitive dependency. The react package defines its own rendering-focused `ChartEmbedding` that is a structural superset — core's output is assignable to it by type compatibility, not import.
- **Plugin registry pattern is simple** — just a `Record<string, ComponentType>`. No plugin loader, no dynamic imports, no webpack federation. `registerChart()` is synchronous. This is sufficient for the current chart type set and allows easy extension.
- **No React context in the package** — data flows via props only. The playground's `ChartContext` is a playground concern, not the renderer's.
- **ESM only** — `"type": "module"` in package.json, modern bundler consumers (Vite, Next.js, Webpack 5+)
- **No CSS bundled in package** — chart styling comes from ApexCharts. The wrapper `<div className={className}>` accepts user-provided class for positioning. No Bootstrap or playground CSS leaks into the package.
- **`private: true` for now** — not publishing to npm yet, consumed via pnpm workspace only

## Further Considerations

1. **Should we support chart libraries beyond ApexCharts?** — Not now. The current architecture renders exclusively via `react-apexcharts`. The registry pattern would allow adding a `chartLibrary` config option in the future (`"apex" | "recharts" | "d3"`), but that's a significant expansion. Start with ApexCharts only.

2. **Should `OpenVizRenderer` handle loading/error states?** — No. The renderer is a pure rendering component. Loading spinners, error boundaries, and retry logic are the consumer's responsibility. The renderer either renders a chart or returns `null`.

3. **Should config example files move to the package?** — No. The `lineChartExamples.ts`, `barChartExamples.ts`, etc. are playground demo data. They could be published separately as `@openvizai/examples` later, or included in the README as usage examples. They don't belong in the rendering library.

4. **What about SSR (Next.js)?** — ApexCharts uses `window`/DOM APIs and doesn't support SSR natively. The package should add a `"use client"` directive at the top of `OpenVizRenderer.tsx` for Next.js App Router compatibility. Dynamic imports with `ssr: false` will be documented in the README.
