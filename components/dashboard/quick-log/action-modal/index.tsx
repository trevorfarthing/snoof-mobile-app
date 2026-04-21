import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Pressable, Text, View } from "react-native";
import { ACTIVITY_CONFIG, ActivityType } from "../activity-config";
import { styles } from "./styles";

type ActionModalProps = {
  activityType: ActivityType | null;
  visible: boolean;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
};

export function ActionModal({
  activityType,
  visible,
  onClose,
  onLogged,
}: ActionModalProps) {
  if (!activityType) {
    return null;
  }

  const config = ACTIVITY_CONFIG[activityType];

  const handleLog = () => {
    onLogged?.(activityType);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={config.label}
      subtitle={`Log a ${config.label.toLowerCase()} for your pet`}
      snapHeight={0.5}
    >
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Log details for {config.label} will go here.
        </Text>
      </View>

      <Pressable style={styles.logButton} onPress={handleLog}>
        <Text style={styles.logButtonText}>Log {config.label}</Text>
      </Pressable>
    </BottomSheet>
  );
}
