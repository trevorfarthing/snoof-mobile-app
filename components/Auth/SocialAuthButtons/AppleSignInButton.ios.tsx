import appleAuth, {
  AppleRequestOperation,
  AppleRequestScope,
  AppleButton,
} from "@invertase/react-native-apple-authentication";
import { router } from "expo-router";
import { Platform } from "react-native";

import { supabase } from "@/lib/utils/supabase";

export default function AppleSignInButton() {
  if (Platform.OS !== "ios") return null;

  async function onAppleButtonPress() {
    try {
      const appleAuthResponse = await appleAuth.performRequest({
        requestedOperation: AppleRequestOperation.LOGIN,
        // Note: FULL_NAME must be requested before EMAIL per Apple's docs
        requestedScopes: [
          AppleRequestScope.FULL_NAME,
          AppleRequestScope.EMAIL,
        ],
      });

      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthResponse.user,
      );

      if (credentialState !== appleAuth.State.AUTHORIZED) {
        console.error("Apple sign-in: credential state not authorized");
        return;
      }

      const { identityToken, nonce, authorizationCode } = appleAuthResponse;

      if (!identityToken || !authorizationCode) {
        console.error(
          "Apple sign-in: no identity token or authorization code returned",
        );
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: identityToken,
        ...(nonce ? { nonce } : {}),
      });

      if (error) {
        console.error("Apple sign-in Supabase error:", error);
        return;
      }

      router.replace("/");
    } catch (error) {
      console.error("Apple sign-in error:", error);
    }
  }

  return (
    <AppleButton
      buttonStyle={AppleButton.Style.BLACK}
      buttonType={AppleButton.Type.SIGN_IN}
      style={{ width: "100%", height: 45 }}
      onPress={onAppleButtonPress}
    />
  );
}
