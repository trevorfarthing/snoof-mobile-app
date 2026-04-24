import HeroAfternoon from "@/assets/svg/hero-afternoon.svg";
import HeroEvening from "@/assets/svg/hero-evening.svg";
import HeroMorning from "@/assets/svg/hero-morning.svg";
import HeroNight from "@/assets/svg/hero-night.svg";
import { useHeroStats } from "@/lib/hooks/use-hero-stats";
import { usePetStore } from "@/lib/stores/use-pet-store";
import {
  formatAge,
  formatWeight,
  getTimePeriod,
  TimePeriod,
} from "@/lib/utils/utils";
import { BlurView } from "expo-blur";
import { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { StatCard } from "../stat-card";
import { styles } from "./styles";

const GREETINGS: Record<TimePeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

function buildSubtitle(
  breed: string | null,
  age: string,
  weight: string,
): string {
  return [breed, age, weight].filter(Boolean).join(" · ");
}

export function HeroCard({
  refreshKey = 0,
  onLoadingChange,
}: {
  refreshKey?: number;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const { activePet } = usePetStore();
  const { goalProgress, upcomingEvent, loading } = useHeroStats(
    activePet?.id ?? null,
    refreshKey,
  );

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const hour = new Date().getHours();
  const period = getTimePeriod(hour);
  const greeting = GREETINGS[period];

  const petName = activePet?.name ?? "";
  const age = formatAge(activePet?.date_of_birth ?? null);
  const weight = formatWeight(activePet?.weight_lbs ?? null);
  const subtitle = buildSubtitle(activePet?.breed ?? null, age, weight);
  const initial = petName.charAt(0).toUpperCase();

  const SceneBackground = {
    morning: HeroMorning,
    afternoon: HeroAfternoon,
    evening: HeroEvening,
    night: HeroNight,
  }[period];

  // Map goals by slot so we can look them up for slots 1 and 2
  const goalBySlot = Object.fromEntries(
    goalProgress.map((g) => [g.heroCardSlot, g]),
  );

  return (
    <View style={styles.card}>
      <View style={StyleSheet.absoluteFill}>
        <SceneBackground width="100%" height="100%" />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <BlurView
            intensity={15}
            tint="light"
            experimentalBlurMethod={
              Platform.OS === "android" ? "dimezisBlurView" : "none"
            }
            style={styles.avatar}
          >
            <Text style={styles.avatarInitial}>{initial}</Text>
          </BlurView>

          <View style={styles.textColumn}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.petName}>{petName}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            variant="progress"
            goal={goalBySlot[1] ?? null}
            loading={loading}
            position={1}
          />
          <StatCard
            variant="progress"
            goal={goalBySlot[2] ?? null}
            loading={loading}
            position={2}
          />
          <StatCard
            variant="upcoming"
            event={upcomingEvent}
            loading={loading}
            position={3}
          />
        </View>
      </View>
    </View>
  );
}
