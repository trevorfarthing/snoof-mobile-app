import SignOutButton from "@/components/auth/social-auth-buttons/sign-out-button";
import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { Text, View } from "react-native";

const PetScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bgBase,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontFamily: fonts.nunitoSemiBold,
          color: colors.textPrimary,
        }}
      >
        Pet Profile
      </Text>
      <SignOutButton />
    </View>
  );
};

export default PetScreen;
