import { colors } from "@/constants/colors";
import { ChevronDown } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./styles";

type Props = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

const CHEVRON_DURATION_MS = 180;

export const CollapsibleSection = ({
  title,
  expanded,
  onToggle,
  children,
}: Props) => {
  const rotation = useDerivedValue(() =>
    withTiming(expanded ? 180 : 0, { duration: CHEVRON_DURATION_MS }),
  );

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // `LinearTransition` on the container animates the parent resizing as the
  // body mounts/unmounts. A manual height animation via `onLayout` was tried
  // first but stuttered on expand because child layouts (selector grids, text
  // inputs) fire `onLayout` multiple times during first render, each restarting
  // the animation mid-flight. Running layout transitions on the UI thread
  // avoids that entirely.
  return (
    <Animated.View
      style={styles.container}
      layout={LinearTransition.duration(220)}
    >
      <Pressable
        style={({ pressed }) => [styles.header, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onToggle}
      >
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
        </Animated.View>
      </Pressable>

      {expanded ? (
        <Animated.View
          style={styles.body}
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(120)}
          layout={LinearTransition.duration(220)}
        >
          {children}
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};
