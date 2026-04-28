import { ActivityButton } from "@/components/ui/activity-button";
import { Toast } from "@/components/ui/toast";
import { useQuickLogPresets } from "@/lib/hooks/use-quick-log-presets";
import * as Haptics from "expo-haptics";
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
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleLogged = (type: ActivityType) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    /* Toast and BottomSheet both render as <Modal>. iOS only reliably presents
      one transparent modal at a time, so if the toast mounts in the same
      commit that the bottom sheet is dismissing, iOS silently drops the
      toast presentation. The race is hidden when the form's collapsible
      details section is collapsed (no in-flight reanimated layout/exit
      animations to extend the bottom sheet's dismiss window) but reliably
      reproduces when it's expanded. Deferring past the native dismiss
      animation (~280ms) lets the toast modal present cleanly.*/
    setTimeout(() => {
      setToastMessage(`${ACTIVITY_CONFIG[type].label} logged`);
      setToastVisible(true);
    }, 350);
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

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}
