import {
  CircleCheck,
  CirclePile,
  Cloud,
  Droplet,
  Droplets,
  Heart,
  Mountain,
  Sparkles,
} from "lucide-react-native";
import { SelectorOption } from "../shared/selector-grid";

export type PottyTypeOption = "pee" | "poo";

export type PottyConsistency =
  | "normal"
  | "soft"
  | "hard"
  | "liquid"
  | "bloody"
  | "mucus";

export const POTTY_TYPE_OPTIONS: SelectorOption<PottyTypeOption>[] = [
  { value: "pee", label: "Pee", Icon: Droplet },
  { value: "poo", label: "Poo", Icon: Mountain },
];

export const CONSISTENCY_OPTIONS: SelectorOption<PottyConsistency>[] = [
  { value: "normal", label: "Normal", Icon: CircleCheck },
  { value: "soft", label: "Soft", Icon: Cloud },
  { value: "hard", label: "Hard", Icon: CirclePile },
  { value: "liquid", label: "Liquid", Icon: Droplets },
  { value: "bloody", label: "Bloody", Icon: Heart },
  { value: "mucus", label: "Mucus", Icon: Sparkles },
];
