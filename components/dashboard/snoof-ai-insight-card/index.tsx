import { colors } from "@/constants/colors";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { DOG_FUN_FACTS, getDailyFunFact } from "@/lib/utils/pet-fun-facts";
import { ArrowRight, MessageSquare, Sparkles } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";
import type { SnoofAiInsightCardProps } from "./types";

const LoadingSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.iconCircle} />
    </View>
    <View style={[styles.skeletonLine, { width: "100%" }]} />
    <View style={[styles.skeletonLine, { width: "85%" }]} />
    <View style={[styles.skeletonLine, styles.skeletonShort]} />
  </View>
);

const FunFactCard = ({ onDiscussPress }: { onDiscussPress: () => void }) => {
  const fact = getDailyFunFact(DOG_FUN_FACTS);
  const petStore = usePetStore();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Sparkles size={13} color={colors.primary} strokeWidth={2} />
        </View>
        <Text style={styles.label}>Snoof AI Insight</Text>
      </View>
      <Text style={[styles.body, styles.bodyFunFact]}>{fact}</Text>
      <Text style={styles.nudge}>
        Keep logging for a few days and Snoof AI will start noticing patterns
        for {petStore.activePet?.name}!
      </Text>
      <Pressable style={styles.cta} onPress={onDiscussPress}>
        <Text style={styles.ctaText}>Chat with Snoof AI</Text>
        <ArrowRight size={12} color={colors.primary} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
};

const InsightCard = ({
  text,
  onDiscussPress,
}: {
  text: string;
  onDiscussPress: () => void;
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.iconCircle}>
        <MessageSquare size={13} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={styles.label}>Snoof AI Insight</Text>
    </View>
    <Text style={styles.body}>{text}</Text>
    <Pressable style={styles.cta} onPress={onDiscussPress}>
      <Text style={styles.ctaText}>Discuss with Snoof AI</Text>
      <ArrowRight size={12} color={colors.primary} strokeWidth={2.5} />
    </Pressable>
  </View>
);

export const SnoofAiInsightCard = ({
  state,
  onDiscussPress,
}: SnoofAiInsightCardProps) => {
  return (
    <View style={styles.wrapper}>
      {(() => {
        switch (state.status) {
          case "loading": {
            return <LoadingSkeleton />;
          }
          case "fun_fact": {
            return <FunFactCard onDiscussPress={onDiscussPress} />;
          }
          case "ready": {
            return (
              <InsightCard text={state.text} onDiscussPress={onDiscussPress} />
            );
          }
        }
      })()}
    </View>
  );
};
