import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
  },
  suffix: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 13,
    color: colors.textTertiary,
  },
  containerDisabled: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing[2],
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: 12,
  },
  disabledValue: {
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  disabledHint: {
    fontFamily: fonts.nunito,
    fontSize: 11,
    color: colors.textTertiary,
  },
});
