import type { StreakDay } from "@/lib/hooks/use-care-streak";

export type CareStreakCardProps = {
  days: StreakDay[];
  currentStreak: number;
  longestStreak: number;
  loading: boolean;
};

export type StreakDayCellProps = {
  day: StreakDay;
};
