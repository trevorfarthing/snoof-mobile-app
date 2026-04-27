import {
  Beef,
  Bone,
  ChefHat,
  Cookie,
  MoreHorizontal,
  Sandwich,
  Soup,
  Sunrise,
  UtensilsCrossed,
  Wheat,
} from "lucide-react-native";
import { SelectorOption } from "../shared/selector-grid";

export type FeedingFoodType =
  | "kibble"
  | "wet"
  | "raw"
  | "homemade"
  | "treat"
  | "other";

export type FeedingMealLabel = "breakfast" | "lunch" | "dinner" | "snack";

export type FeedingAmountUnit = "cups" | "grams" | "oz" | "scoops";

export const FOOD_TYPE_OPTIONS: SelectorOption<FeedingFoodType>[] = [
  { value: "kibble", label: "Kibble", Icon: Wheat },
  { value: "wet", label: "Wet", Icon: Soup },
  { value: "raw", label: "Raw", Icon: Beef },
  { value: "homemade", label: "Homemade", Icon: ChefHat },
  { value: "treat", label: "Treat", Icon: Bone },
  { value: "other", label: "Other", Icon: MoreHorizontal },
];

export const MEAL_OPTIONS: SelectorOption<FeedingMealLabel>[] = [
  { value: "breakfast", label: "Breakfast", Icon: Sunrise },
  { value: "lunch", label: "Lunch", Icon: Sandwich },
  { value: "dinner", label: "Dinner", Icon: UtensilsCrossed },
  { value: "snack", label: "Snack", Icon: Cookie },
];

export const UNIT_OPTIONS: { value: FeedingAmountUnit; label: string }[] = [
  { value: "cups", label: "cups" },
  { value: "grams", label: "grams" },
  { value: "oz", label: "oz" },
  { value: "scoops", label: "scoops" },
];
