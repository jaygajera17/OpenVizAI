import { useState } from "react";
import ChartRenderer from "../components/ChartRenderer";
import { allChartVariants } from "../config/chartVariants";

export default function Home() {
  const [selectedVariantId, setSelectedVariantId] = useState(
    allChartVariants[0]?.id,
  );

  const activeVariant =
    allChartVariants.find((v) => v.id === selectedVariantId) ||
    allChartVariants[0];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <label>
          <span style={{ marginRight: 8 }}>Select line chart example:</span>
          <select
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {allChartVariants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ChartRenderer variant={activeVariant} />
    </>
  );
}