import { Database } from "@/types/database.types";
import {
  Award,
  Droplet,
  Footprints,
  Gamepad2,
  LucideIcon,
  Moon,
  MoreHorizontal,
  Pill,
  Scissors,
  Stethoscope,
  Syringe,
  Toilet,
  UtensilsCrossed,
  Weight,
} from "lucide-react-native";

export type ActivityType = Database["public"]["Enums"]["activity_type"];

export type ActivityConfig = {
  label: string;
  IconComponent: LucideIcon;
  iconColor?: string;
  iconBg: string;
  /** Groups in the More modal */
  section: "daily_care" | "health_notes";
};

export const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  walk: {
    label: "Walk",
    IconComponent: Footprints,
    iconBg: "#E1F5EE",
    iconColor: "#4A8B6E",
    section: "daily_care",
  },
  feeding: {
    label: "Feeding",
    IconComponent: UtensilsCrossed,
    iconBg: "#FAEEDA",
    iconColor: "#B8862D",
    section: "daily_care",
  },
  potty: {
    label: "Potty",
    IconComponent: Toilet,
    iconBg: "#E6F1FB",
    iconColor: "#5B82A6",
    section: "daily_care",
  },
  medication: {
    label: "Meds",
    IconComponent: Pill,
    iconBg: "#FAECE7",
    iconColor: "#C46B4A",
    section: "daily_care",
  },
  water: {
    label: "Water",
    IconComponent: Droplet,
    iconBg: "#E8F4FD",
    iconColor: "#4d79a8",
    section: "daily_care",
  },
  grooming: {
    label: "Groom",
    IconComponent: Scissors,
    iconBg: "#FAF0FB",
    iconColor: "#9967cf",
    section: "daily_care",
  },
  play: {
    label: "Play",
    IconComponent: Gamepad2,
    iconBg: "#fceee0",
    iconColor: "#e07024",
    section: "daily_care",
  },
  training: {
    label: "Training",
    IconComponent: Award,
    iconBg: "#E1F5EE",
    iconColor: "#579985",
    section: "daily_care",
  },
  vet_visit: {
    label: "Vet Visit",
    IconComponent: Stethoscope,
    iconBg: "#FAECE7",
    iconColor: "#C46B4A",
    section: "health_notes",
  },
  weight: {
    label: "Weight",
    IconComponent: Weight,
    iconBg: "rgba(226, 226, 253, 0.62)",
    iconColor: "#2d3365",
    section: "health_notes",
  },
  vaccination: {
    label: "Vaccination",
    IconComponent: Syringe,
    iconBg: "#fae7fa",
    iconColor: "#cb5cba",
    section: "health_notes",
  },
  sleep: {
    label: "Sleep",
    IconComponent: Moon,
    iconBg: "#EDE5F8",
    iconColor: "#60388a",
    section: "health_notes",
  },
  other: {
    label: "Other",
    IconComponent: MoreHorizontal,
    iconBg: "#F2EDE6",
    section: "health_notes",
  },
};

export const DEFAULT_PRESETS: ActivityType[] = [
  "walk",
  "feeding",
  "potty",
  "medication",
];

export const DAILY_CARE_TYPES: ActivityType[] = [
  "walk",
  "feeding",
  "potty",
  "medication",
  "water",
  "grooming",
  "play",
  "training",
];

export const HEALTH_NOTE_TYPES: ActivityType[] = [
  "vet_visit",
  "weight",
  "vaccination",
  "sleep",
  "other",
];
