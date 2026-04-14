import { HeroCard } from "@/components/dashboard/hero-card/hero-card";
import { colors } from "@/constants/colors";
import { ScrollView } from "react-native";

export default function DashboardScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgBase }}
      contentContainerStyle={{ paddingTop: 12 }}
    >
      <HeroCard />
    </ScrollView>
  );
}
