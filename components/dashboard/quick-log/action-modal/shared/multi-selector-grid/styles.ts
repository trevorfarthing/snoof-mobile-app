import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontFamily: fonts.nunitoBold,
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: spacing[2],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tile: {
    width: "18.5%",
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  tileSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.bgWarm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgSubtle,
  },
  iconContainerSelected: {
    backgroundColor: colors.accentCream,
  },
  tileLabel: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
