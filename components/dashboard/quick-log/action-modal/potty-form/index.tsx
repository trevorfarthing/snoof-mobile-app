import ActionButton from "@/components/ui/action-button";
import {
  usePottyForm,
  type PottyFormInitialValues,
} from "@/lib/hooks/activity-logs/use-potty-form";
import { NOTES_CHAR_LIMIT } from "@/lib/utils/constants";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Check } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { CollapsibleSection } from "../shared/collapsible-section";
import { MultiSelectorGrid } from "../shared/multi-selector-grid";
import { ReadOnlyBanner } from "../shared/read-only-banner";
import { SelectorGrid } from "../shared/selector-grid";
import { useLogActions } from "../shared/use-log-actions";
import { CONSISTENCY_OPTIONS, POTTY_TYPE_OPTIONS } from "./options";
import { styles } from "./styles";

type Props = {
  onClose: () => void;
  onLogged?: () => void;
  readOnly?: boolean;
  initialValues?: PottyFormInitialValues;
};

const formatTime = (d: Date): string =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const PottyForm = ({
  onClose,
  onLogged,
  readOnly = false,
  initialValues,
}: Props) => {
  const form = usePottyForm(initialValues);
  const { handleSubmit, handleUpdate, handleDelete } = useLogActions({
    form,
    label: "potty",
    onLogged,
    onClose,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputsDisabled = readOnly && !editing;

  // Snapshot of the initial value at picker-open time. Stays referentially
  // stable for the picker's lifetime — passing form.occurredAt directly creates
  // a new Date() on every render and resets the iOS spinner's scroll position.
  const pickerInitial = useRef<Date>(new Date());

  const togglePicker = () => {
    if (pickerOpen) {
      setPickerOpen(false);
      return;
    }
    pickerInitial.current = form.occurredAt ?? new Date();
    setPickerOpen(true);
  };

  // Android's DateTimePicker is a one-shot modal — once the user picks or
  // dismisses, we unmount it. iOS renders the picker as an inline spinner, so
  // we keep it mounted until the user taps the field again to close.
  const handleTimeChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setPickerOpen(false);
    }
    if (!date) {
      return;
    }
    form.setOccurredAt(date);
  };

  // Bound the picker to today so users can backfill earlier in the day but
  // can't pick a future time or wander to other days.
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 0, 0);

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {readOnly ? (
          <ReadOnlyBanner
            editing={editing}
            onEdit={() => setEditing(true)}
            onDelete={handleDelete}
          />
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

            <View style={styles.timeField}>
              <Text style={styles.fieldLabel}>Time</Text>
              <Pressable style={styles.timeButton} onPress={togglePicker}>
                <Text
                  style={
                    form.occurredAt ? styles.timeValue : styles.timePlaceholder
                  }
                >
                  {form.occurredAt ? formatTime(form.occurredAt) : "Now"}
                </Text>
              </Pressable>
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

      {/* Picker renders OUTSIDE the ScrollView so the spinner's vertical scroll
          gestures aren't stolen by the parent ScrollView. */}
      {pickerOpen ? (
        <DateTimePicker
          value={pickerInitial.current}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleTimeChange}
          minimumDate={dayStart}
          maximumDate={dayEnd}
        />
      ) : null}

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
            onPress={handleUpdate}
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
