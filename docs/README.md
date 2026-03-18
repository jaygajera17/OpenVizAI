# OpenVizAI Spec Docs

This folder is reserved for chartSpec standard documentation artifacts.

## Version

- Current: `openvizai/spec/v1`

## Sample Payloads

Each sample file includes an `exampleData` array whose columns match the `chart.chartSpec` fields.

- Canonical v1 sample: [openvizai-spec-v1.sample.json](openvizai-spec-v1.sample.json)
- Line sample: [openvizai-spec-v1.line.sample.json](openvizai-spec-v1.line.sample.json)
- Bar sample: [openvizai-spec-v1.bar.sample.json](openvizai-spec-v1.bar.sample.json)
- Range bar sample: [openvizai-spec-v1.range_bar.sample.json](openvizai-spec-v1.range_bar.sample.json)
- Radar sample: [openvizai-spec-v1.radar.sample.json](openvizai-spec-v1.radar.sample.json)
- Pie sample: [openvizai-spec-v1.pie.sample.json](openvizai-spec-v1.pie.sample.json)
- Donut sample: [openvizai-spec-v1.donut.sample.json](openvizai-spec-v1.donut.sample.json)

## Compatibility Requirement

Custom generators that want OpenVizAI adapter compatibility must emit JSON aligned to `openvizai/spec/v1`.
