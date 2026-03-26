import { expo } from "@/app.json";
import { supabase } from "@/lib/utils/supabase";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Alert, Text, TouchableOpacity, StyleSheet, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

function extractParamsFromUrl(url: string) {
  const parsedUrl = new URL(url);
  const hash = parsedUrl.hash.substring(1); // remove leading '#'
  const params = new URLSearchParams(hash);

  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    expires_in: parseInt(params.get("expires_in") || "0"),
    token_type: params.get("token_type"),
    provider_token: params.get("provider_token"),
  };
}

export default function GoogleSignInButton() {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  async function onSignInButtonPress() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${expo.scheme}://google-auth`,
        queryParams: { prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      Alert.alert("Google Sign-In Error", error?.message ?? "No OAuth URL returned");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      `${expo.scheme}://google-auth`,
      { showInRecents: true },
    );

    if (result.type === "success") {
      const params = extractParamsFromUrl(result.url);

      if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (sessionError) {
          Alert.alert("Google Sign-In Error", sessionError.message);
        }
      }
    }
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onSignInButtonPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: "https://developers.google.com/identity/images/g-logo.png" }}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.text}>Sign in with Google</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 45,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 20,
    height: 20,
  },
  text: {
    fontSize: 16,
    color: "#757575",
    fontWeight: "500",
  },
});
