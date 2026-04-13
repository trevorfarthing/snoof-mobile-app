import { Platform } from "react-native";

export const fonts = {
  nunito: Platform.select({
    android: "Nunito_400Regular",
    ios: "Nunito-400Regular",
  }),
  nunitoSemiBold: Platform.select({
    android: "Nunito_600SemiBold",
    ios: "Nunito-600SemiBold",
  }),
};
