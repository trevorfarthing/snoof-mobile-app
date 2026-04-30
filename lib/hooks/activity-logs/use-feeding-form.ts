import type {
  FeedingAmountUnit,
  FeedingFoodType,
  FeedingMealLabel,
} from "@/components/dashboard/quick-log/action-modal/feeding-form/options";
import { supabase } from "@/lib/utils/supabase";
import { useState } from "react";

type SubmitParams = {
  petId: string;
  householdId: string;
  userId: string;
};

type SubmitResult = { error: string | null };

export type FeedingFormInitialValues = {
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

    const trimmedNotes = notes.trim();
    const trimmedName = foodName.trim();
    const trimmedAmount = amount.trim();
    const parsedAmount = Number(trimmedAmount);
    const amountValue =
      trimmedAmount === "" || !Number.isFinite(parsedAmount)
        ? null
        : parsedAmount;

    const occurred = occurredAt ?? new Date();

    const { data: logRow, error: logErr } = await supabase
      .from("activity_logs")
      .insert({
        pet_id: petId,
        household_id: householdId,
        type: "feeding",
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

    const { error: feedErr } = await supabase.from("feedings").insert({
      activity_log_id: logRow.id,
      pet_id: petId,
      food_type: foodType,
      meal_label: mealLabel,
      food_name: trimmedName === "" ? null : trimmedName,
      amount: amountValue,
      amount_unit: amountUnit,
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

  return {
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
    reset,
  };
};
