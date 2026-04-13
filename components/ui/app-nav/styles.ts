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
    paddingBottom: 12,
    paddingTop: 4,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  pillActive: {
    backgroundColor: colors.textPrimary,
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
    fontFamily: fonts.nunitoBold,
  },
  pillLabelInactive: {
    color: colors.textSecondary,
    fontWeight: "500",
  },
});
