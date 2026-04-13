import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgBase,
    marginTop: spacing[3],
  },
  scrollContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  indicator: {
    position: "absolute",
    borderRadius: radii.pill,
    backgroundColor: colors.textPrimary,
    // x/y/width/height set via Reanimated
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  pillActive: {
    backgroundColor: "transparent", // indicator provides the dark bg
  },
  pillInactive: {
    backgroundColor: colors.bgElevated,
  },
  pillLabel: {
    fontSize: 12,
    fontFamily: fonts.nunito,
  },
  pillLabelActive: {
    color: colors.textInverse,
    fontWeight: "600",
    fontFamily: fonts.nunitoSemiBold,
  },
  pillLabelInactive: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
