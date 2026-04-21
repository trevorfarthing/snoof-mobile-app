import { LucideIcon } from "lucide-react-native";

export type ActivityButtonVariant = "default" | "more";

export type ActivityButtonProps = {
  label: string;
  IconComponent: LucideIcon;
  iconColor?: string;
  iconBg: string;
  onPress: () => void;
  variant?: ActivityButtonVariant;
  /** Shows a red X badge for removal (edit mode) */
  removable?: boolean;
  onRemove?: () => void;
  /** Grays out the icon and shows "Done" */
  logged?: boolean;
};
