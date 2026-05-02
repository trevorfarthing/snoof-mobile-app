import {
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  Text,
  ViewStyle,
} from "react-native";
import { styles } from "./styles";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
  disabled?: boolean;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

const ActionButton = ({
  label,
  onPress,
  backgroundColor,
  disabled,
  style,
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
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
};

export default ActionButton;
