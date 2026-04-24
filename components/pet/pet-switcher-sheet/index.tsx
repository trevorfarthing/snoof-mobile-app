import { BottomSheet } from "@/components/ui/bottom-sheet";
import { petColors } from "@/constants/colors";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { formatAge } from "@/lib/utils/utils";
import { Database } from "@/types/database.types";
import { Check } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

type Pet = Database["public"]["Tables"]["pets"]["Row"];

function getPetColor(pet: Pet, index: number): string {
  const index_ =
    pet.sort_order != null
      ? pet.sort_order % petColors.length
      : index % petColors.length;
  return petColors[index_];
}

function petMeta(pet: Pet): string {
  const parts: string[] = [];
  if (pet.breed) {
    parts.push(pet.breed);
  }
  if (pet.date_of_birth) {
    parts.push(`${formatAge(pet.date_of_birth)}`);
  }
  return parts.join(" · ");
}

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function PetSwitcherSheet({ visible, onClose }: Props) {
  const { pets, activePet, setActivePet } = usePetStore();

  function handleSelect(pet: Pet) {
    setActivePet(pet);
    onClose();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Switch Pet"
      snapHeight={0.5}
    >
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {pets.map((pet, index) => {
          const isActive = pet.id === activePet?.id;
          const color = getPetColor(pet, index);
          const initial = pet.name.charAt(0).toUpperCase();
          const meta = petMeta(pet);

          return (
            <TouchableOpacity
              key={pet.id}
              style={[styles.petRow, isActive && styles.petRowActive]}
              onPress={() => handleSelect(pet)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${pet.name}`}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.avatar, { backgroundColor: color }]}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>

              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                {meta ? <Text style={styles.petMeta}>{meta}</Text> : null}
              </View>

              {isActive && (
                <View style={styles.checkmark}>
                  <Check size={12} color="#fff" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}
