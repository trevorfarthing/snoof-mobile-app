import {
  Building2,
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Home,
  Mountain,
  Sun,
  Trees,
  Waves,
} from "lucide-react-native";
import { SelectorOption } from "../shared/selector-grid";

export type WalkEnvironment = "city" | "suburbs" | "trail" | "park" | "beach";
export type WalkWeather =
  | "sunny"
  | "partly_cloudy"
  | "overcast"
  | "rain"
  | "snow"
  | "fog";

export const ENVIRONMENT_OPTIONS: SelectorOption<WalkEnvironment>[] = [
  { value: "city", label: "City", Icon: Building2 },
  { value: "suburbs", label: "Suburbs", Icon: Home },
  { value: "trail", label: "Trail", Icon: Mountain },
  { value: "park", label: "Park", Icon: Trees },
  { value: "beach", label: "Beach", Icon: Waves },
];

export const WEATHER_OPTIONS: SelectorOption<WalkWeather>[] = [
  { value: "sunny", label: "Sunny", Icon: Sun },
  { value: "partly_cloudy", label: "Cloudy", Icon: CloudSun },
  { value: "overcast", label: "Overcast", Icon: Cloud },
  { value: "rain", label: "Rain", Icon: CloudRain },
  { value: "snow", label: "Snow", Icon: CloudSnow },
  { value: "fog", label: "Fog", Icon: CloudFog },
];
