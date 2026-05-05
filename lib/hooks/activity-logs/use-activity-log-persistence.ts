import type { ActivityType } from "@/components/dashboard/quick-log/activity-config";
import { supabase } from "@/lib/utils/supabase";
import { useState } from "react";
import { SubmitResult } from "./types";

/* Tables that hang off activity_logs via a UNIQUE activity_log_id FK. Adding a
   new activity type with its own child table is a one-line change here plus a
   thin form hook that builds the right payload. */
type ChildTable = "walks" | "feedings" | "potty_logs";

type LogFields = {
  occurred_at: string;
  notes: string | null;
};

/* Capture the writer's UTC offset so the streak engine can bucket this
   activity by its local day. Postgres derives local_day from occurred_at +
   utc_offset_minutes via a generated column. Frozen at insert and never
   updated on edits — e.g., a walk that happened in NYC stays bucketed to its NYC
   day even if the user later edits it from a different timezone. */
const currentUtcOffsetMinutes = (): number => -new Date().getTimezoneOffset();

type InsertParams = {
  logFields: LogFields;
  childFields: Record<string, unknown>;
  petId: string;
  householdId: string;
  userId: string;
};

type UpdateParams = {
  activityLogId: string;
  logFields: LogFields;
  childFields: Record<string, unknown>;
  userId: string;
};

type Args = {
  type: ActivityType;
  childTable: ChildTable;
};

/* Owns the Supabase round-trips for any activity_logs + child-table pair.
   Form hooks pass type-specific payloads in and read submitting/error state
   out. This keeps every form hook free of insert/update boilerplate. */
export const useActivityLogPersistence = ({ type, childTable }: Args) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async ({
    logFields,
    childFields,
    petId,
    householdId,
    userId,
  }: InsertParams): Promise<SubmitResult> => {
    setSubmitting(true);
    setError(null);

    const { data: logRow, error: logErr } = await supabase
      .from("activity_logs")
      .insert({
        pet_id: petId,
        household_id: householdId,
        type,
        logged_by: userId,
        utc_offset_minutes: currentUtcOffsetMinutes(),
        ...logFields,
      })
      .select("id")
      .single();

    if (logErr || !logRow) {
      const msg = logErr?.message ?? "Failed to save activity log";
      setError(msg);
      setSubmitting(false);
      return { error: msg };
    }

    /* If this child insert fails after the activity_logs insert succeeded we
       leave an orphan log row. The UNIQUE constraint on
       <child>.activity_log_id prevents double-writes on retry; a future sweep
       job can reconcile. */
    const { error: childErr } = await supabase.from(childTable).insert({
      activity_log_id: logRow.id,
      pet_id: petId,
      ...childFields,
    } as never);

    setSubmitting(false);
    if (childErr) {
      setError(childErr.message);
      return { error: childErr.message };
    }
    return { error: null };
  };

  const update = async ({
    activityLogId,
    logFields,
    childFields,
    userId,
  }: UpdateParams): Promise<SubmitResult> => {
    setSubmitting(true);
    setError(null);

    const { error: logErr } = await supabase
      .from("activity_logs")
      .update({ ...logFields, updated_by: userId })
      .eq("id", activityLogId);

    if (logErr) {
      setError(logErr.message);
      setSubmitting(false);
      return { error: logErr.message };
    }

    const { error: childErr } = await supabase
      .from(childTable)
      .update(childFields as never)
      .eq("activity_log_id", activityLogId);

    setSubmitting(false);
    if (childErr) {
      setError(childErr.message);
      return { error: childErr.message };
    }
    return { error: null };
  };

  return { insert, update, submitting, error, setError };
};
