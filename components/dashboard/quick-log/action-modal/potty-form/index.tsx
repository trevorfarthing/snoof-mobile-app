import { usePottyForm } from "@/lib/hooks/activity-logs/use-potty-form";
import { useAuthContext } from "@/lib/hooks/use-auth-context";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { NOTES_CHAR_LIMIT } from "@/lib/utils/constants";
import { Check } from "lucide-react-native";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { CollapsibleSection } from "../shared/collapsible-section";
import { MultiSelectorGrid } from "../shared/multi-selector-grid";
import { SelectorGrid } from "../shared/selector-grid";
import { CONSISTENCY_OPTIONS, POTTY_TYPE_OPTIONS } from "./options";
import { styles } from "./styles";

type Props = {
  onClose: () => void;
  onLogged?: () => void;
};

export const PottyForm = ({ onClose, onLogged }: Props) => {
  const { activePet } = usePetStore();
  const { session } = useAuthContext();
  const form = usePottyForm();

  const userId = session?.user?.id;

  const handleSubmit = async () => {
    if (!activePet || !userId) {
      form.setError("You must be signed in with an active pet");
      return;
    }
    const { error } = await form.submit({
      petId: activePet.id,
      householdId: activePet.household_id,
      userId,
    });
    if (error) {
      return;
    }
    form.reset();
    onLogged?.();
    onClose();
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <MultiSelectorGrid
          label="Potty type"
          options={POTTY_TYPE_OPTIONS}
          values={form.pottyTypes}
          onChange={form.setPottyTypes}
        />

        {form.error ? <Text style={styles.errorText}>{form.error}</Text> : null}

        <CollapsibleSection
          title="Details"
          expanded={form.detailsExpanded}
          onToggle={() => form.setDetailsExpanded(!form.detailsExpanded)}
        >
          <SelectorGrid
            label="Consistency"
            options={CONSISTENCY_OPTIONS}
            value={form.consistency}
            onChange={form.setConsistency}
            disabled={!form.isPooSelected}
          />

          <View style={styles.locationField}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput
              style={styles.locationInput}
              value={form.location}
              onChangeText={form.setLocation}
              placeholder="Backyard, sidewalk, etc."
              placeholderTextColor="#C8B9A4"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.accidentRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => form.setIsAccident(!form.isAccident)}
          >
            <View
              style={[
                styles.checkbox,
                form.isAccident && styles.checkboxChecked,
              ]}
            >
              {form.isAccident ? (
                <Check size={14} color="#fff" strokeWidth={3} />
              ) : null}
            </View>
            <Text style={styles.checkboxLabel}>Accident?</Text>
          </Pressable>

          <View style={styles.notesField}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={form.notes}
              onChangeText={form.setNotes}
              placeholder="Anything notable about this potty?"
              placeholderTextColor="#C8B9A4"
              multiline
              maxLength={NOTES_CHAR_LIMIT}
              textAlignVertical="top"
            />
            <Text style={styles.notesCounter}>
              {form.notes.length}/{NOTES_CHAR_LIMIT}
            </Text>
          </View>
        </CollapsibleSection>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          { opacity: pressed || form.submitting ? 0.7 : 1 },
          styles.logButton,
        ]}
        onPress={handleSubmit}
        disabled={form.submitting}
      >
        <Text style={styles.logButtonText}>
          {form.submitting ? "Logging…" : "Log Potty"}
        </Text>
      </Pressable>
    </>
  );
};
