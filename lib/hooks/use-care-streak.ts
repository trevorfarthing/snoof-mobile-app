import { usePetStore } from "@/lib/stores/use-pet-store";
import { supabase } from "@/lib/utils/supabase";
import { Database } from "@/types/database.types";
import { useEffect, useState } from "react";

export type StreakDayStatus = "met" | "in_progress" | "missed";

export type StreakDay = {
  day: string;
  status: StreakDayStatus;
  isToday: boolean;
};

export type CareStreak = {
  days: StreakDay[];
  currentStreak: number;
  longestStreak: number;
  loading: boolean;
};

type StreakRow =
  Database["public"]["Functions"]["get_pet_streak"]["Returns"][number];

export const useCareStreak = (
  petId: string | null,
  refreshKey = 0,
): CareStreak => {
  const petStoreLoading = usePetStore((s) => s.isLoading);
  const [days, setDays] = useState<StreakDay[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [fetching, setFetching] = useState(false);

  const loading = petStoreLoading || fetching || (!petId && days.length === 0);

  useEffect(() => {
    if (!petId) {
      setDays([]);
      setCurrentStreak(0);
      setLongestStreak(0);
      setFetching(false);
      return;
    }

    let cancelled = false;

    const fetchStreak = async () => {
      setFetching(true);

      const utcOffsetMinutes = -new Date().getTimezoneOffset();

      const { data, error } = await supabase.rpc("get_pet_streak" as any, {
        p_pet_id: petId!,
        p_utc_offset_minutes: utcOffsetMinutes,
      });

      if (cancelled) {
        return;
      }

      if (!error && data) {
        const rows = data as StreakRow[];
        setDays(
          rows.map((r) => ({
            day: r.day,
            status: r.status as StreakDayStatus,
            isToday: r.is_today,
          })),
        );
        // current_streak / longest_streak are duplicated across rows — read
        // from the first row, defaulting to 0 if the pet has no streak row yet.
        setCurrentStreak(rows[0]?.current_streak ?? 0);
        setLongestStreak(rows[0]?.longest_streak ?? 0);
      }

      setFetching(false);
    };

    fetchStreak();

    return () => {
      cancelled = true;
    };
  }, [petId, refreshKey]);

  return { days, currentStreak, longestStreak, loading };
};
