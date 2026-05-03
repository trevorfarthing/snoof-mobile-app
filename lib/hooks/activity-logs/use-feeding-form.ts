import type {
  FeedingAmountUnit,
  FeedingFoodType,
  FeedingMealLabel,
} from "@/components/dashboard/quick-log/action-modal/feeding-form/options";
import { supabase } from "@/lib/utils/supabase";
import { useState } from "react";
import { SubmitParams, SubmitResult } from "./types";

export type FeedingFormInitialValues = {
  id?: string;
  foodType?: FeedingFoodType | null;
  mealLabel?: FeedingMealLabel | null;
  foodName?: string;
  amount?: string;
  amountUnit?: FeedingAmountUnit | null;
  occurredAt?: Date | null;
  notes?: string;
  detailsExpanded?: boolean;
};

export const useFeedingForm = (initialValues?: FeedingFormInitialValues) => {
  const activityLogId = initialValues?.id ?? null;
  const [foodType, setFoodType] = useState<FeedingFoodType | null>(
    initialValues?.foodType ?? null,
  );
  const [mealLabel, setMealLabel] = useState<FeedingMealLabel | null>(
    initialValues?.mealLabel ?? null,
  );
  const [foodName, setFoodName] = useState(initialValues?.foodName ?? "");
  const [amount, setAmount] = useState(initialValues?.amount ?? "");
  const [amountUnit, setAmountUnit] = useState<FeedingAmountUnit | null>(
    initialValues?.amountUnit ?? null,
  );
  const [occurredAt, setOccurredAt] = useState<Date | null>(
    initialValues?.occurredAt ?? null,
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [detailsExpanded, setDetailsExpanded] = useState(
    initialValues?.detailsExpanded ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFoodType(null);
    setMealLabel(null);
    setFoodName("");
    setAmount("");
    setAmountUnit(null);
    setOccurredAt(null);
    setNotes("");
    setError(null);
    setSubmitting(false);
  };

  const onChangeAmount = (text: string) => {
    // Validate only 2 decimal places
    const validated = text.match(/^\d*\.?\d{0,2}/);
    if (validated) {
      setAmount(validated[0]);
    }
  };

  // Shared between submit (insert) and update — produces only the mutable
  // field payloads.
  const buildPayloads = () => {
    const trimmedNotes = notes.trim();
    const trimmedName = foodName.trim();
    const trimmedAmount = amount.trim();
    const parsedAmount = Number(trimmedAmount);
    const amountValue =
      trimmedAmount === "" || !Number.isFinite(parsedAmount)
        ? null
        : parsedAmount;

    const occurred = occurredAt ?? new Date();

    return {
      log: {
        occurred_at: occurred.toISOString(),
        notes: trimmedNotes === "" ? null : trimmedNotes,
      },
      feeding: {
        food_type: foodType,
        meal_label: mealLabel,
        food_name: trimmedName === "" ? null : trimmedName,
        amount: amountValue,
        amount_unit: amountUnit,
      },
    };
  };

  const submit = async ({
    petId,
    householdId,
    userId,
  }: SubmitParams): Promise<SubmitResult> => {
    // No validation: every field is optional. An empty form is a valid log
    // (creates an activity_logs row with occurred_at = now and a feedings row
    // with all nullable columns set to null).
    setError(null);
    setSubmitting(true);

    const { log, feeding } = buildPayloads();

    const { data: logRow, error: logErr } = await supabase
      .from("activity_logs")
      .insert({
        pet_id: petId,
        household_id: householdId,
        type: "feeding",
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

    const { error: feedErr } = await supabase.from("feedings").insert({
      activity_log_id: logRow.id,
      pet_id: petId,
      ...feeding,
    });

    // If the feedings insert fails after the activity_logs insert succeeded we
    // leave an orphan log row. The UNIQUE constraint on feedings.activity_log_id
    // prevents double-writes on retry; a future sweep job can reconcile.
    if (feedErr) {
      setError(feedErr.message);
      setSubmitting(false);
      return { error: feedErr.message };
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
    setError(null);
    setSubmitting(true);

    const { log, feeding } = buildPayloads();

    const { error: logErr } = await supabase
      .from("activity_logs")
      .update({ ...log, updated_by: userId })
      .eq("id", activityLogId);

    if (logErr) {
      setError(logErr.message);
      setSubmitting(false);
      return { error: logErr.message };
    }

    const { error: feedErr } = await supabase
      .from("feedings")
      .update(feeding)
      .eq("activity_log_id", activityLogId);

    if (feedErr) {
      setError(feedErr.message);
      setSubmitting(false);
      return { error: feedErr.message };
    }

    setSubmitting(false);
    return { error: null };
  };

  return {
    activityLogId,
    foodType,
    setFoodType,
    mealLabel,
    setMealLabel,
    foodName,
    setFoodName,
    amount,
    setAmount,
    amountUnit,
    setAmountUnit,
    occurredAt,
    setOccurredAt,
    notes,
    setNotes,
    detailsExpanded,
    setDetailsExpanded,
    error,
    setError,
    submitting,
    submit,
    update,
    reset,
    onChangeAmount,
  };
};
