import { SplashScreenController } from "@/components/splash-screen-controller";
import { AppHeader } from "@/components/ui/app-header";
import { useAuthContext } from "@/lib/hooks/use-auth-context";
import AuthProvider from "@/providers/auth-provider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

function RootNavigator() {
  const { isLoggedIn } = useAuthContext();

  return (
    <View style={{ flex: 1 }}>
      {isLoggedIn && <AppHeader />}
      <Stack style={{ flex: 1 }}>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SplashScreenController />
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
