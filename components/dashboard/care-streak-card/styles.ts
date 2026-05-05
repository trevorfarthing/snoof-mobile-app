import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing[3],
    marginTop: spacing[5],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.minimum,
    color: colors.textTertiary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  sectionLink: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radii.lg,
    padding: spacing[4],
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  cardTitle: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
  },
  badgeGroup: {
    alignItems: "flex-end",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  badgeText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.caption,
    color: colors.primary,
  },
  longestText: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.minimum,
    color: colors.textTertiary,
    marginTop: 2,
  },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayCell: {
    alignItems: "center",
    gap: spacing[1],
  },
  dayLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.minimum,
    color: colors.textTertiary,
  },
  dayLabelToday: {
    color: colors.primary,
  },
  pawCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pawCircleMet: {
    backgroundColor: "rgba(107, 158, 107, 0.2)",
  },
  pawCircleInProgress: {
    backgroundColor: "rgba(200, 103, 46, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(200, 103, 46, 0.4)",
    borderStyle: "dashed",
  },
  pawCircleMissed: {
    backgroundColor: "rgba(44, 36, 23, 0.05)",
  },
  loadingPlaceholder: {
    height: 32,
  },
});
