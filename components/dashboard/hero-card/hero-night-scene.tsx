import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
} from "react-native-svg";

const FIREFLIES: {
  cx: number;
  cy: number;
  r: number;
  maxOpacity: number;
  glowDuration: number;
  driftDuration: number;
  driftX: number;
  driftY: number;
  delay: number;
}[] = [
  {
    cx: 100,
    cy: 140,
    r: 2,
    maxOpacity: 0.6,
    glowDuration: 1500,
    driftDuration: 2400,
    driftX: 7,
    driftY: -5,
    delay: 0,
  },
  {
    cx: 200,
    cy: 150,
    r: 1.5,
    maxOpacity: 0.4,
    glowDuration: 1900,
    driftDuration: 3200,
    driftX: -5,
    driftY: 5,
    delay: 600,
  },
  {
    cx: 260,
    cy: 135,
    r: 1.8,
    maxOpacity: 0.5,
    glowDuration: 1700,
    driftDuration: 2800,
    driftX: 6,
    driftY: 7,
    delay: 1200,
  },
  {
    cx: 150,
    cy: 155,
    r: 1.2,
    maxOpacity: 0.35,
    glowDuration: 2100,
    driftDuration: 3500,
    driftX: -7,
    driftY: -5,
    delay: 400,
  },
];

function Firefly({
  cx,
  cy,
  r,
  maxOpacity,
  glowDuration,
  driftDuration,
  driftX,
  driftY,
  delay,
}: (typeof FIREFLIES)[number]) {
  const opacity = useSharedValue(0.1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(maxOpacity, {
          duration: glowDuration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(driftX, {
          duration: driftDuration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );

    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(driftY, {
          duration: Math.round(driftDuration * 1.4),
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  // Firefly glow: outer soft halo + inner bright dot, positioned via absolute layout
  const size = r * 8;
  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      {/* Outer glow */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#D4C46A",
          opacity: 0.25,
        }}
      />
      {/* Inner bright dot */}
      <View
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          backgroundColor: "#F0E090",
        }}
      />
    </Animated.View>
  );
}

export function HeroNightScene() {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Static SVG background */}
      <Svg
        viewBox="0 0 362 210"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
      >
        <Defs>
          <LinearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0F1A2E" />
            <Stop offset="50%" stopColor="#1A2A40" />
            <Stop offset="100%" stopColor="#1E3040" />
          </LinearGradient>
        </Defs>

        {/* Sky */}
        <Rect width={362} height={210} fill="url(#sky-night)" />

        {/* Moon */}
        <Circle cx={290} cy={50} r={18} fill="#E8E0C8" opacity={0.9} />
        <Circle cx={296} cy={46} r={15} fill="#0F1A2E" opacity={0.7} />
        {/* Moon glow */}
        <Circle cx={290} cy={50} r={30} fill="#E8E0C8" opacity={0.06} />

        {/* Stars */}
        <Circle cx={40} cy={30} r={1.2} fill="#E8E0C8" opacity={0.7} />
        <Circle cx={80} cy={55} r={0.8} fill="#E8E0C8" opacity={0.5} />
        <Circle cx={120} cy={25} r={1} fill="#E8E0C8" opacity={0.6} />
        <Circle cx={160} cy={45} r={0.8} fill="#E8E0C8" opacity={0.4} />
        <Circle cx={200} cy={20} r={1.2} fill="#E8E0C8" opacity={0.5} />
        <Circle cx={240} cy={38} r={0.8} fill="#E8E0C8" opacity={0.6} />
        <Circle cx={340} cy={30} r={1} fill="#E8E0C8" opacity={0.5} />
        <Circle cx={55} cy={70} r={0.6} fill="#E8E0C8" opacity={0.3} />
        <Circle cx={180} cy={65} r={0.7} fill="#E8E0C8" opacity={0.4} />
        <Circle cx={320} cy={70} r={0.9} fill="#E8E0C8" opacity={0.3} />
        <Circle cx={110} cy={80} r={0.5} fill="#E8E0C8" opacity={0.25} />

        {/* Distant hills */}
        <Path
          d="M0 145 Q80 125 160 138 Q240 118 362 132 L362 210 L0 210Z"
          fill="#14202E"
          opacity={0.8}
        />
        {/* Mid hills */}
        <Path
          d="M0 160 Q70 148 140 155 Q210 142 280 150 Q340 140 362 148 L362 210 L0 210Z"
          fill="#0F1822"
          opacity={0.9}
        />
        {/* Tree silhouettes */}
        <Path
          d="M30 155 L40 125 L50 155Z"
          fill="#0A1018"
          opacity={0.9}
        />
        <Path
          d="M60 158 L68 132 L76 158Z"
          fill="#0A1018"
          opacity={0.8}
        />
        <Path
          d="M300 148 L308 122 L316 148Z"
          fill="#0A1018"
          opacity={0.85}
        />
        <Path
          d="M325 152 L331 130 L337 152Z"
          fill="#0A1018"
          opacity={0.8}
        />
        {/* Foreground */}
        <Path
          d="M0 175 Q90 165 180 170 Q270 162 362 168 L362 210 L0 210Z"
          fill="#080E14"
          opacity={0.9}
        />
      </Svg>

      {/* Animated fireflies layered on top */}
      {FIREFLIES.map((ff, i) => (
        <Firefly key={i} {...ff} />
      ))}
    </View>
  );
}
