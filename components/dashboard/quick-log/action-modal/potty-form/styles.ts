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
  fieldLabel: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.minimum,
    color: colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: spacing[2],
  },
  locationField: {
    marginBottom: spacing[3],
  },
  locationInput: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    fontFamily: fonts.nunito,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
  },
  accidentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing[3],
    gap: spacing[2],
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.textTertiary,
    backgroundColor: colors.bgSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
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
  errorText: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.caption,
    color: colors.error,
    marginBottom: spacing[3],
  },
  logButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing[2],
  },
  logButtonText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.body,
    color: "#fff",
  },
});
