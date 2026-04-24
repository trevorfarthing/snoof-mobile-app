import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
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
    fontSize: 9,
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
    fontSize: 13,
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 12,
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
    fontSize: 15,
    color: colors.textPrimary,
  },
  timePlaceholder: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 15,
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
    fontSize: 14,
    color: colors.textPrimary,
  },
  notesCounter: {
    fontFamily: fonts.nunito,
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: "right",
    marginTop: spacing[1],
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
    fontSize: 15,
    color: "#fff",
  },
});
