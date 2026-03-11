# OpenVizAI – Project Information for AI Coding Assistants

This document explains the purpose, architecture, and development philosophy of the OpenVizAI project.  
AI coding assistants should read this file to understand the intent behind the codebase.

---

# Project Overview

OpenVizAI is an AI-assisted chart visualization system designed to automatically determine the most suitable chart for a given dataset.

Users provide:

- A dataset (JSON or CSV)
- A prompt describing the desired visualization

Example:

User input:

Dataset (JSON):
[
  { "month": "Jan", "revenue": 12000, "profit": 4000 },
  { "month": "Feb", "revenue": 13500, "profit": 5300 }
]

Prompt:
"Plot a suitable chart for this data"

The system automatically:

1. Determines the best chart type
2. Generates chart metadata
3. Renders the chart using a visualization library

---

# Core Problem This Project Solves

Large language models are not efficient at transforming large datasets into chart structures.

Typical problems when using LLMs directly:

- Context window overflow when passing large datasets
- High token usage
- Poor reliability for deterministic transformations
- Slow performance
- Hallucinated structures

For example, if we send 1000 rows of JSON to an LLM and ask it to generate chart data structures, the model wastes tokens and performs work that deterministic code should handle.

LLMs should be used for **decision making**, not **data transformation**.

---

# Key Idea

Instead of sending the full dataset to the LLM, we send only a **small sample of rows (2–3 rows)**.

The LLM is asked to determine:

- Chart type (bar, line, pie, etc.)
- X-axis field
- Y-axis field
- Series fields
- Categories
- Chart title
- Units
- Additional metadata

Example LLM output:

{
  "chart_type": "bar",
  "embedding": {
    "x": [{ "field": "month", "label": "Month" }],
    "y": [{ "field": "revenue", "label": "Revenue" }]
  }
}

This metadata describes **how the data should be visualized**, but does not contain the full transformed dataset.

---

# Deterministic Data Transformation

After the LLM provides the metadata:

JavaScript functions (called **embedding functions**) process the entire dataset.

These functions:

- Iterate through the dataset
- Extract fields defined by the embedding metadata
- Construct chart-compatible data structures
- Handle different data types (string, number, date)

Example:

LLM output:

x field = "month"  
y field = "revenue"

Embedding function transforms:

[
  { "month": "Jan", "revenue": 12000 },
  { "month": "Feb", "revenue": 13500 }
]

into chart format:

categories = ["Jan", "Feb"]
series = [12000, 13500]

---

# Architecture

OpenVizAI uses a multi-stage pipeline:

1. **User Input**

Prompt + dataset sent from frontend to backend.


2. **Response Formatter Agent (LLM)**

Generates chart embedding metadata describing how to map dataset fields.

3. **Frontend Chart Renderer**

Receives metadata and dataset.

4. **Embedding Functions**

JavaScript functions map the full dataset to chart-compatible structures.

5. **Chart Rendering**

Charts are rendered using ApexCharts.

---

# Design Principles

AI assistants should follow these principles when generating code for this project.

### 1. LLMs should only make decisions

LLMs determine:

- chart type
- axis fields
- metadata

LLMs should NOT transform full datasets.

---

### 2. Deterministic code handles data processing

All heavy data transformation should be implemented using JavaScript functions.

---

### 3. Token efficiency is important

The system should minimize token usage by:

- sending only small samples of data to the LLM
- avoiding full dataset transmission

---

### 4. Chart rendering must remain deterministic

The frontend chart renderer should rely only on:

- embedding metadata
- original dataset

---

# Use Cases

### 1. Interactive Dashboard

Users can:

- upload CSV or JSON
- write prompts
- automatically generate charts

### 2. Visualization Engine for Other Systems

OpenVizAI can act as a visualization layer for systems such as:

- Text-to-SQL tools
- Analytics platforms
- AI copilots
- Data exploration dashboards

Example workflow:

Text-to-SQL → query result JSON → OpenVizAI → chart visualization

---

# Project Vision

OpenVizAI aims to demonstrate how LLMs can be used efficiently for data visualization by:

- minimizing token usage
- separating decision logic from transformation logic
- keeping rendering deterministic

The goal is to create a reusable visualization intelligence engine that can integrate with existing systems.

---

# Current Implementation

Current prototype includes:

- Monorepo structure
- Backend AI agents for chart identification and metadata generation
- Frontend React application with bootstrap 
- ApexCharts renderer
- Embedding functions for chart data transformation

The prototype demonstrates chart generation from user prompt + dataset.

---

# Important Notes for AI Coding Assistants

When generating code for this project:

- prioritize deterministic data processing
- avoid sending large datasets to LLMs
- follow the embedding metadata pattern
- keep chart rendering modular and reusable