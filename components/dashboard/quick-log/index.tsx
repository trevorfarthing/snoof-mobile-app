import { ActivityButton } from "@/components/ui/activity-button";
import { useQuickLogPresets } from "@/lib/hooks/use-quick-log-presets";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ActionModal } from "./action-modal";
import { ACTIVITY_CONFIG, ActivityType } from "./activity-config";
import { EditModal } from "./edit-modal";
import { MoreModal } from "./more-modal";
import { styles } from "./styles";
import { ActiveModal } from "./types";

export function QuickLog() {
  const { presets, savePresets } = useQuickLogPresets();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const handleLogged = (type: ActivityType) => {
    // TODO: Trigger haptic feedback with a toast and send request to log the activity
  };

  const openModal = (modal: ActiveModal) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // The active preset action modal (Walk/Feed/Potty/Meds)
  const activePresetType =
    activeModal !== null && activeModal !== "more" && activeModal !== "edit"
      ? (activeModal as ActivityType)
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Quick log</Text>
        <Pressable onPress={() => openModal("edit")}>
          <Text style={styles.editLink}>Edit ›</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        {presets.map((type) => {
          const config = ACTIVITY_CONFIG[type];
          return (
            <ActivityButton
              key={type}
              label={config.label}
              IconComponent={config.IconComponent}
              iconBg={config.iconBg}
              iconColor={config.iconColor}
              onPress={() => openModal(type)}
            />
          );
        })}

        <ActivityButton
          label="More"
          IconComponent={ACTIVITY_CONFIG.other.IconComponent}
          iconBg="transparent"
          variant="more"
          onPress={() => openModal("more")}
        />
      </View>

      <ActionModal
        activityType={activePresetType}
        visible={activePresetType !== null}
        onClose={closeModal}
        onLogged={handleLogged}
      />

      <MoreModal
        visible={activeModal === "more"}
        onClose={closeModal}
        onLogged={handleLogged}
      />

      <EditModal
        visible={activeModal === "edit"}
        onClose={closeModal}
        presets={presets}
        onSave={savePresets}
      />
    </View>
  );
}
