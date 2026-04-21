import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: 9,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: spacing[2],
  },
  activityItem: {
    width: "23%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activityItemSelected: {
    backgroundColor: "#C8672E1A",
    borderColor: colors.primary,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  activityLabel: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: "center",
  },
  activityLabelSelected: {
    color: colors.primary,
    fontFamily: fonts.nunitoBold,
  },
  logButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing[2],
  },
  logButtonDisabled: {
    opacity: 0.4,
  },
  logButtonPressed: {
    opacity: 0.7,
  },
  logButtonText: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    color: "#fff",
  },
});
