import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
  },
  title: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.textPrimary,
  },
  body: {
    paddingTop: spacing[3],
  },
});
