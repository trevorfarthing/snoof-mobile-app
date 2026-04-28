import Auth from "@/components/auth";
import { Stack } from "expo-router";
import { ScrollView } from "react-native";

const LoginScreen = () => {
  return (
    <>
      <Stack.Screen options={{ title: "Sign In", headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Auth />
      </ScrollView>
    </>
  );
};

export default LoginScreen;
