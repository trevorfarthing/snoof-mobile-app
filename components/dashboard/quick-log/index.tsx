import { ActivityButton } from "@/components/ui/activity-button";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Toast } from "@/components/ui/toast";
import { useQuickLogPresets } from "@/lib/hooks/use-quick-log-presets";
import * as Haptics from "expo-haptics";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ActionModal } from "./action-modal";
import { ACTIVITY_CONFIG, ActivityType } from "./activity-config";
import { EditModal } from "./edit-modal";
import { MoreModal } from "./more-modal";
import { styles } from "./styles";
import { ActiveModal } from "./types";

type QuickLogProps = {
  onRefresh: () => void;
  onLogged?: (type: ActivityType) => void;
};

export const QuickLog = ({ onRefresh, onLogged }: QuickLogProps) => {
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

    onLogged?.(type);
    onRefresh?.();
  };

  const openModal = (modal: ActiveModal) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  // The active preset action modal (Walk/Feed/Potty/Meds)
  const activePresetType =
    activeModal !== null && activeModal !== "more" && activeModal !== "edit"
      ? (activeModal as ActivityType)
      : null;

  // Modal is visible for any of these conditions. Content is swapped in and out to prevent re-render flickering
  const isModalVisible =
    activePresetType !== null ||
    activeModal === "more" ||
    activeModal === "edit";

  const getModalDetails = () => {
    if (activePresetType) {
      const config = ACTIVITY_CONFIG[activePresetType];
      const isTallForm =
        activePresetType === "walk" ||
        activePresetType === "feeding" ||
        activePresetType === "potty";

      return {
        title: config.label,
        subtitle: `Log a ${config.label.toLowerCase()} for your pet`,
        snapHeight: isTallForm ? 0.9 : 0.5,
      };
    } else if (activeModal === "more") {
      return {
        title: "Log an activity",
        subtitle: "Tap an activity to log it",
        snapHeight: 0.85,
      };
    } else if (activeModal === "edit") {
      return {
        title: "Quick log buttons",
        subtitle: "Your 4 shortcuts — tap ✕ to remove",
        snapHeight: 0.9,
      };
    }
    return null;
  };
  const modalDetails = useMemo(getModalDetails, [
    ,
    activeModal,
    activePresetType,
  ]);

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

      <BottomSheet
        visible={isModalVisible}
        onClose={closeModal}
        title={modalDetails?.title}
        subtitle={modalDetails?.subtitle}
        snapHeight={modalDetails?.snapHeight}
      >
        {activePresetType !== null && (
          <ActionModal
            activityType={activePresetType}
            onClose={closeModal}
            onLogged={handleLogged}
          />
        )}

        {activeModal === "more" && (
          <MoreModal
            onClose={closeModal}
            onLogged={handleLogged}
            openModal={openModal}
          />
        )}

        {activeModal === "edit" && (
          <EditModal
            visible={activeModal === "edit"}
            onClose={closeModal}
            presets={presets}
            onSave={savePresets}
          />
        )}
      </BottomSheet>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};
