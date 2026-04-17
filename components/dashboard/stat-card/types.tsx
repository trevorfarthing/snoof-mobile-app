import { GoalProgress, UpcomingEvent } from "@/lib/hooks/use-hero-stats";

// ─── Progress variant (walk / meal) ────────────────────────────────────────

type ProgressProps = {
  variant: "progress";
  goal: GoalProgress | null;
  loading?: boolean;
};

// ─── Upcoming variant (health event slot) ──────────────────────────────────

type UpcomingProps = {
  variant: "upcoming";
  event: UpcomingEvent;
  loading?: boolean;
};

export type StatCardProps = ProgressProps | UpcomingProps;
