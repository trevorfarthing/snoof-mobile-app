import React, { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/utils/supabase";
import AppleSignInButton from "./social-auth-buttons/apple-sign-in-button.ios";
import GoogleSignInButton from "./social-auth-buttons/google-sign-in-button";
import styles from "./styles";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    }
    if (!session) {
      Alert.alert("Please check your inbox for email verification!");
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => signInWithEmail()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticallySpaced}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => signUpWithEmail()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider}>
        <Text style={styles.dividerText}>or continue with</Text>
      </View>
      <View style={styles.verticallySpaced}>
        <GoogleSignInButton />
      </View>
      {Platform.OS === "ios" ? (
        <View style={styles.verticallySpaced}>
          <AppleSignInButton />
        </View>
      ) : (
        <></>
      )}
    </View>
  );
}
