import { colors } from "@/constants/colors";
import { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "./styles";

export type SelectorOption<T extends string> = {
  value: T;
  label: string;
  Icon: LucideIcon;
};

type Props<T extends string> = {
  options: SelectorOption<T>[];
  value: T | null;
  onChange: (next: T | null) => void;
  label?: string;
};

export const SelectorGrid = <T extends string>({
  options,
  value,
  onChange,
  label,
}: Props<T>) => {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.grid}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.tile,
                selected && styles.tileSelected,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              // Tapping the currently selected tile deselects it — single-select
              // with an "uncheck" escape hatch, since these fields are optional.
              onPress={() => onChange(selected ? null : option.value)}
            >
              <View
                style={[
                  styles.iconContainer,
                  selected && styles.iconContainerSelected,
                ]}
              >
                <option.Icon
                  size={18}
                  color={colors.textPrimary}
                  strokeWidth={1.75}
                />
              </View>
              <Text style={styles.tileLabel}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
