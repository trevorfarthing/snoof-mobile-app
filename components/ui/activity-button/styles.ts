import { colors, radii } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: radii.md,
    backgroundColor: colors.bgElevated,
  },
  buttonMore: {
    flex: 1,
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: radii.md,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C8B9A4",
  },
  buttonLogged: {
    backgroundColor: "#E8F3E8",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.nunitoSemiBold,
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: "center",
  },
  labelLogged: {
    color: "#5A8A5A",
  },
  removeBadge: {
    position: "absolute",
    top: -5,
    left: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
