import { usePetStore } from "@/lib/stores/use-pet-store";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  NavigationState,
  Route,
  SceneRendererProps,
} from "react-native-tab-view";
import { styles } from "./styles";

type Props = SceneRendererProps & {
  navigationState: NavigationState<Route>;
};

type PillLayout = { x: number; width: number };

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_PADDING = SCREEN_WIDTH / 2;
const SWIPE_THRESHOLD = 40;

const getLabel = (key: string, petName: string | null): string => {
  if (key === "pet") {
    return petName ?? "Pet";
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
};

export const AppNav = ({ navigationState, jumpTo, position }: Props) => {
  const { activePet } = usePetStore();
  const pillLayouts = useRef<(PillLayout | undefined)[]>([]);
  const hasInitialLayout = useRef(false);

  // tabOffsets[i] = the translateX needed to center tab i on screen.
  // Stored as state so that rebuilding the interpolation triggers a re-render.
  const [tabOffsets, setTabOffsets] = useState<number[]>(
    () =>
      Array.from({ length: navigationState.routes.length }).fill(0) as number[],
  );

  // Interpolate tab-view's position AnimatedValue → translateX for the pill row.
  // Runs entirely in the RN Animated system — real-time during swipes, animated on tap.
  const translateX = useMemo(
    () =>
      position.interpolate({
        inputRange: navigationState.routes.map((_, i) => i),
        outputRange: tabOffsets.map((o) => -o),
        extrapolate: "clamp",
      }),
    [position, tabOffsets, navigationState.routes.length],
  );

  const handlePillLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    pillLayouts.current[index] = { x, width };

    setTabOffsets((prev) => {
      const next = [...prev];
      next[index] = x + width / 2 - SCREEN_WIDTH / 2;
      return next;
    });

    if (!hasInitialLayout.current && index === navigationState.index) {
      hasInitialLayout.current = true;
    }
  };

  // Keep stable refs so the PanResponder closure (created once) always sees current values
  const currentIndexRef = useRef(navigationState.index);
  currentIndexRef.current = navigationState.index;
  const jumpToRef = useRef(jumpTo);
  jumpToRef.current = jumpTo;
  const routesRef = useRef(navigationState.routes);
  routesRef.current = navigationState.routes;

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture when horizontal movement dominates
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10,
      onPanResponderRelease: (_, { dx }) => {
        const routes = routesRef.current;
        const index = currentIndexRef.current;
        if (dx < -SWIPE_THRESHOLD) {
          jumpToRef.current(routes[Math.min(index + 1, routes.length - 1)].key);
        } else if (dx > SWIPE_THRESHOLD) {
          jumpToRef.current(routes[Math.max(index - 1, 0)].key);
        }
      },
    }),
  ).current;

  return (
    <View
      style={[styles.container, { overflow: "hidden" }]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[styles.scrollContent, { transform: [{ translateX }] }]}
      >
        <View style={{ width: SIDE_PADDING }} />
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
        <View style={{ width: SIDE_PADDING }} />
      </Animated.View>
    </View>
  );
};
