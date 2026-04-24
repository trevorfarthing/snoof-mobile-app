import { Text, TextInput, View } from "react-native";
import { styles } from "./styles";

type Props = {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  disabled?: boolean;
  computedMinutes?: number | null;
};

// Clamp at input time rather than on blur so the field can never briefly hold
// an invalid value (e.g. "75" in minutes before snap-back).
const sanitizeInt = (raw: string, max: number): string => {
  const digits = raw.replaceAll(/\D/g, "");
  if (digits === "") {
    return "";
  }
  const n = Number(digits);
  if (n > max) {
    return String(max);
  }
  return String(n);
};

export const DurationInput = ({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  disabled = false,
  computedMinutes = null,
}: Props) => {
  // Disabled mode renders as read-only text instead of hiding the inputs — the
  // user needs to see *which* value they're committing when start/end times
  // are driving it.
  if (disabled) {
    const h = computedMinutes !== null ? Math.floor(computedMinutes / 60) : 0;
    const m = computedMinutes !== null ? computedMinutes % 60 : 0;
    return (
      <View style={styles.containerDisabled}>
        <Text style={styles.disabledValue}>
          {h}h {m}m
        </Text>
        <Text style={styles.disabledHint}>from times below</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={hours}
          onChangeText={(v) => onHoursChange(sanitizeInt(v, 5))}
          keyboardType="number-pad"
          maxLength={1}
          placeholder="0"
          placeholderTextColor="#C8B9A4"
        />
        <Text style={styles.suffix}>h</Text>
      </View>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={minutes}
          onChangeText={(v) => onMinutesChange(sanitizeInt(v, 59))}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="0"
          placeholderTextColor="#C8B9A4"
        />
        <Text style={styles.suffix}>m</Text>
      </View>
    </View>
  );
};
