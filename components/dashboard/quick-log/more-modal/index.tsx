import ActionButton from "@/components/ui/action-button";
import { colors } from "@/constants/colors";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  ACTIVITY_CONFIG,
  ActivityType,
  DAILY_CARE_TYPES,
  HEALTH_NOTE_TYPES,
} from "../activity-config";
import { ActiveModal } from "../types";
import { styles } from "./styles";

type MoreModalProps = {
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
  openModal: (modal: ActiveModal) => void;
};

export const MoreModal = ({ onClose, onLogged, openModal }: MoreModalProps) => {
  const [selected, setSelected] = useState<ActivityType | null>(null);

  const handleLog = () => {
    if (!selected) {
      return;
    }
    setSelected(null);
    onClose();
    openModal(selected);
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ActivitySection
          label="Daily care"
          types={DAILY_CARE_TYPES}
          selected={selected}
          onSelect={setSelected}
        />
        <ActivitySection
          label="Health & notes"
          types={HEALTH_NOTE_TYPES}
          selected={selected}
          onSelect={setSelected}
        />
      </ScrollView>

      <ActionButton
        onPress={handleLog}
        label={selected ? `Log ${ACTIVITY_CONFIG[selected].label}` : "Log now"}
        disabled={!selected}
      />
    </>
  );
};

const ActivitySection = ({
  label,
  types,
  selected,
  onSelect,
}: {
  label: string;
  types: ActivityType[];
  selected: ActivityType | null;
  onSelect: (t: ActivityType) => void;
}) => {
  return (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.grid}>
        {types.map((type) => {
          const config = ACTIVITY_CONFIG[type];
          const isSelected = selected === type;
          return (
            <Pressable
              key={type}
              style={[
                styles.activityItem,
                isSelected && styles.activityItemSelected,
              ]}
              onPress={() => onSelect(type)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: config.iconBg },
                ]}
              >
                <config.IconComponent
                  size={16}
                  color={isSelected ? colors.primary : colors.textPrimary}
                  strokeWidth={1.75}
                  stroke={config.iconColor || colors.textPrimary}
                />
              </View>
              <Text
                style={[
                  styles.activityLabel,
                  isSelected && styles.activityLabelSelected,
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
};
