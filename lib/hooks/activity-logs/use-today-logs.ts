import type { ActivityType } from "@/components/dashboard/quick-log/activity-config";
import { supabase } from "@/lib/utils/supabase";
import { Database } from "@/types/database.types";
import { useCallback, useEffect, useState } from "react";

export type TodayLogWalk = {
  id: string;
  started_at: string | null;
  ended_at: string | null;
  duration_sec: number | null;
  distance_meters: number | null;
  avg_pace: number | null;
  calories_est: number | null;
  metadata: Record<string, unknown> | null;
};

export type TodayLogFeeding = {
  id: string;
  food_name: string | null;
  food_type: string | null;
  amount: number | null;
  amount_unit: string | null;
  meal_label: string | null;
};

export type TodayLogPotty = {
  id: string;
  potty_type: "pee" | "poo" | "both";
  consistency: string | null;
  location: string | null;
  is_accident: boolean | null;
};

export type TodayLog = {
  id: string;
  type: ActivityType;
  occurredAt: string;
  notes: string | null;
  walk: TodayLogWalk | null;
  feeding: TodayLogFeeding | null;
  potty: TodayLogPotty | null;
};

type RpcRow =
  Database["public"]["Functions"]["get_today_activity_logs"]["Returns"][number];

const mapRow = (row: RpcRow): TodayLog => ({
  id: row.id,
  type: row.type as ActivityType,
  occurredAt: row.occurred_at,
  notes: row.notes,
  walk: row.walk as TodayLogWalk,
  feeding: row.feeding as TodayLogFeeding,
  potty: row.potty as TodayLogPotty,
});

export const useTodayLogs = (petId: string | null, refreshKey = 0) => {
  const [logs, setLogs] = useState<TodayLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!petId) {
      setLogs([]);
      return;
    }

    setLoading(true);
    setError(null);

    const utcOffsetMinutes = -new Date().getTimezoneOffset();

    const {
      data,
      error: rpcErr,
    }: { data: RpcRow[] | null; error: { message: string } | null } =
      await supabase.rpc("get_today_activity_logs", {
        p_pet_id: petId,
        p_utc_offset_minutes: utcOffsetMinutes,
      });

    if (rpcErr) {
      setError(rpcErr.message);
      setLoading(false);
      return;
    }

    setLogs((data ?? []).map((row) => mapRow(row)));
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshKey]);

  // Prepend an optimistic row. The next refetch will replace it with the
  // server-authoritative version (matched by id when possible).
  const addOptimistic = useCallback((log: TodayLog) => {
    setLogs((prev) => [log, ...prev.filter((l) => l.id !== log.id)]);
  }, []);

  return { logs, loading, error, addOptimistic, refetch: fetchLogs };
};
