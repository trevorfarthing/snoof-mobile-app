import { colors } from "@/constants/colors";
import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Outer wrapper: flex:1 container that allows the urgency dot to escape overflow clipping
  cardOuter: {
    flex: 1,
    position: "relative",
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    borderColor: "1px solid rgba(255, 255, 255, 0.3)",
    borderWidth: 0.7,
    boxShadow:
      "inset 0 4px 20px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  card: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  value: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.secondary,
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  label: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.caption,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  progressBar: {
    flexDirection: "row",
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginTop: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.accentSage,
    borderRadius: 2,
  },
  urgencyDot: {
    width: 7,
    height: 7,
    top: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  skeletonContainer: {
    paddingVertical: 4,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
