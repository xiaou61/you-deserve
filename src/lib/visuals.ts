import visualData from "../../content/visuals/question-visuals.json";

export type VisualType = "flow" | "structure" | "compare" | "sequence" | "scenario";

export type VisualNode = {
  label: string;
  detail?: string;
  tone?: "main" | "safe" | "warn";
};

export type VisualColumn = {
  title: string;
  items: string[];
};

export type QuestionVisual = {
  type: VisualType;
  title: string;
  summary: string;
  nodes?: VisualNode[];
  columns?: VisualColumn[];
  prompt: string;
  takeaway: string;
};

const visuals = visualData as Record<string, QuestionVisual>;

export function getQuestionVisual(slug: string): QuestionVisual | undefined {
  return visuals[slug];
}

export function getVisualCount(): number {
  return Object.keys(visuals).length;
}
