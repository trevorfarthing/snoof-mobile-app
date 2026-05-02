import { fontSizes } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  label: {
    fontSize: fontSizes.secondary,
    fontWeight: "600",
    color: "#86939e",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#86939e",
    borderRadius: 4,
    padding: 12,
    fontSize: fontSizes.body,
  },
  button: {
    backgroundColor: "#2089dc",
    borderRadius: 4,
    padding: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: fontSizes.body,
    fontWeight: "600",
  },
  divider: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
  },
  dividerText: {
    fontSize: fontSizes.secondary,
    color: "#86939e",
  },
});
