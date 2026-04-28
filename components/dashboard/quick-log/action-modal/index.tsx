import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Pressable, Text, View } from "react-native";
import { ACTIVITY_CONFIG, ActivityType } from "../activity-config";
import { FeedingForm } from "./feeding-form";
import { PottyForm } from "./potty-form";
import { styles } from "./styles";
import { WalkForm } from "./walk-form";

type ActionModalProps = {
  activityType: ActivityType | null;
  visible: boolean;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
};

export const ActionModal = ({
  activityType,
  visible,
  onClose,
  onLogged,
}: ActionModalProps) => {
  if (!activityType) {
    return null;
  }

  const config = ACTIVITY_CONFIG[activityType];
  // Forms with many fields (Walk, Feeding, Potty) need a taller sheet so the
  // submit button isn't pushed off-screen.
  const isTallForm =
    activityType === "walk" ||
    activityType === "feeding" ||
    activityType === "potty";

  const renderForm = () => {
    switch (activityType) {
      case "walk": {
        return (
          <WalkForm
            onClose={onClose}
            onLogged={() => onLogged?.(activityType)}
          />
        );
      }
      case "feeding": {
        return (
          <FeedingForm
            onClose={onClose}
            onLogged={() => onLogged?.(activityType)}
          />
        );
      }
      case "potty": {
        return (
          <PottyForm
            onClose={onClose}
            onLogged={() => onLogged?.(activityType)}
          />
        );
      }
      default: {
        return (
          <PlaceholderForm
            activityType={activityType}
            label={config.label}
            onClose={onClose}
            onLogged={onLogged}
          />
        );
      }
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={config.label}
      subtitle={`Log a ${config.label.toLowerCase()} for your pet`}
      snapHeight={isTallForm ? 0.9 : 0.5}
    >
      {renderForm()}
    </BottomSheet>
  );
};

type PlaceholderProps = {
  activityType: ActivityType;
  label: string;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
};

const PlaceholderForm = ({
  activityType,
  label,
  onClose,
  onLogged,
}: PlaceholderProps) => {
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
};
