import SignOutButton from "@/components/auth/social-auth-buttons/sign-out-button";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "600" }}>
        Welcome to Snoof 🐾
      </Text>
      <SignOutButton />
    </View>
  );
}
