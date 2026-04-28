import { colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { GripHorizontal } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ReAnimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  ACTIVITY_CONFIG,
  ActivityType,
  DAILY_CARE_TYPES,
  HEALTH_NOTE_TYPES,
} from "../activity-config";
import { styles } from "./styles";

type EditModalProps = {
  visible: boolean;
  onClose: () => void;
  presets: ActivityType[];
  onSave: (presets: ActivityType[]) => void;
};

export const EditModal = ({
  visible,
  onClose,
  presets,
  onSave,
}: EditModalProps) => {
  const [localPresets, setLocalPresets] =
    useState<(ActivityType | null)[]>(presets);

  // Sync from parent when modal opens
  const prevVisible = useRef(false);
  if (visible && !prevVisible.current) {
    prevVisible.current = true;
    if (JSON.stringify(localPresets) !== JSON.stringify(presets)) {
      setLocalPresets([...presets]);
    }
  }
  if (!visible) {
    prevVisible.current = false;
  }

  const availableTypes = [...DAILY_CARE_TYPES, ...HEALTH_NOTE_TYPES].filter(
    (t) => !localPresets.includes(t),
  );

  const handleRemove = (index: number) => {
    const next = [...localPresets];
    next[index] = null;
    setLocalPresets(next);
  };

  const handleAdd = (type: ActivityType) => {
    const emptyIndex = localPresets.indexOf(null);
    if (emptyIndex === -1) {
      return;
    }
    const next = [...localPresets];
    next[emptyIndex] = type;
    setLocalPresets(next);
  };

  const handleDone = () => {
    const filled = localPresets.filter((p): p is ActivityType => p !== null);
    const final: ActivityType[] = [
      ...filled,
      ...presets.filter((p) => !filled.includes(p)),
    ].slice(0, 4);
    onSave(final);
    onClose();
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <DragHint />

        <DraggablePresets
          presets={localPresets}
          onRemove={handleRemove}
          onReorder={setLocalPresets}
        />

        {availableTypes.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Add to quick log</Text>
            <View style={styles.availableGrid}>
              {availableTypes.map((type) => {
                const config = ACTIVITY_CONFIG[type];
                return (
                  <Pressable
                    key={type}
                    style={styles.availableItem}
                    onPress={() => handleAdd(type)}
                  >
                    <View
                      style={[
                        styles.availableIconContainer,
                        { backgroundColor: config.iconBg },
                      ]}
                    >
                      <config.IconComponent
                        size={16}
                        color="#3D3224"
                        strokeWidth={1.75}
                        stroke={config.iconColor || colors.textPrimary}
                      />
                    </View>
                    <Text style={styles.availableLabel}>{config.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          { opacity: pressed ? 0.7 : 1 },
          styles.doneButton,
        ]}
        onPress={handleDone}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>

      {/* //TODO: Add "Restore Defaults" button here*/}
    </>
  );
};

const DragHint = () => {
  return (
    <View style={styles.dragHint}>
      <GripHorizontal
        size={14}
        color={colors.textTertiary}
        strokeWidth={1.75}
      />
      <Text style={styles.dragHintText}>Hold and drag to reorder</Text>
    </View>
  );
};

type DraggablePresetsProps = {
  presets: (ActivityType | null)[];
  onRemove: (index: number) => void;
  onReorder: (next: (ActivityType | null)[]) => void;
};

const DraggablePresets = ({
  presets,
  onRemove,
  onReorder,
}: DraggablePresetsProps) => {
  const [dragIndex, setDragIndex] = useState(-1);
  const itemWidth = useRef(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    itemWidth.current = (e.nativeEvent.layout.width - 18) / 4;
  };

  const startDrag = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDragIndex(index);
  };

  const endDrag = () => {
    setDragIndex(-1);
  };

  const handleSwap = (currentIndex: number, translationX: number) => {
    const slotsMoved = Math.round(translationX / (itemWidth.current + 6));
    if (slotsMoved === 0) {
      return;
    }
    const targetIndex = Math.max(0, Math.min(3, currentIndex + slotsMoved));
    if (targetIndex === currentIndex) {
      return;
    }

    const next = [...presets];
    const temp = next[currentIndex];
    next[currentIndex] = next[targetIndex];
    next[targetIndex] = temp;
    onReorder(next);
    setDragIndex(targetIndex);
  };

  return (
    <View style={styles.presetsRow} onLayout={handleLayout}>
      {presets.map((type, index) => {
        if (type === null) {
          return <View key={`empty-${index}`} style={styles.emptySlot} />;
        }

        const config = ACTIVITY_CONFIG[type];
        const isDragging = dragIndex === index;

        return (
          <DraggableItem
            key={`${type}-${index}`}
            config={config}
            isDragging={isDragging}
            onRemove={() => onRemove(index)}
            onStartDrag={() => startDrag(index)}
            onEndDrag={(tx: number) => {
              handleSwap(index, tx);
              endDrag();
            }}
          />
        );
      })}
    </View>
  );
};

type DraggableItemProps = {
  config: (typeof ACTIVITY_CONFIG)[ActivityType];
  isDragging: boolean;
  onRemove: () => void;
  onStartDrag: () => void;
  onEndDrag: (translationX: number) => void;
};

const DraggableItem = ({
  config,
  isDragging,
  onRemove,
  onStartDrag,
  onEndDrag,
}: DraggableItemProps) => {
  const tx = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { scale: scale.value }],
    zIndex: isDragging ? 100 : 1,
  }));

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .onStart(() => {
      "worklet";
      scale.value = withSpring(1.06);
      runOnJS(onStartDrag)();
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      tx.value = e.translationX;
    })
    .onEnd((e) => {
      "worklet";
      const finalTx = e.translationX;
      tx.value = withSpring(0);
      scale.value = withSpring(1);
      runOnJS(onEndDrag)(finalTx);
    });

  const composed = Gesture.Simultaneous(longPress, pan);

  return (
    <GestureDetector gesture={composed}>
      <ReAnimated.View
        style={[
          { flex: 1, overflow: "visible" },
          isDragging && styles.dragging,
          animatedStyle,
        ]}
      >
        <View style={{ flex: 1, position: "relative", overflow: "visible" }}>
          <View style={styles.presetItem}>
            <View
              style={[
                styles.availableIconContainer,
                { backgroundColor: config.iconBg },
              ]}
            >
              <config.IconComponent
                size={16}
                color={colors.textPrimary}
                strokeWidth={1.75}
                stroke={config.iconColor || colors.textPrimary}
              />
            </View>
            <Text style={styles.availableLabel}>{config.label}</Text>
          </View>

          <Pressable
            style={{
              position: "absolute",
              top: -5,
              left: -5,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: colors.error,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            onPress={onRemove}
          >
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>
              ✕
            </Text>
          </Pressable>
        </View>
      </ReAnimated.View>
    </GestureDetector>
  );
};
