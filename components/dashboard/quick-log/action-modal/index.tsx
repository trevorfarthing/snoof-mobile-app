import type { FeedingFormInitialValues } from "@/lib/hooks/activity-logs/use-feeding-form";
import type { PottyFormInitialValues } from "@/lib/hooks/activity-logs/use-potty-form";
import type { WalkFormInitialValues } from "@/lib/hooks/activity-logs/use-walk-form";
import { Pressable, Text, View } from "react-native";
import { ACTIVITY_CONFIG, ActivityType } from "../activity-config";
import { FeedingForm } from "./feeding-form";
import { PottyForm } from "./potty-form";
import { styles } from "./styles";
import { WalkForm } from "./walk-form";

export type ActionModalInitialValues = {
  walk?: WalkFormInitialValues;
  feeding?: FeedingFormInitialValues;
  potty?: PottyFormInitialValues;
};

type ActionModalProps = {
  activityType: ActivityType | null;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
  readOnly?: boolean;
  initialValues?: ActionModalInitialValues;
};

export const ActionModal = ({
  activityType,
  onClose,
  onLogged,
  readOnly = false,
  initialValues,
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
            readOnly={readOnly}
            initialValues={initialValues?.walk}
          />
        );
      }
      case "feeding": {
        return (
          <FeedingForm
            onClose={onClose}
            onLogged={() => onLogged?.(activityType)}
            readOnly={readOnly}
            initialValues={initialValues?.feeding}
          />
        );
      }
      case "potty": {
        return (
          <PottyForm
            onClose={onClose}
            onLogged={() => onLogged?.(activityType)}
            readOnly={readOnly}
            initialValues={initialValues?.potty}
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
