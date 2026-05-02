import ActionButton from "@/components/ui/action-button";
import {
  useWalkForm,
  type WalkFormInitialValues,
} from "@/lib/hooks/activity-logs/use-walk-form";
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
import { DurationInput } from "../shared/duration-input";
import { ReadOnlyBanner } from "../shared/read-only-banner";
import { SelectorGrid } from "../shared/selector-grid";
import { ENVIRONMENT_OPTIONS, WEATHER_OPTIONS } from "./options";
import { styles } from "./styles";

type Props = {
  onClose: () => void;
  onLogged?: () => void;
  readOnly?: boolean;
  initialValues?: WalkFormInitialValues;
};

type PickerTarget = null | "start" | "end";

const formatTime = (d: Date): string =>
  d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

const addMinutes = (d: Date, m: number): Date => {
  const next = new Date(d);
  next.setMinutes(next.getMinutes() + m);
  return next;
};

const subMinutes = (d: Date, m: number): Date => addMinutes(d, -m);

export const WalkForm = ({
  onClose,
  onLogged,
  readOnly = false,
  initialValues,
}: Props) => {
  const { activePet } = usePetStore();
  const { session } = useAuthContext();
  const form = useWalkForm(initialValues);
  const [picker, setPicker] = useState<PickerTarget>(null);
  const [editing, setEditing] = useState(false);
  const inputsDisabled = readOnly && !editing;

  // Snapshot of the initial value at picker-open time. Stays referentially
  // stable for the picker's entire lifetime — passing form.startedAt directly
  // creates a new Date() on every render and causes the iOS spinner to reset
  // its scroll position, so the user can only land on values close to the
  // current time.
  const startInitial = useRef<Date>(new Date());
  const endInitial = useRef<Date>(new Date());

  const userId = session?.user?.id;

  const openStartPicker = () => {
    if (picker === "start") {
      setPicker(null);
      return;
    }
    startInitial.current = form.startedAt ?? new Date();
    setPicker("start");
  };

  const openEndPicker = () => {
    if (picker === "end") {
      setPicker(null);
      return;
    }
    endInitial.current =
      form.endedAt ??
      (form.startedAt ? addMinutes(form.startedAt, 30) : new Date());
    setPicker("end");
  };

  // Android's DateTimePicker is a one-shot modal — once the user picks or
  // dismisses, we unmount it. iOS renders the picker as an inline spinner, so
  // we keep it mounted until the user taps the field again to close.
  //
  // The `date >= form.endedAt` check is belt-and-suspenders: `maximumDate` is
  // respected on iOS but not reliably in Android's time mode, so we also
  // reject invalid picks here.
  const handleStartChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setPicker(null);
    }
    if (!date) {
      return;
    }
    if (form.endedAt && date >= form.endedAt) {
      form.setError("End time must be after start time");
      return;
    }
    form.setError(null);
    form.setStartedAt(date);
  };

  const handleEndChange = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setPicker(null);
    }
    if (!date) {
      return;
    }
    if (form.startedAt && date <= form.startedAt) {
      form.setError("End time must be after start time");
      return;
    }
    form.setError(null);
    form.setEndedAt(date);
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

  // One-minute buffer on each side so the user can never select equal times.
  const startMax =
    form.endedAt !== null ? subMinutes(form.endedAt, 1) : undefined;
  const endMin =
    form.startedAt !== null ? addMinutes(form.startedAt, 1) : undefined;

  // Limit start and end to only the current day
  const startMin = new Date();
  startMin.setHours(0, 0, 0, 0);
  const endMax = new Date();
  endMax.setHours(23, 59, 0, 0);

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
          <View style={styles.requiredRow}>
            <View style={styles.requiredField}>
              <Text style={styles.fieldLabel}>Distance</Text>
              <View style={styles.distanceField}>
                <TextInput
                  style={styles.distanceInput}
                  value={form.distanceMiles}
                  onChangeText={form.onChangeDistance}
                  keyboardType="decimal-pad"
                  placeholder="0.0"
                  placeholderTextColor="#C8B9A4"
                />
                <Text style={styles.distanceSuffix}>mi</Text>
              </View>
            </View>

            <View style={styles.requiredField}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <DurationInput
                hours={form.hours}
                minutes={form.minutes}
                onHoursChange={form.setHours}
                onMinutesChange={form.setMinutes}
                disabled={form.isDurationLocked}
                computedMinutes={form.computedDurationMinutes}
              />
            </View>
          </View>

          {form.error ? (
            <Text style={styles.errorText}>{form.error}</Text>
          ) : null}

          <CollapsibleSection
            title="Details"
            expanded={form.detailsExpanded}
            onToggle={() => form.setDetailsExpanded(!form.detailsExpanded)}
          >
            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Time started</Text>
                <Pressable style={styles.timeButton} onPress={openStartPicker}>
                  <Text
                    style={
                      form.startedAt ? styles.timeValue : styles.timePlaceholder
                    }
                  >
                    {form.startedAt ? formatTime(form.startedAt) : "Select"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Time ended</Text>
                <Pressable style={styles.timeButton} onPress={openEndPicker}>
                  <Text
                    style={
                      form.endedAt ? styles.timeValue : styles.timePlaceholder
                    }
                  >
                    {form.endedAt ? formatTime(form.endedAt) : "Select"}
                  </Text>
                </Pressable>
              </View>
            </View>

            <SelectorGrid
              label="Environment"
              options={ENVIRONMENT_OPTIONS}
              value={form.environment}
              onChange={form.setEnvironment}
            />

            <SelectorGrid
              label="Weather"
              options={WEATHER_OPTIONS}
              value={form.weather}
              onChange={form.setWeather}
            />

            <View style={styles.notesField}>
              <Text style={styles.fieldLabel}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={form.notes}
                onChangeText={form.setNotes}
                placeholder="Anything notable about this walk?"
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

      {/* Pickers render OUTSIDE the ScrollView so the spinner's vertical scroll
          gestures aren't stolen by the parent ScrollView. */}
      {picker === "start" ? (
        <DateTimePicker
          value={startInitial.current}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleStartChange}
          minimumDate={startMin}
          maximumDate={startMax}
        />
      ) : null}

      {picker === "end" ? (
        <DateTimePicker
          value={endInitial.current}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleEndChange}
          minimumDate={endMin}
          maximumDate={endMax}
        />
      ) : null}

      {!readOnly ? (
        <ActionButton
          onPress={handleSubmit}
          label={form.submitting ? "Logging…" : "Log Walk"}
          disabled={form.submitting}
        />
      ) : null}
    </>
  );
};
