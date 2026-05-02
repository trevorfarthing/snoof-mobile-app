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
  nameField: {
    marginBottom: spacing[3],
  },
  nameInput: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    fontFamily: fonts.nunito,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
  },
  amountRow: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  amountField: {
    flex: 1,
  },
  amountInput: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.body,
    color: colors.textPrimary,
  },
  unitField: {
    flex: 1,
  },
  unitSegment: {
    flexDirection: "row",
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    padding: 2,
  },
  unitPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  unitPillSelected: {
    backgroundColor: colors.bgWarm,
  },
  unitPillLabel: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.secondary,
    color: colors.textSecondary,
  },
  unitPillLabelSelected: {
    color: colors.textPrimary,
  },
  timeField: {
    marginBottom: spacing[3],
  },
  timeButton: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 12,
  },
  timeValue: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.body,
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
