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
import { useEffect, useState } from "react";
import { AppState, Platform, StyleSheet, Text, View } from "react-native";
import { StatCard } from "../stat-card";
import { styles } from "./styles";

const GREETINGS: Record<TimePeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

const BACKGROUNDS: Record<TimePeriod, any> = {
  morning: HeroMorning,
  afternoon: HeroAfternoon,
  evening: HeroEvening,
  night: HeroNight,
};

const buildSubtitle = (
  breed: string | null,
  age: string,
  weight: string,
): string => {
  return [breed, age, weight].filter(Boolean).join(" · ");
};

export const HeroCard = ({
  refreshKey = 0,
  onLoadingChange,
}: {
  refreshKey?: number;
  onLoadingChange?: (loading: boolean) => void;
}) => {
  const { activePet } = usePetStore();
  const { goalProgress, upcomingEvent, loading } = useHeroStats(
    activePet?.id ?? null,
    refreshKey,
  );

  // Set initial Hero info based on current time
  const hour = new Date().getHours();
  const period = getTimePeriod(hour);
  const [heroInfo, setHeroInfo] = useState({
    sceneBackground: BACKGROUNDS[period],
    greeting: GREETINGS[period],
  });

  const updateHeroInfo = () => {
    const currentHour = new Date().getHours();
    const currentPeriod = getTimePeriod(currentHour);
    setHeroInfo({
      sceneBackground: BACKGROUNDS[currentPeriod],
      greeting: GREETINGS[currentPeriod],
    });
  };

  useEffect(() => {
    updateHeroInfo();

    // Check every minute to catch time period changes
    const interval = setInterval(updateHeroInfo, 60_000);

    // Update Hero info when app comes to foreground again
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        updateHeroInfo();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const petName = activePet?.name ?? "";
  const age = formatAge(activePet?.date_of_birth ?? null);
  const weight = formatWeight(activePet?.weight_lbs ?? null);
  const subtitle = buildSubtitle(activePet?.breed ?? null, age, weight);
  const initial = petName.charAt(0).toUpperCase();

  // Map goals by slot so we can look them up for slots 1 and 2
  const goalBySlot = Object.fromEntries(
    goalProgress.map((g) => [g.heroCardSlot, g]),
  );

  return (
    <View style={styles.card}>
      <View style={StyleSheet.absoluteFill}>
        <heroInfo.sceneBackground width="100%" height="100%" />
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
            <Text style={styles.greeting}>{heroInfo.greeting}</Text>
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
};
