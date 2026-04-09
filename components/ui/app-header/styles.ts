import { colors, radii, spacing } from "@/constants/colors";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgBase,
  },
  bar: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radii.circle,
    backgroundColor: colors.bgSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  petPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingLeft: 7,
    paddingRight: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.bgSubtle,
    maxWidth: 180,
  },
  petAvatar: {
    width: 26,
    height: 26,
    borderRadius: radii.circle,
    alignItems: "center",
    justifyContent: "center",
  },
  petAvatarInitial: {
    fontFamily: Platform.select({
      android: "Nunito_600SemiBold",
      ios: "Nunito-600SemiBold",
    }),
    fontSize: 11,
    fontWeight: "600",
    color: colors.textInverse,
  },
  petName: {
    fontFamily: Platform.select({
      android: "Nunito_600SemiBold",
      ios: "Nunito-600SemiBold",
    }),
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  notificationDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: radii.circle,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.bgBase,
  },
});
