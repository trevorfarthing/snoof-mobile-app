import ActionButton from "@/components/ui/action-button";
import {
  usePottyForm,
  type PottyFormInitialValues,
} from "@/lib/hooks/activity-logs/use-potty-form";
import { useAuthContext } from "@/lib/hooks/use-auth-context";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { NOTES_CHAR_LIMIT } from "@/lib/utils/constants";
import { Check } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { CollapsibleSection } from "../shared/collapsible-section";
import { MultiSelectorGrid } from "../shared/multi-selector-grid";
import { ReadOnlyBanner } from "../shared/read-only-banner";
import { SelectorGrid } from "../shared/selector-grid";
import { CONSISTENCY_OPTIONS, POTTY_TYPE_OPTIONS } from "./options";
import { styles } from "./styles";

type Props = {
  onClose: () => void;
  onLogged?: () => void;
  readOnly?: boolean;
  initialValues?: PottyFormInitialValues;
};

export const PottyForm = ({
  onClose,
  onLogged,
  readOnly = false,
  initialValues,
}: Props) => {
  const { activePet } = usePetStore();
  const { session } = useAuthContext();
  const form = usePottyForm(initialValues);
  const [editing, setEditing] = useState(false);
  const inputsDisabled = readOnly && !editing;

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
        {readOnly ? (
          <ReadOnlyBanner editing={editing} onEdit={() => setEditing(true)} />
        ) : null}
        <View
          pointerEvents={inputsDisabled ? "none" : "auto"}
          style={{ opacity: inputsDisabled ? 0.65 : 1 }}
        >
          <MultiSelectorGrid
            label="Potty type"
            options={POTTY_TYPE_OPTIONS}
            values={form.pottyTypes}
            onChange={form.setPottyTypes}
          />

          {form.error ? (
            <Text style={styles.errorText}>{form.error}</Text>
          ) : null}

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
                maxLength={150}
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
        </View>
      </ScrollView>

      {!readOnly ? (
        <ActionButton
          onPress={handleSubmit}
          label={form.submitting ? "Logging…" : "Log Potty"}
          disabled={form.submitting}
        />
      ) : null}

      {editing && (
        <>
          <ActionButton
            onPress={handleSubmit}
            label={form.submitting ? "Updating..." : "Update Log"}
            disabled={form.submitting}
          />
          <ActionButton
            onPress={() => {
              onClose?.();
            }}
            label="Cancel"
            isTextButton={true}
            disabled={form.submitting}
          />
        </>
      )}
    </>
  );
};
