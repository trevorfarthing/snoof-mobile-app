import { colors } from "@/constants/colors";
import { Pencil, Trash2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";

type Props = {
  editing: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

// Banner shown above the form when viewing an existing log. Edit flips the
// form into editable mode; Delete prompts a confirm and then removes the log.
// Both actions are hidden once `editing` is true.
export const ReadOnlyBanner = ({ editing, onEdit, onDelete }: Props) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {editing ? "Editing log" : "Viewing log"}
      </Text>
      {!editing ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onEdit}
          >
            <Pencil size={12} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onDelete}
            accessibilityLabel="Delete log"
          >
            <Trash2 size={14} color={colors.textInverse} strokeWidth={2.5} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};
