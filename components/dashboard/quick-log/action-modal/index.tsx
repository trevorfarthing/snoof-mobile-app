import { Pressable, Text, View } from "react-native";
import { ACTIVITY_CONFIG, ActivityType } from "../activity-config";
import { FeedingForm } from "./feeding-form";
import { PottyForm } from "./potty-form";
import { styles } from "./styles";
import { WalkForm } from "./walk-form";

type ActionModalProps = {
  activityType: ActivityType | null;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
};

export const ActionModal = ({
  activityType,
  onClose,
  onLogged,
}: ActionModalProps) => {
  if (!activityType) {
    return null;
  }

  const config = ACTIVITY_CONFIG[activityType];

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

  return <>{renderForm()}</>;
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
