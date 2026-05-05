import { colors } from "@/constants/colors";
import { Heart, PawPrint } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";
import { CareStreakCardProps, StreakDayCellProps } from "./types";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Picks the visual style + paw color for a given day's streak status.
const getPawAppearance = (status: StreakDayCellProps["day"]["status"]) => {
  switch (status) {
    case "met": {
      return { circleStyle: styles.pawCircleMet, color: colors.success };
    }
    case "in_progress": {
      return {
        circleStyle: styles.pawCircleInProgress,
        color: colors.primary,
      };
    }
    case "missed":
    default: {
      return {
        circleStyle: styles.pawCircleMissed,
        color: colors.textTertiary,
      };
    }
  }
};

const StreakDayCell = ({ day }: StreakDayCellProps) => {
  const date = new Date(`${day.day}T00:00:00`);
  const weekday = WEEKDAY_LABELS[date.getDay()];
  const { circleStyle, color } = getPawAppearance(day.status);

  // Calculate opacity based on status
  let opacity;
  if (day.status === "met") {
    opacity = 1;
  } else if (day.status === "in_progress") {
    opacity = 0.7;
  } else {
    opacity = 0.5;
  }

  return (
    <View style={styles.dayCell}>
      <Text style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}>
        {weekday}
      </Text>
      <View style={[styles.pawCircle, circleStyle]}>
        <PawPrint size={18} color={color} strokeWidth={2} opacity={opacity} />
      </View>
    </View>
  );
};

export const CareStreakCard = ({
  days,
  currentStreak,
  longestStreak,
  loading,
}: CareStreakCardProps) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>This week</Text>
        <Pressable>
          <Text style={styles.sectionLink}>History ›</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Care streak</Text>
          <View style={styles.badgeGroup}>
            <View style={styles.badgeRow}>
              <Heart size={14} color={colors.primary} fill={colors.primary} />
              <Text style={styles.badgeText}>
                {currentStreak} {currentStreak === 1 ? "day" : "days"}
              </Text>
              {longestStreak > 0 ? (
                <Text style={styles.longestText}>| Best: {longestStreak}</Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.daysRow}>
          {loading || days.length === 0
            ? Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={styles.loadingPlaceholder} />
              ))
            : days.map((day) => <StreakDayCell key={day.day} day={day} />)}
        </View>
      </View>
    </View>
  );
};
