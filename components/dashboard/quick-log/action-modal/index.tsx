import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Pressable, Text, View } from "react-native";
import { ACTIVITY_CONFIG, ActivityType } from "../activity-config";
import { styles } from "./styles";
import { WalkForm } from "./walk-form";

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
  const isWalk = activityType === "walk";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={config.label}
      subtitle={`Log a ${config.label.toLowerCase()} for your pet`}
      snapHeight={isWalk ? 0.9 : 0.5}
    >
      {isWalk ? (
        <WalkForm onClose={onClose} onLogged={() => onLogged?.(activityType)} />
      ) : (
        <PlaceholderForm
          activityType={activityType}
          label={config.label}
          onClose={onClose}
          onLogged={onLogged}
        />
      )}
    </BottomSheet>
  );
}

type PlaceholderProps = {
  activityType: ActivityType;
  label: string;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
};

function PlaceholderForm({
  activityType,
  label,
  onClose,
  onLogged,
}: PlaceholderProps) {
  const handleLog = () => {
    onLogged?.(activityType);
    onClose();
  };

  return (
    <>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Log details for {label} will go here.
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 },
          styles.logButton,
        ]}
        onPress={handleLog}
      >
        <Text style={styles.logButtonText}>Log {label}</Text>
      </Pressable>
    </>
  );
}
