import ActionButton from "@/components/ui/action-button";
import {
  useFeedingForm,
  type FeedingFormInitialValues,
} from "@/lib/hooks/activity-logs/use-feeding-form";
import { useAuthContext } from "@/lib/hooks/use-auth-context";
import { usePetStore } from "@/lib/stores/use-pet-store";
import { NOTES_CHAR_LIMIT } from "@/lib/utils/constants";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import { ReadOnlyBanner } from "../shared/read-only-banner";
import { SelectorGrid } from "../shared/selector-grid";
import { FOOD_TYPE_OPTIONS, MEAL_OPTIONS, UNIT_OPTIONS } from "./options";
import { styles } from "./styles";

type Props = {
  onClose: () => void;
  onLogged?: () => void;
  readOnly?: boolean;
  initialValues?: FeedingFormInitialValues;
};

const formatTime = (d: Date): string =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const FeedingForm = ({
  onClose,
  onLogged,
  readOnly = false,
  initialValues,
}: Props) => {
  const { activePet } = usePetStore();
  const { session } = useAuthContext();
  const form = useFeedingForm(initialValues);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const inputsDisabled = readOnly && !editing;

  // Snapshot of the initial value at picker-open time. Stays referentially
  // stable for the picker's lifetime — passing form.occurredAt directly creates
  // a new Date() on every render and resets the iOS spinner's scroll position.
  const pickerInitial = useRef<Date>(new Date());

  const userId = session?.user?.id;

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
          <ReadOnlyBanner editing={editing} onEdit={() => setEditing(true)} />
        ) : null}
        <View
          pointerEvents={inputsDisabled ? "none" : "auto"}
          style={{ opacity: inputsDisabled ? 0.65 : 1 }}
        >
          <SelectorGrid
            label="Food type"
            options={FOOD_TYPE_OPTIONS}
            value={form.foodType}
            onChange={form.setFoodType}
          />

          <CollapsibleSection
            title="Details"
            expanded={form.detailsExpanded}
            onToggle={() => form.setDetailsExpanded(!form.detailsExpanded)}
          >
            <SelectorGrid
              label="Meal"
              options={MEAL_OPTIONS}
              value={form.mealLabel}
              onChange={form.setMealLabel}
            />

            <View style={styles.nameField}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.nameInput}
                value={form.foodName}
                onChangeText={form.setFoodName}
                placeholder="Brand / type, etc."
                placeholderTextColor="#C8B9A4"
              />
            </View>

            <View style={styles.amountRow}>
              <View style={styles.amountField}>
                <Text style={styles.fieldLabel}>Amount</Text>
                <TextInput
                  style={styles.amountInput}
                  value={form.amount}
                  onChangeText={form.onChangeAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#C8B9A4"
                />
              </View>

              <View style={styles.unitField}>
                <Text style={styles.fieldLabel}>Unit</Text>
                <View style={styles.unitSegment}>
                  {UNIT_OPTIONS.map((option) => {
                    const selected = form.amountUnit === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.unitPill,
                          selected && styles.unitPillSelected,
                        ]}
                        // Same single-select-with-uncheck pattern as SelectorGrid.
                        onPress={() =>
                          form.setAmountUnit(selected ? null : option.value)
                        }
                      >
                        <Text
                          style={[
                            styles.unitPillLabel,
                            selected && styles.unitPillLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
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

            <View style={styles.notesField}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={form.notes}
                onChangeText={form.setNotes}
                placeholder="Any notes about this feeding?"
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

          {form.error ? (
            <Text style={styles.errorText}>{form.error}</Text>
          ) : null}
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
          label={form.submitting ? "Logging…" : "Log Feeding"}
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
