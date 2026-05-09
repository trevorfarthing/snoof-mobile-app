import { colors, petColors } from "@/constants/colors";
import { PetSwitcherSheet } from "@/components/pet/pet-switcher-sheet";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { Database } from "@/types/database.types";
import { ChevronDown, Cog, MessageSquare } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./styles";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

const getPetColor = (pet: Pet, index: number): string => {
  const index_ =
    pet.sort_order != null
      ? pet.sort_order % petColors.length
      : index % petColors.length;
  return petColors[index_];
};

export const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const { activePet, pets, fetchPets } = usePetStore();
  const [switcherVisible, setSwitcherVisible] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const activePetIndex = pets.findIndex((p) => p.id === activePet?.id);
  const avatarColor = activePet
    ? getPetColor(activePet, Math.max(activePetIndex, 0))
    : colors.bgWarm;
  const avatarInitial = activePet
    ? activePet.name.charAt(0).toUpperCase()
    : "?";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        {/* Settings button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            // TODO: open settings screen
          }}
          activeOpacity={0.7}
          accessibilityLabel="Settings"
          accessibilityRole="button"
        >
          <Cog size={18} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>

        {/* Pet switcher pill */}
        <TouchableOpacity
          style={styles.petPill}
          onPress={() => setSwitcherVisible(true)}
          activeOpacity={0.7}
          accessibilityLabel={`Active pet: ${activePet?.name ?? "No pet selected"}. Tap to switch.`}
          accessibilityRole="button"
        >
          <View style={[styles.petAvatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.petAvatarInitial}>{avatarInitial}</Text>
          </View>
          <Text style={styles.petName} numberOfLines={1}>
            {activePet?.name ?? "Select Pet"}
          </Text>
          <ChevronDown
            size={12}
            color={colors.textTertiary}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* Snoof AI message button */}
        <View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // TODO: navigate to Snoof AI tab
            }}
            activeOpacity={0.7}
            accessibilityLabel="Snoof AI"
            accessibilityRole="button"
          >
            <MessageSquare
              size={18}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>
          {/* Notification dot */}
          <View style={styles.notificationDot} />
        </View>
      </View>

      <PetSwitcherSheet
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
      />
    </View>
  );
};
