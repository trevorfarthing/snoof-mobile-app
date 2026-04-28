import { colors } from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { PlusCircle, X } from "lucide-react-native";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { ActivityButtonProps } from "./types";

export const ActivityButton = ({
  label,
  IconComponent,
  iconBg,
  iconColor,
  onPress,
  variant = "default",
  removable = false,
  onRemove,
}: ActivityButtonProps) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (variant === "more") {
    return (
      <Pressable style={styles.buttonMore} onPress={handlePress}>
        <View style={styles.iconContainer}>
          <PlusCircle size={22} color="#C8B9A4" strokeWidth={1.5} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.button]}
        onPress={handlePress}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <IconComponent
            size={18}
            color={colors.textPrimary}
            stroke={iconColor || colors.textPrimary}
            strokeWidth={1.75}
          />
        </View>
        <Text style={[styles.label]}>{label}</Text>
      </Pressable>

      {removable && (
        <TouchableOpacity style={styles.removeBadge} onPress={onRemove}>
          <X size={9} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
};
