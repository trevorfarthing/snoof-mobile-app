import { supabase } from "@/lib/utils/supabase";
import { Button } from "react-native";

const onSignOutButtonPress = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
  }
};

const SignOutButton = () => {
  return <Button title="Sign out" onPress={onSignOutButtonPress} />;
};

export default SignOutButton;
