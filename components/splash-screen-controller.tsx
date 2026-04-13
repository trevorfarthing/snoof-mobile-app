import {
  DMMono_400Regular,
  DMMono_500Medium,
} from "@expo-google-fonts/dm-mono";
import {
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";

import { useAuthContext } from "@/lib/hooks/use-auth-context";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController(): null {
  const { isLoading: authLoading } = useAuthContext();
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  if (!authLoading && fontsLoaded) {
    SplashScreen.hideAsync();
  }

  return null;
}
