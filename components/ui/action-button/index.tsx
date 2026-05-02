import { colors } from "@/constants/colors";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";
import { styles } from "./styles";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  isTextButton?: boolean;
};

const ActionButton = ({
  label,
  onPress,
  backgroundColor,
  disabled,
  style,
  isTextButton,
}: ActionButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        { opacity: pressed || disabled ? 0.7 : 1 },
        {
          ...styles.actionButton,
          backgroundColor:
            backgroundColor ?? styles.actionButton.backgroundColor,
        },
        { ...(isTextButton ? { backgroundColor: colors.transparent } : {}) },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text
        style={{
          ...styles.actionButtonText,
          ...(isTextButton ? { color: colors.textPrimary } : {}),
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default ActionButton;
