import { colors } from "@/constants/colors";
import { Pencil } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  editing: boolean;
  onEdit: () => void;
};

// Banner shown above the form when viewing an existing log. Tapping Edit flips
// the form into editable mode (saving the changes is not yet wired up).
export const ReadOnlyBanner = ({ editing, onEdit }: Props) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {editing ? "Editing log" : "Viewing log"}
      </Text>
      {!editing ? (
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onEdit}
        >
          <Pencil size={12} color={colors.primary} strokeWidth={2.5} />
          <Text style={styles.buttonText}>Edit</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
