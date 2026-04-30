import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[3],
    marginTop: spacing[5],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontFamily: fonts.nunitoBold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  viewAllLink: {
    fontFamily: fonts.nunitoBold,
    fontSize: 12,
    color: colors.primary,
  },
  empty: {
    paddingVertical: spacing[4],
    fontFamily: fonts.nunito,
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.bgElevated,
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    marginBottom: spacing[2],
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.circle,
    backgroundColor: colors.success,
    marginRight: spacing[3],
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.circle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing[3],
  },
  label: {
    flex: 1,
    fontFamily: fonts.nunito,
    fontSize: 14,
    color: colors.textPrimary,
  },
  time: {
    fontFamily: fonts.nunito,
    fontSize: 13,
    color: colors.textSecondary,
  },
});
