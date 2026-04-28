import { colors } from "@/constants/colors";
import { Pressable, Text, View } from "react-native";
import { SelectorOption } from "../selector-grid";
import { styles } from "./styles";

type Props<T extends string> = {
  options: SelectorOption<T>[];
  values: T[];
  onChange: (next: T[]) => void;
  label?: string;
};

export const MultiSelectorGrid = <T extends string>({
  options,
  values,
  onChange,
  label,
}: Props<T>) => {
  const toggle = (value: T) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
      return;
    }
    onChange([...values, value]);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.grid}>
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.tile,
                selected && styles.tileSelected,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => toggle(option.value)}
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
