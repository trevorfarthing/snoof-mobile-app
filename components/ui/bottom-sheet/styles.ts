import { colors, radii, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(44, 36, 23, 0.45)",
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.bgBase,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing[3],
    paddingBottom: spacing[6],
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.bgWarm,
    borderRadius: 2,
  },
  title: {
    fontFamily: fonts.nunitoBold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: fonts.nunito,
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: spacing[3],
  },
});
