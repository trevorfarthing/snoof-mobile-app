import { usePetStore } from "@/lib/stores/use-pet-store";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
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

type PillLayout = { x: number; width: number };

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_PADDING = SCREEN_WIDTH / 2;

const SCROLL_TIMING = { duration: 200, easing: Easing.inOut(Easing.linear) };

function getLabel(key: string, petName: string | null): string {
  if (key === "pet") return petName ?? "Pet";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

export function AppNav({ navigationState, jumpTo }: Props) {
  const { activePet } = usePetStore();
  const pillLayouts = useRef<(PillLayout | undefined)[]>([]);
  const offsetX = useSharedValue(0);
  const hasInitialLayout = useRef(false);

  // Translate the entire pill row rather than scrolling a ScrollView.
  // This runs entirely on the UI thread with no bridge round-trips.
  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -offsetX.value }],
  }));

  const centerTab = (index: number, animated: boolean) => {
    const layout = pillLayouts.current[index];
    if (!layout) return;
    const x = layout.x + layout.width / 2 - SCREEN_WIDTH / 2;
    offsetX.value = animated ? withTiming(x, SCROLL_TIMING) : x;
  };

  useEffect(() => {
    centerTab(navigationState.index, true);
  }, [navigationState.index]);

  const handlePillLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    pillLayouts.current[index] = { x, width };
    // Only snap on first layout of the active tab. After that, all centering
    // goes through the useEffect so style-change re-layouts don't override animations.
    if (!hasInitialLayout.current && index === navigationState.index) {
      centerTab(index, false);
      hasInitialLayout.current = true;
    }
  };

  return (
    // overflow:hidden clips pills that slide off either edge
    <View style={[styles.container, { overflow: "hidden" }]}>
      <Animated.View style={[styles.scrollContent, rowStyle]}>
        {/* Spacers replace paddingHorizontal so pills get their natural content width */}
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
}
