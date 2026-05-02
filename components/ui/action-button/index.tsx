import { Pressable, Text } from "react-native";
import { styles } from "./styles";

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  backgroundColor?: string;
};

const ActionButton = ({
  label,
  onPress,
  backgroundColor,
}: ActionButtonProps) => {
  return (
    <Pressable
      style={({ pressed }) => [
        { opacity: pressed ? 0.7 : 1 },
        {
          ...styles.actionButton,
          backgroundColor:
            backgroundColor ?? styles.actionButton.backgroundColor,
        },
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
};

export default ActionButton;
