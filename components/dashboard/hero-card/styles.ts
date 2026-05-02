import { fonts, fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    minHeight: 200,
    marginHorizontal: 14,
    marginBottom: 16,
  },
  content: {
    position: "relative",
    zIndex: 2,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    boxShadow:
      "inset 0 4px 20px rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.1)",
  },
  avatarInitial: {
    fontSize: fontSizes.body,
    fontFamily: fonts.nunitoBold,
    color: "#ffffff",
  },
  textColumn: {
    flex: 1,
  },
  greeting: {
    fontFamily: fonts.loraMedium,
    fontSize: fontSizes.secondary,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  petName: {
    fontFamily: fonts.nunitoBold,
    fontSize: fontSizes.header3,
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.nunito,
    fontSize: fontSizes.caption,
    color: "rgba(255,255,255,0.5)",
    marginTop: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
});
