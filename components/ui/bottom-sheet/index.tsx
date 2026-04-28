import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { styles } from "./styles";
import { BottomSheetProps } from "./types";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export const BottomSheet = ({
  visible,
  onClose,
  title,
  subtitle,
  snapHeight = 0.6,
  children,
}: BottomSheetProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 4,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          translateY.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 80 || gs.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            damping: 20,
            stiffness: 200,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 280,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible]);

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouch} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: SCREEN_HEIGHT * snapHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View
            style={{ paddingVertical: 10, alignItems: "center" }}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};
