import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: spacing[3],
  },
  requiredRow: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  requiredField: {
    flex: 1,
    gap: spacing[1],
  },
  fieldLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.minimum,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: spacing[2],
  },
  distanceField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
  },
  distanceInput: {
    flex: 1,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  distanceSuffix: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.caption,
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.caption,
    color: colors.error,
    marginBottom: spacing[3],
  },
  timeRow: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  timeField: {
    flex: 1,
  },
  timeButton: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 12,
  },
  timeValue: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
  },
  timePlaceholder: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.secondary,
    color: "#C8B9A4",
  },
  notesField: {
    marginBottom: spacing[2],
  },
  notesInput: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    minHeight: 80,
    fontFamily: fonts.nunito,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
  },
  notesCounter: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.minimum,
    color: colors.textTertiary,
    textAlign: "right",
    marginTop: spacing[1],
  },
});
