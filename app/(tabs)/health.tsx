import { colors } from "@/constants/colors";
import { fonts } from "@/constants/fonts";
import { Text, View } from "react-native";

const HealthScreen = () => {
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
        Health
      </Text>
    </View>
  );
};

export default HealthScreen;
