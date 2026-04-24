import { colors } from "@/constants/colors";
import { CheckCircle2 } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Modal, Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  visible: boolean;
  message: string;
  onHide: () => void;
  duration?: number;
};

const ENTER_OFFSET = 60;

export const Toast = ({ visible, message, onHide, duration = 2400 }: Props) => {
  const translateY = useRef(new Animated.Value(ENTER_OFFSET)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    translateY.setValue(ENTER_OFFSET);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: ENTER_OFFSET,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, duration, onHide, translateY, opacity]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      {/* pointerEvents="box-none" lets touches pass through to the underlying UI
          while the toast itself remains non-interactive. */}
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[styles.toast, { opacity, transform: [{ translateY }] }]}
          pointerEvents="none"
        >
          <CheckCircle2 size={20} color={colors.success} strokeWidth={2.5} />
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};
