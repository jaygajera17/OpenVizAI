<div align="center">

# 🧠 OpenVizAI
### *Turn any data into the right chart — intelligently, instantly.*

**The missing intelligence layer between your data pipeline and your visualization.**
Prompt in. Beautiful chart out. Under 3,000 tokens. Every time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Charts: ApexCharts](https://img.shields.io/badge/Charts-ApexCharts-blue.svg)](https://apexcharts.com/)
[![Status: Active](https://img.shields.io/badge/Status-Active%20Development-orange.svg)]()

</div>

---

## ✨ The Problem It Solves

You're building a **Text-to-SQL tool**. Or a data dashboard. Or an analytics pipeline.

You've solved the hard part — the query runs, the data comes back. But now you're stuck:

> *"The user's prompt could be anything. The result schema could be anything. How do I know which chart to render — and how to configure it correctly?"*

You could hardcode logic. You could ask users to pick a chart type. Or you could just let **OpenVizAI** figure it out.

Pass in your data + a prompt. Get back a fully configured, rendered chart. No assumptions. No manual mapping. No wasted tokens.

---

## 🎯 Who Is This For

**OpenVizAI is the go-to connector for:**

- 🏗️ **Text-to-SQL builders** — Your pipeline produces result sets. OpenVizAI turns them into the right visualization, automatically.
- 📊 **Dashboard & BI developers** — Stop hardcoding chart types. Let the AI infer the best visual for any dataset shape.
- 🔬 **Data app developers** — Users upload unknown data? OpenVizAI handles the visualization intelligence so you don't have to.
- 🤖 **AI application builders** — Add a powerful, prompt-driven charting layer to any LLM-powered product.

> **OpenVizAI is not a "chat with your data" tool.** It's a focused, single-purpose engine: *given data and intent, produce the correct chart.* That constraint is what makes it fast, cheap, and embeddable.

---

## 🚀 Core Capabilities

- **🤖 LLM-Powered Chart Intelligence** — Understands your data structure and user intent to select and configure the right chart automatically
- **📊 Supported Chart Types** *(via ApexCharts)*
  - Bar Chart
  - Line Chart
  - Area / Series Chart
  - Pie Chart
  - Donut Chart
  - *(Actively expanding — targeting full ApexCharts coverage)*
- **⚡ Minimal Token Usage** — Smart sampling means every generation stays under **3,000 tokens**, regardless of dataset size
- **🕐 Session History** — All past chart generations are saved per session. Pick up any previous result instantly.
- **🔌 Pipeline-Friendly** — Designed to sit as a layer inside existing data workflows, not replace them

---

## 📸 Preview

![OpenVizAI Screenshot](./assets/viz.png)

> *Prompt: "Plot a suitable chart" → OpenVizAI infers a grouped bar chart for Revenue, Expenses & Profit across months — zero manual config.*

---

## 🔢 Performance & Token Cost Matrix

| Dataset Size | Data Sent to LLM | Avg Tokens Used | Estimated Cost (GPT-4o) |
|---|---|---|---|
| 1K rows | Sampled | ~2,800 | ~$0.002 |
| 50K rows | Sampled | ~2,900 | ~$0.003 |
| 500K rows | Sampled | ~3,000 | ~$0.004 |
| **Any size** | Sampled | **< 3,000** | **< $0.005** |

> Token counts include system prompt, data sample, user intent, and full chart config response.
> Costs vary by model and provider. Samples are statistically representative — chart quality doesn't degrade at scale.

---

## 🛠️ Getting Started

```bash
npm run bootstrap
```

2. Start the backend (already configured):

```bash
npm run dev:server
```

3. Create a frontend in `apps/web` (Vite or CRA recommended)..
