import { ReactNode } from "react";

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  /** Fraction of screen height (0–1). Defaults to 0.6 */
  snapHeight?: number;
  children?: ReactNode;
};
