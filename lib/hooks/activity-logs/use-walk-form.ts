import type {
  WalkEnvironment,
  WalkWeather,
} from "@/components/dashboard/quick-log/action-modal/walk-form/options";
import { supabase } from "@/lib/utils/supabase";
import { useMemo, useState } from "react";

type SubmitParams = {
  petId: string;
  householdId: string;
  userId: string;
};

type SubmitResult = { error: string | null };

const METERS_PER_MILE = 1609.344;

const parseManualDurationMinutes = (
  hours: string,
  minutes: string,
): number | null => {
  const h = hours === "" ? 0 : Number(hours);
  const m = minutes === "" ? 0 : Number(minutes);
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return null;
  }
  const total = Math.round(h * 60 + m);
  return total > 0 ? total : null;
};

export type WalkFormInitialValues = {
  distanceMiles?: string;
  hours?: string;
  minutes?: string;
  startedAt?: Date | null;
  endedAt?: Date | null;
  environment?: WalkEnvironment | null;
  weather?: WalkWeather | null;
  notes?: string;
  detailsExpanded?: boolean;
};

export const useWalkForm = (initialValues?: WalkFormInitialValues) => {
  const [distanceMiles, setDistanceMiles] = useState(
    initialValues?.distanceMiles ?? "",
  );
  const [hours, setHours] = useState(initialValues?.hours ?? "");
  const [minutes, setMinutes] = useState(initialValues?.minutes ?? "");
  const [startedAt, setStartedAt] = useState<Date | null>(
    initialValues?.startedAt ?? null,
  );
  const [endedAt, setEndedAt] = useState<Date | null>(
    initialValues?.endedAt ?? null,
  );
  const [environment, setEnvironment] = useState<WalkEnvironment | null>(
    initialValues?.environment ?? null,
  );
  const [weather, setWeather] = useState<WalkWeather | null>(
    initialValues?.weather ?? null,
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [detailsExpanded, setDetailsExpanded] = useState(
    initialValues?.detailsExpanded ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const computedDurationMinutes = useMemo<number | null>(() => {
    if (!startedAt || !endedAt) {
      return null;
    }
    const diffMs = endedAt.getTime() - startedAt.getTime();
    // Returning null for non-positive diff intentionally leaves the form in
    // "manual duration" mode if the user temporarily picks invalid times.
    if (diffMs <= 0) {
      return null;
    }
    return Math.round(diffMs / 60_000);
  }, [startedAt, endedAt]);

  // When both timestamps are present and valid, they are authoritative — the
  // manual hours/minutes inputs are hidden and the computed value wins.
  const isDurationLocked = computedDurationMinutes !== null;

  const effectiveDurationMinutes: number | null = isDurationLocked
    ? computedDurationMinutes
    : parseManualDurationMinutes(hours, minutes);

  const validate = (): string | null => {
    const parsedDistance =
      distanceMiles.trim() === "" ? null : Number(distanceMiles);
    const hasDistance =
      parsedDistance !== null &&
      Number.isFinite(parsedDistance) &&
      parsedDistance > 0;
    const hasDuration =
      effectiveDurationMinutes !== null && effectiveDurationMinutes > 0;

    if (!hasDistance && !hasDuration) {
      return "Enter at least a distance or duration";
    }

    if (distanceMiles.trim() !== "" && !hasDistance) {
      return "Distance must be a positive number";
    }

    if (!isDurationLocked) {
      if (hours !== "") {
        const h = Number(hours);
        if (!Number.isInteger(h) || h < 0 || h > 5) {
          return "Hours must be between 0 and 5";
        }
      }
      if (minutes !== "") {
        const m = Number(minutes);
        if (!Number.isInteger(m) || m < 0 || m > 59) {
          return "Minutes must be between 0 and 59";
        }
      }
    }

    if (startedAt && endedAt && endedAt <= startedAt) {
      return "End time must be after start time";
    }

    return null;
  };

  const reset = () => {
    setDistanceMiles("");
    setHours("");
    setMinutes("");
    setStartedAt(null);
    setEndedAt(null);
    setEnvironment(null);
    setWeather(null);
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

    // `walks.distance_meters` is decimal(10,2); round to 2 decimals to match.
    const distanceMeters =
      distanceMiles.trim() === ""
        ? null
        : Math.round(Number(distanceMiles) * METERS_PER_MILE * 100) / 100;
    const durationMin = effectiveDurationMinutes;
    const durationSec = durationMin !== null ? durationMin * 60 : null;
    // Prefer the user's stated start time as the canonical "when" for the log;
    // fall back to end time, then to now.
    const occurredAt = startedAt ?? endedAt ?? new Date();
    const trimmedNotes = notes.trim();

    const { data: logRow, error: logErr } = await supabase
      .from("activity_logs")
      .insert({
        pet_id: petId,
        household_id: householdId,
        type: "walk",
        occurred_at: occurredAt.toISOString(),
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

    const metadata: Record<string, string> = {};
    if (environment) {
      metadata.environment = environment;
    }
    if (weather) {
      metadata.weather = weather;
    }

    const { error: walkErr } = await supabase.from("walks").insert({
      activity_log_id: logRow.id,
      pet_id: petId,
      started_at: (startedAt ?? occurredAt).toISOString(),
      ended_at: endedAt ? endedAt.toISOString() : null,
      duration_sec: durationSec,
      distance_meters: distanceMeters,
      metadata,
    });

    // If the walks insert fails after the activity_logs insert succeeded we
    // leave an orphan log row. The UNIQUE constraint on walks.activity_log_id
    // prevents double-writes on retry; a future sweep job can reconcile.
    if (walkErr) {
      setError(walkErr.message);
      setSubmitting(false);
      return { error: walkErr.message };
    }

    setSubmitting(false);
    return { error: null };
  };

  return {
    distanceMiles,
    setDistanceMiles,
    hours,
    setHours,
    minutes,
    setMinutes,
    startedAt,
    setStartedAt,
    endedAt,
    setEndedAt,
    environment,
    setEnvironment,
    weather,
    setWeather,
    notes,
    setNotes,
    detailsExpanded,
    setDetailsExpanded,
    error,
    setError,
    submitting,
    isDurationLocked,
    computedDurationMinutes,
    submit,
    reset,
  };
};
