import { colors } from "@/constants/colors";
import type { GoalProgress, UpcomingEvent } from "@/lib/hooks/use-hero-stats";
import { BlurView } from "expo-blur";
import { Platform, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { styles } from "./styles";
import { StatCardProps } from "./types";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatProgressValue(goal: GoalProgress): string {
  const current = Math.round(goal.currentValue * 10) / 10;
  const target = goal.targetValue;

  if (goal.goalType === "meal_count") {
    return `${current} / ${target}`;
  }

  // walk_distance / walk_duration: show "current unit"
  const unit =
    goal.goalType === "walk_distance"
      ? goal.targetUnit // miles | km
      : goal.targetUnit; // minutes | hours
  return `${current} ${unit}`;
}

function progressLabel(goal: GoalProgress): string {
  if (goal.goalType === "meal_count") {
    return "meals today";
  }
  if (goal.goalType === "walk_distance") {
    return "walked today";
  }
  return "walked today";
}

function progressRatio(goal: GoalProgress): number {
  if (goal.targetValue === 0) {
    return 0;
  }
  return Math.min(goal.currentValue / goal.targetValue, 1);
}

function formatUpcomingValue(event: UpcomingEvent): string {
  if (!event) {
    return "Up to date";
  }

  return event.title.length > 18
    ? event.title.slice(0, 16).trimEnd() + "…"
    : event.title;
}

function formatUpcomingLabel(event: UpcomingEvent): string {
  if (!event) {
    return "Nothing more today!";
  }

  const d = event.daysUntil;
  if (d < 0) {
    return "Overdue";
  }
  if (d === 0) {
    return "Today";
  }
  if (d === 1) {
    return "Tomorrow";
  }
  return `In ${d} days`;
}

function urgencyDotColor(event: UpcomingEvent): string {
  if (!event) {
    return colors.success;
  }

  const d = event.daysUntil;
  if (d < 0) {
    return colors.error;
  }
  if (d <= 7) {
    return colors.warning;
  }
  if (d <= 30) {
    return colors.info;
  }
  return colors.success;
}

// ─── Skeleton ──────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <View style={[styles.skeletonLine, { width: "60%", marginBottom: 6 }]} />
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function StatCard(props: StatCardProps) {
  const { loading = false, position } = props;

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.skeletonContainer}>
          <Skeleton />
          <View style={[styles.skeletonLine, { width: "40%" }]} />
        </View>
      );
    }

    if (props.variant === "progress") {
      if (props.goal) {
        return <ProgressContent goal={props.goal} />;
      }
      return <Text style={styles.label}>{"No goal set"}</Text>;
    }
    if (props.variant === "upcoming") {
      return <UpcomingContent event={props.event} />;
    }
    return null;
  };

  return (
    <Animated.View
      style={styles.cardOuter}
      entering={FadeIn.duration(1000).delay(position * 150 + 200)}
    >
      <View style={styles.cardWrapper}>
        <BlurView
          intensity={20}
          tint="light"
          experimentalBlurMethod={
            Platform.OS === "android" ? "dimezisBlurView" : "none"
          }
          style={styles.card}
        >
          {renderContent()}
        </BlurView>
      </View>
    </Animated.View>
  );
}

function ProgressContent({ goal }: { goal: GoalProgress }) {
  const ratio = progressRatio(goal);
  return (
    <>
      <Text style={styles.value} numberOfLines={1}>
        {formatProgressValue(goal)}
      </Text>
      <Text style={styles.label}>{progressLabel(goal)}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { flex: ratio }]} />
        <View style={{ flex: 1 - ratio }} />
      </View>
    </>
  );
}

function UpcomingContent({ event }: { event: UpcomingEvent }) {
  const label = formatUpcomingLabel(event);
  const dotColor = urgencyDotColor(event);

  return (
    <>
      <View style={{ flexDirection: "row" }}>
        {dotColor !== null && (
          <View style={[styles.urgencyDot, { backgroundColor: dotColor }]} />
        )}
        <Text style={styles.value} numberOfLines={1}>
          {formatUpcomingValue(event)}
        </Text>
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </>
  );
}
