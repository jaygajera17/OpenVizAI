# @openvizai/shared-types

Shared TypeScript contracts and constants for OpenVizAI packages.

This package provides the canonical chart type constants used across backend prompts, validation schemas, and frontend rendering.

## Install

```bash
npm install @openvizai/shared-types
```

## Usage

```ts
import { SUPPORTED_CHART_TYPES } from "@openvizai/shared-types";
import type { ChartType } from "@openvizai/shared-types";
```

## Why this package exists

- Prevents chart type drift between packages
- Keeps core and react contracts aligned
- Improves type safety across package boundaries

For full context, see:
https://github.com/OpenVizAI/OpenVizAI
