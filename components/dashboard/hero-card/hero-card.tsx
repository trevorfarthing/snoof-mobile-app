import HeroAfternoon from "@/assets/svg/hero-afternoon.svg";
import HeroEvening from "@/assets/svg/hero-evening.svg";
import HeroMorning from "@/assets/svg/hero-morning.svg";
import HeroNight from "@/assets/svg/hero-night.svg";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, Text, View } from "react-native";
import { styles } from "./styles";

type TimePeriod = "morning" | "afternoon" | "evening" | "night";

function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const GREETINGS: Record<TimePeriod, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

function formatAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "";
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (months < 12) return `${months} mo`;
  const years = months / 12;
  const rounded = Math.round(years * 2) / 2;
  return rounded === 1 ? "1 yr" : `${rounded} yrs`;
}

function formatWeight(weightLbs: number | null): string {
  if (weightLbs == null) return "";
  return `${weightLbs} lbs`;
}

function buildSubtitle(
  breed: string | null,
  age: string,
  weight: string,
): string {
  return [breed, age, weight].filter(Boolean).join(" · ");
}

export function HeroCard() {
  const { activePet } = usePetStore();

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
      </View>
    </View>
  );
}
