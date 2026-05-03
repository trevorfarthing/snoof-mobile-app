import { supabase } from "@/lib/utils/supabase";
import { useState } from "react";
import { SubmitResult } from "./types";

// Shared across walk/feeding/potty (and any future activity type). Deleting the
// parent activity_logs row cascades to the child via ON DELETE CASCADE on
// *.activity_log_id, so callers only need the parent id.
export const useDeleteActivityLog = () => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (activityLogId: string): Promise<SubmitResult> => {
    setDeleting(true);
    setError(null);

    const { error: delErr } = await supabase
      .from("activity_logs")
      .delete()
      .eq("id", activityLogId);

    setDeleting(false);

    if (delErr) {
      setError(delErr.message);
      return { error: delErr.message };
    }
    return { error: null };
  };

  return { remove, deleting, error, setError };
};
