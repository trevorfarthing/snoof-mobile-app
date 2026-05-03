import { colors, radii, spacing } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[3],
  },
  label: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: fontSizes.caption,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.primary,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.error,
    gap: 6,
  },
  deleteButtonText: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: colors.textInverse,
  },
});
