import type {
  FeedingAmountUnit,
  FeedingFoodType,
  FeedingMealLabel,
} from "@/components/dashboard/quick-log/action-modal/feeding-form/options";
import { useState } from "react";
import { SubmitParams, SubmitResult } from "./types";
import { useActivityLogPersistence } from "./use-activity-log-persistence";

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
  const persistence = useActivityLogPersistence({
    type: "feeding",
    childTable: "feedings",
  });

  const reset = () => {
    setFoodType(null);
    setMealLabel(null);
    setFoodName("");
    setAmount("");
    setAmountUnit(null);
    setOccurredAt(null);
    setNotes("");
    persistence.setError(null);
  };

  const onChangeAmount = (text: string) => {
    // Validate only 2 decimal places
    const validated = text.match(/^\d*\.?\d{0,2}/);
    if (validated) {
      setAmount(validated[0]);
    }
  };

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
      logFields: {
        occurred_at: occurred.toISOString(),
        notes: trimmedNotes === "" ? null : trimmedNotes,
      },
      childFields: {
        food_type: foodType,
        meal_label: mealLabel,
        food_name: trimmedName === "" ? null : trimmedName,
        amount: amountValue,
        amount_unit: amountUnit,
      },
    };
  };

  // No validation: every field is optional. An empty form is a valid log.
  const submit = async (params: SubmitParams): Promise<SubmitResult> =>
    persistence.insert({ ...buildPayloads(), ...params });

  const update = async ({ userId }: SubmitParams): Promise<SubmitResult> => {
    if (!activityLogId) {
      const msg = "Missing activity log id";
      persistence.setError(msg);
      return { error: msg };
    }
    return persistence.update({
      activityLogId,
      userId,
      ...buildPayloads(),
    });
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
    error: persistence.error,
    setError: persistence.setError,
    submitting: persistence.submitting,
    submit,
    update,
    reset,
    onChangeAmount,
  };
};
