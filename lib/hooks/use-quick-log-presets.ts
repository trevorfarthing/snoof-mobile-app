import {
  ActivityType,
  DEFAULT_PRESETS,
} from "@/components/dashboard/quick-log/activity-config";
import { supabase } from "@/lib/utils/supabase";
import { useEffect, useState } from "react";
import { useAuthContext } from "./use-auth-context";

export function useQuickLogPresets() {
  const { session } = useAuthContext();
  const userId = session?.user?.id;

  const [presets, setPresets] = useState<ActivityType[]>(DEFAULT_PRESETS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    supabase
      .from("profiles")
      .select("metadata")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        const saved = (data?.metadata as Record<string, unknown> | null)
          ?.quick_log_presets;
        if (Array.isArray(saved) && saved.length === 4) {
          setPresets(saved as ActivityType[]);
        }
        setLoading(false);
      });
  }, [userId]);

  const savePresets = async (next: ActivityType[]) => {
    setPresets(next);
    if (!userId) {
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("metadata")
      .eq("id", userId)
      .single();

    const existing = (data?.metadata as Record<string, unknown> | null) ?? {};
    await supabase
      .from("profiles")
      .update({ metadata: { ...existing, quick_log_presets: next } })
      .eq("id", userId);
  };

  return { presets, savePresets, loading };
}
