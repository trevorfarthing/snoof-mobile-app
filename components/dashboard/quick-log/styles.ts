import { colors, spacing } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[3],
    marginTop: spacing[1],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontFamily: fonts.nunitoBold,
    fontSize: 10,
    color: colors.textTertiary,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  editLink: {
    fontFamily: fonts.nunitoBold,
    fontSize: 12,
    color: colors.primary,
  },
  row: {
    flexDirection: "row",
    gap: 5,
  },
});
