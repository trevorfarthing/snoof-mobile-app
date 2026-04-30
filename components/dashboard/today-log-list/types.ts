import type { TodayLog } from "@/lib/hooks/activity-logs/use-today-logs";

export type TodayLogListProps = {
  logs: TodayLog[];
  onRowPress: (log: TodayLog) => void;
  onViewAll?: () => void;
};

export type TodayLogRowProps = {
  log: TodayLog;
  onPress: (log: TodayLog) => void;
};
