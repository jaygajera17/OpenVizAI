export interface SchemaColumn {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "null" | "unknown";
}

export interface SchemaInfo {
  columns: SchemaColumn[];
  rowCount: number;
}

function inferType(value: unknown): SchemaColumn["type"] {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    // Check for ISO date-like patterns
    if (!isNaN(Date.parse(value)) && /\d{4}[-/]\d{2}[-/]\d{2}/.test(value)) {
      return "date";
    }
    return "string";
  }
  return "unknown";
}

/**
 * Inspect the schema of a dataset sample.
 * Infers column names and types from the first non-null value encountered.
 */
export function inspectSchema(sample: Record<string, unknown>[]): SchemaInfo {
  if (sample.length === 0) {
    return { columns: [], rowCount: 0 };
  }

  const columnNames = Object.keys(sample[0]);
  const columns: SchemaColumn[] = columnNames.map((name) => {
    // Find the first non-null value to infer type
    for (const row of sample) {
      const val = row[name];
      if (val !== null && val !== undefined) {
        return { name, type: inferType(val) };
      }
    }
    return { name, type: "null" };
  });

  return { columns, rowCount: sample.length };
}
