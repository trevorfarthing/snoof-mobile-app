import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  list: {
    paddingBottom: spacing[2],
  },
  petRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: radii.md,
  },
  petRowActive: {
    backgroundColor: colors.bgElevated,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.circle,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: fonts.nunitoBold,
    fontSize: 18,
    color: colors.textInverse,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontFamily: fonts.nunitoBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  petMeta: {
    fontFamily: fonts.nunito,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 1,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: radii.circle,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
