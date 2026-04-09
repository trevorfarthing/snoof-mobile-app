// Design tokens from DESIGN_SPEC.md v1.2
// Reference: Section 13 (Token Export Format), Section 2 (Color System)

export const colors = {
  // Primary
  primary: "#C8672E",
  primaryLight: "#E8944F",
  primaryDark: "#A14E1A",

  // Backgrounds
  bgBase: "#FAF6F1",
  bgElevated: "#F2EDE6",
  bgSubtle: "#F3EDE4",
  bgWarm: "#EDE5D8",

  // Text
  textPrimary: "#3D3224",
  textSecondary: "#7A6E5D",
  textTertiary: "#A89F91",
  textInverse: "#FAF6F1",

  // Accents
  accentSage: "#8BA888",
  accentGold: "#D4A34A",
  accentPeach: "#E8B89D",
  accentCream: "#F5E6C8",

  // Semantic
  success: "#6B9E6B",
  warning: "#D4943A",
  error: "#C45E4A",
  info: "#7A96B8",
} as const;

// Per-pet hero card gradient start colors (DESIGN_SPEC section 2.3)
// Auto-assigned by creation order (sort_order % 4)
export const petColors = [
  "#3D2E1F", // Pet 1 — warm brown
  "#2E2339", // Pet 2 — deep purple
  "#1F332A", // Pet 3 — forest green
  "#331F1F", // Pet 4 — deep burgundy
] as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  circle: 9999,
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 48,
  9: 64,
} as const;
