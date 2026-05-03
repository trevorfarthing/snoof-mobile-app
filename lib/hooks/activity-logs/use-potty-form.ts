import type {
  PottyConsistency,
  PottyTypeOption,
} from "@/components/dashboard/quick-log/action-modal/potty-form/options";
import { supabase } from "@/lib/utils/supabase";
import { useState } from "react";
import { SubmitParams, SubmitResult } from "./types";

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

  // Shared between submit (insert) and update — produces only the mutable
  // field payloads.
  const buildPayloads = () => {
    const trimmedNotes = notes.trim();
    const trimmedLocation = location.trim();
    const occurred = new Date();
    const pottyType = resolvePottyType(pottyTypes);

    return {
      occurred,
      log: {
        occurred_at: occurred.toISOString(),
        notes: trimmedNotes === "" ? null : trimmedNotes,
      },
      potty: {
        // `potty_type` is NOT NULL in the schema; default to "pee" if the user
        // somehow submits with nothing selected so the row is still valid.
        potty_type: pottyType ?? "pee",
        consistency: isPooSelected ? consistency : null,
        location: trimmedLocation === "" ? null : trimmedLocation,
        is_accident: isAccident,
      },
    };
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

    const { log, potty } = buildPayloads();

    const { data: logRow, error: logErr } = await supabase
      .from("activity_logs")
      .insert({
        pet_id: petId,
        household_id: householdId,
        type: "potty",
        logged_by: userId,
        ...log,
      })
      .select("id")
      .single();

    if (logErr || !logRow) {
      const msg = logErr?.message ?? "Failed to save activity log";
      setError(msg);
      setSubmitting(false);
      return { error: msg };
    }

    const { error: pottyErr } = await supabase.from("potty_logs").insert({
      activity_log_id: logRow.id,
      pet_id: petId,
      ...potty,
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

  const update = async ({ userId }: SubmitParams): Promise<SubmitResult> => {
    if (!activityLogId) {
      const msg = "Missing activity log id";
      setError(msg);
      return { error: msg };
    }
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return { error: validationError };
    }
    setError(null);
    setSubmitting(true);

    // Don't overwrite occurred_at on edit — the original log time is the
    // source of truth and there's no UI to pick it for potty logs.
    const { potty } = buildPayloads();
    const trimmedNotes = notes.trim();

    const { error: logErr } = await supabase
      .from("activity_logs")
      .update({
        notes: trimmedNotes === "" ? null : trimmedNotes,
        updated_by: userId,
      })
      .eq("id", activityLogId);

    if (logErr) {
      setError(logErr.message);
      setSubmitting(false);
      return { error: logErr.message };
    }

    const { error: pottyErr } = await supabase
      .from("potty_logs")
      .update(potty)
      .eq("activity_log_id", activityLogId);

    if (pottyErr) {
      setError(pottyErr.message);
      setSubmitting(false);
      return { error: pottyErr.message };
    }

    setSubmitting(false);
    return { error: null };
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
    notes,
    setNotes,
    detailsExpanded,
    setDetailsExpanded,
    error,
    setError,
    submitting,
    isPooSelected,
    submit,
    update,
    reset,
  };
};
