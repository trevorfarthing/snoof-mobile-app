import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { supabase } from "@/lib/utils/supabase";

async function onAppleButtonPress() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    const { identityToken, fullName } = credential;

    if (!identityToken) {
      console.error("Apple sign-in: no identity token returned");
      return;
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: identityToken,
    });

    if (error) {
      console.error("Apple sign-in Supabase error:", error);
      return;
    }

    // Apple only sends fullName on the very first sign-in ever
    if (fullName?.givenName && data.user) {
      const displayName = [fullName.givenName, fullName.familyName]
        .filter(Boolean)
        .join(" ");

      await supabase
        .from("profiles")
        .update({ full_name: displayName })
        .eq("id", data.user.id);
    }

    router.replace("/");
  } catch (error: any) {
    if (error.code !== "ERR_REQUEST_CANCELED") {
      console.error("Apple sign-in error:", error);
    }
  }
}

export default function AppleSignInButton() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setIsAvailable);
  }, []);

  if (Platform.OS !== "ios" || !isAvailable) return null;

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
      cornerRadius={12}
      style={{ width: "100%", height: 50 }}
      onPress={onAppleButtonPress}
    />
  );
}
