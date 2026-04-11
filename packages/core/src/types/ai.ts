// src/types/ai.ts

export interface GenerationResult {
  name: string;
  htmlContent: string;
}

export interface UpdateChange {
  type: "css" | "html" | "js";
  operation: "update" | "add" | "remove";
  selector: string;
  property?: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
}

export interface UpdateAnalysis {
  approach: "precise" | "regenerate";
  reasoning?: string;
  changes: UpdateChange[];
  summary: string;
}
