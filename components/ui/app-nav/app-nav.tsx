import { usePetStore } from "@/lib/stores/use-pet-store";
import { useEffect, useRef } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  NavigationState,
  Route,
  SceneRendererProps,
} from "react-native-tab-view";
import { styles } from "./styles";

type Props = SceneRendererProps & {
  navigationState: NavigationState<Route>;
};

type PillMeasure = { x: number; y: number; width: number; height: number };

const SPRING_CONFIG = { damping: 22, stiffness: 220, mass: 0.9 };

function getLabel(key: string, petName: string | null): string {
  if (key === "pet") return petName ?? "Pet";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function AppNav({ navigationState, jumpTo }: Props) {
  const { activePet } = usePetStore();

  const pillMeasures = useRef<(PillMeasure | undefined)[]>([]);
  const initialized = useRef(false);

  const indicatorX = useSharedValue(0);
  const indicatorY = useSharedValue(0);
  const indicatorWidth = useSharedValue(80);
  const indicatorHeight = useSharedValue(28);

  const applyMeasure = (measure: PillMeasure, animated: boolean) => {
    if (animated) {
      indicatorX.value = withSpring(measure.x, SPRING_CONFIG);
      indicatorWidth.value = withSpring(measure.width, SPRING_CONFIG);
    } else {
      indicatorX.value = measure.x;
      indicatorY.value = measure.y;
      indicatorWidth.value = measure.width;
      indicatorHeight.value = measure.height;
    }
  };

  const handlePillLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    pillMeasures.current[index] = { x, y, width, height };

    if (index === navigationState.index) {
      applyMeasure({ x, y, width, height }, initialized.current);
      initialized.current = true;
    }
  };

  // Animate indicator when active tab changes after initial mount
  useEffect(() => {
    if (!initialized.current) return;
    const m = pillMeasures.current[navigationState.index];
    if (m) applyMeasure(m, true);
  }, [navigationState.index]);

  const indicatorAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
    top: indicatorY.value,
    height: indicatorHeight.value,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sliding active-pill indicator (renders behind pill labels) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.indicator, indicatorAnimStyle]}
        />

        {/* Pills */}
        {navigationState.routes.map((route, i) => {
          const isActive = i === navigationState.index;
          return (
            <TouchableOpacity
              key={route.key}
              onLayout={(e) => handlePillLayout(i, e)}
              onPress={() => jumpTo(route.key)}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.pill,
                isActive ? styles.pillActive : styles.pillInactive,
              ]}
            >
              <Text
                style={[
                  styles.pillLabel,
                  isActive ? styles.pillLabelActive : styles.pillLabelInactive,
                ]}
              >
                {getLabel(route.key, activePet?.name ?? null)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
