import type {
  PottyConsistency,
  PottyTypeOption,
} from "@/components/dashboard/quick-log/action-modal/potty-form/options";
import { useState } from "react";
import { SubmitParams, SubmitResult } from "./types";
import { useActivityLogPersistence } from "./use-activity-log-persistence";

// Maps the multi-select UI values (["pee"], ["poo"], or both) onto the
// `potty_type` enum stored in the database.
const resolvePottyType = (
  values: PottyTypeOption[],
): "pee" | "poo" | "both" | null => {
  const hasPee = values.includes("pee");
  const hasPoo = values.includes("poo");
  if (hasPee && hasPoo) {
    return "both";
  }
  if (hasPee) {
    return "pee";
  }
  if (hasPoo) {
    return "poo";
  }
  return null;
};

export type PottyFormInitialValues = {
  id?: string;
  pottyTypes?: PottyTypeOption[];
  consistency?: PottyConsistency | null;
  location?: string;
  isAccident?: boolean;
  occurredAt?: Date | null;
  notes?: string;
  detailsExpanded?: boolean;
};

export const usePottyForm = (initialValues?: PottyFormInitialValues) => {
  const activityLogId = initialValues?.id ?? null;
  const [pottyTypes, setPottyTypes] = useState<PottyTypeOption[]>(
    initialValues?.pottyTypes ?? [],
  );
  const [consistency, setConsistency] = useState<PottyConsistency | null>(
    initialValues?.consistency ?? null,
  );
  const [location, setLocation] = useState(initialValues?.location ?? "");
  const [isAccident, setIsAccident] = useState(
    initialValues?.isAccident ?? false,
  );
  const [occurredAt, setOccurredAt] = useState<Date | null>(
    initialValues?.occurredAt ?? null,
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [detailsExpanded, setDetailsExpanded] = useState(
    initialValues?.detailsExpanded ?? false,
  );
  const persistence = useActivityLogPersistence({
    type: "potty",
    childTable: "potty_logs",
  });

  const isPooSelected = pottyTypes.includes("poo");

  const validate = (): string | null => {
    if (!pottyTypes?.length) {
      return "A potty type must be selected";
    }
    return null;
  };

  // Clear consistency whenever poo is deselected so we don't persist a value
  // that's hidden behind a disabled control.
  const handleSetPottyTypes = (next: PottyTypeOption[]) => {
    if (!next.includes("poo")) {
      setConsistency(null);
    }
    setPottyTypes(next);
  };

  const reset = () => {
    setPottyTypes([]);
    setConsistency(null);
    setLocation("");
    setIsAccident(false);
    setOccurredAt(null);
    setNotes("");
    setDetailsExpanded(false);
    persistence.setError(null);
  };

  const buildPayloads = () => {
    const trimmedNotes = notes.trim();
    const trimmedLocation = location.trim();
    const occurred = occurredAt ?? new Date();
    const pottyType = resolvePottyType(pottyTypes);

    return {
      logFields: {
        occurred_at: occurred.toISOString(),
        notes: trimmedNotes === "" ? null : trimmedNotes,
      },
      childFields: {
        // `potty_type` is NOT NULL in the schema; default to "pee" if the user
        // somehow submits with nothing selected so the row is still valid.
        potty_type: pottyType ?? "pee",
        consistency: isPooSelected ? consistency : null,
        location: trimmedLocation === "" ? null : trimmedLocation,
        is_accident: isAccident,
      },
    };
  };

  const submit = async (params: SubmitParams): Promise<SubmitResult> => {
    const validationError = validate();
    if (validationError) {
      persistence.setError(validationError);
      return { error: validationError };
    }
    return persistence.insert({ ...buildPayloads(), ...params });
  };

  const update = async ({ userId }: SubmitParams): Promise<SubmitResult> => {
    if (!activityLogId) {
      const msg = "Missing activity log id";
      persistence.setError(msg);
      return { error: msg };
    }
    const validationError = validate();
    if (validationError) {
      persistence.setError(validationError);
      return { error: validationError };
    }
    return persistence.update({
      activityLogId,
      userId,
      ...buildPayloads(),
    });
  };

  return {
    activityLogId,
    pottyTypes,
    setPottyTypes: handleSetPottyTypes,
    consistency,
    setConsistency,
    location,
    setLocation,
    isAccident,
    setIsAccident,
    occurredAt,
    setOccurredAt,
    notes,
    setNotes,
    detailsExpanded,
    setDetailsExpanded,
    error: persistence.error,
    setError: persistence.setError,
    submitting: persistence.submitting,
    isPooSelected,
    submit,
    update,
    reset,
  };
};
