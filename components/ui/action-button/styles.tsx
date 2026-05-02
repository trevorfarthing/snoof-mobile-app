import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing[2],
  },
  actionButtonText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.body,
    color: "#fff",
  },
});
