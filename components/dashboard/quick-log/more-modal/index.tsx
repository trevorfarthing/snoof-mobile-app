import { BottomSheet } from "@/components/ui/bottom-sheet";
import { colors } from "@/constants/colors";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  ACTIVITY_CONFIG,
  ActivityType,
  DAILY_CARE_TYPES,
  HEALTH_NOTE_TYPES,
} from "../activity-config";
import { styles } from "./styles";

type MoreModalProps = {
  visible: boolean;
  onClose: () => void;
  onLogged?: (type: ActivityType) => void;
};

export function MoreModal({ visible, onClose, onLogged }: MoreModalProps) {
  const [selected, setSelected] = useState<ActivityType | null>(null);

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  const handleLog = () => {
    if (!selected) {
      return;
    }
    onLogged?.(selected);
    setSelected(null);
    onClose();
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="Log an activity"
      subtitle="Tap an activity to log it"
      snapHeight={0.85}
    >
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

      <Pressable
        style={[styles.logButton, !selected && styles.logButtonDisabled]}
        onPress={handleLog}
        disabled={!selected}
      >
        <Text style={styles.logButtonText}>
          {selected ? `Log ${ACTIVITY_CONFIG[selected].label}` : "Log now"}
        </Text>
      </Pressable>
    </BottomSheet>
  );
}

function ActivitySection({
  label,
  types,
  selected,
  onSelect,
}: {
  label: string;
  types: ActivityType[];
  selected: ActivityType | null;
  onSelect: (t: ActivityType) => void;
}) {
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
}
