import type {
  PottyConsistency,
  PottyTypeOption,
} from "@/components/dashboard/quick-log/action-modal/potty-form/options";
import { supabase } from "@/lib/utils/supabase";
import { useState } from "react";

type SubmitParams = {
  petId: string;
  householdId: string;
  userId: string;
};

type SubmitResult = { error: string | null };

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
  pottyTypes?: PottyTypeOption[];
  consistency?: PottyConsistency | null;
  location?: string;
  isAccident?: boolean;
  notes?: string;
  detailsExpanded?: boolean;
};

export const usePottyForm = (initialValues?: PottyFormInitialValues) => {
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
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [detailsExpanded, setDetailsExpanded] = useState(
    initialValues?.detailsExpanded ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setNotes("");
    setDetailsExpanded(false);
    setError(null);
    setSubmitting(false);
  };

  const submit = async ({
    petId,
    householdId,
    userId,
  }: SubmitParams): Promise<SubmitResult> => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return { error: validationError };
    }
    setError(null);
    setSubmitting(true);

    const trimmedNotes = notes.trim();
    const trimmedLocation = location.trim();
    const occurred = new Date();

    const { data: logRow, error: logErr } = await supabase
      .from("activity_logs")
      .insert({
        pet_id: petId,
        household_id: householdId,
        type: "potty",
        occurred_at: occurred.toISOString(),
        logged_by: userId,
        notes: trimmedNotes === "" ? null : trimmedNotes,
      })
      .select("id")
      .single();

    if (logErr || !logRow) {
      const msg = logErr?.message ?? "Failed to save activity log";
      setError(msg);
      setSubmitting(false);
      return { error: msg };
    }

    const pottyType = resolvePottyType(pottyTypes);

    const { error: pottyErr } = await supabase.from("potty_logs").insert({
      activity_log_id: logRow.id,
      pet_id: petId,
      // `potty_type` is NOT NULL in the schema; default to "pee" if the user
      // somehow submits with nothing selected so the row is still valid.
      potty_type: pottyType ?? "pee",
      consistency: isPooSelected ? consistency : null,
      location: trimmedLocation === "" ? null : trimmedLocation,
      is_accident: isAccident,
    });

    // If the potty_logs insert fails after the activity_logs insert succeeded
    // we leave an orphan log row. The UNIQUE constraint on
    // potty_logs.activity_log_id prevents double-writes on retry; a future
    // sweep job can reconcile.
    if (pottyErr) {
      setError(pottyErr.message);
      setSubmitting(false);
      return { error: pottyErr.message };
    }

    setSubmitting(false);
    return { error: null };
  };

  return {
    pottyTypes,
    setPottyTypes: handleSetPottyTypes,
    consistency,
    setConsistency,
    location,
    setLocation,
    isAccident,
    setIsAccident,
    notes,
    setNotes,
    detailsExpanded,
    setDetailsExpanded,
    error,
    setError,
    submitting,
    isPooSelected,
    submit,
    reset,
  };
};
