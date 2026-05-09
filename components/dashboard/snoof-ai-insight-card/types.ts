import type { InsightState } from "@/lib/hooks/use-snoof-ai-insight";

export type SnoofAiInsightCardProps = {
  state: InsightState;
  onDiscussPress: () => void;
};
