import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  placeholder: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
    backgroundColor: colors.bgElevated,
    borderRadius: radii.md,
    marginBottom: spacing[4],
  },
  placeholderText: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.secondary,
    color: colors.textTertiary,
    textAlign: "center",
  },
  logButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  logButtonText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.body,
    color: "#fff",
  },
});
