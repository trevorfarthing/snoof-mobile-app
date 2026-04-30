import {
  ACTIVITY_CONFIG,
  ActivityType,
} from "@/components/dashboard/quick-log/activity-config";
import type { TodayLog } from "@/lib/hooks/activity-logs/use-today-logs";
import { capitalize, formatClockTime, getTimePeriod } from "@/lib/utils/utils";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";
import { TodayLogListProps, TodayLogRowProps } from "./types";

// Activity types that have full read-only forms wired up. Tapping a row of any
// other type is a no-op until those forms are built.
const VIEWABLE_TYPES = new Set<ActivityType>(["walk", "feeding", "potty"]);

const buildLabel = (log: TodayLog): string => {
  if (log.type === "walk") {
    const hour = new Date(log.occurredAt).getHours();
    return `${capitalize(getTimePeriod(hour))} walk`;
  }

  if (log.type === "feeding" && log.feeding?.meal_label) {
    return capitalize(log.feeding.meal_label);
  }

  return ACTIVITY_CONFIG[log.type].label;
};

const TodayLogRow = ({ log, onPress }: TodayLogRowProps) => {
  const config = ACTIVITY_CONFIG[log.type];
  const Icon = config.IconComponent;
  const time = formatClockTime(new Date(log.occurredAt));
  const isViewable = VIEWABLE_TYPES.has(log.type);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      onPress={() => onPress(log)}
      disabled={!isViewable}
    >
      <View style={styles.dot} />
      <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
        <Icon size={18} color={config.iconColor ?? "#3D3224"} strokeWidth={2} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {buildLabel(log)}
      </Text>
      <Text style={styles.time}>{time}</Text>
    </Pressable>
  );
};

export const TodayLogList = ({
  logs,
  onRowPress,
  onViewAll,
}: TodayLogListProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Today</Text>
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAllLink}>View all ›</Text>
        </Pressable>
      </View>

      {logs.length === 0 ? (
        <Text style={styles.empty}>No logs yet today</Text>
      ) : (
        logs.map((log) => (
          <TodayLogRow key={log.id} log={log} onPress={onRowPress} />
        ))
      )}
    </View>
  );
};
