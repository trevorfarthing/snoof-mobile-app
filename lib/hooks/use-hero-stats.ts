import { usePetStore } from "@/lib/stores/use-pet-store";
import { supabase } from "@/lib/utils/supabase";
import type { Database } from "@/types/database.types";
import { useEffect, useState } from "react";

type GoalProgressRow =
  Database["public"]["Functions"]["get_pet_goal_progress"]["Returns"][number];
type UpcomingEventRow =
  Database["public"]["Functions"]["get_next_upcoming_event"]["Returns"][number];

export type GoalProgress = {
  goalId: string;
  goalType: "walk_distance" | "walk_duration" | "meal_count";
  targetValue: number;
  targetUnit: string;
  heroCardSlot: number;
  currentValue: number;
};

export type UpcomingEvent = {
  eventType: "vaccination" | "vet_visit" | "medication_refill";
  title: string;
  dueDate: string;
  daysUntil: number;
} | null;

export type HeroStats = {
  goalProgress: GoalProgress[];
  upcomingEvent: UpcomingEvent;
  loading: boolean;
};

export const useHeroStats = (
  petId: string | null,
  refreshKey = 0,
): HeroStats => {
  const petStoreLoading = usePetStore((s) => s.isLoading);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent>(null);
  const [fetching, setFetching] = useState(false);

  // Show loading skeleton while the pet store is still loading OR while fetching stats
  const loading =
    petStoreLoading || fetching || (!petId && goalProgress.length === 0);

  useEffect(() => {
    if (!petId) {
      setGoalProgress([]);
      setUpcomingEvent(null);
      setFetching(false);
      return;
    }

    let cancelled = false;

    const fetchStats = async () => {
      setFetching(true);

      const utcOffsetMinutes = -new Date().getTimezoneOffset();

      const [goalsResult, eventResult] = await Promise.all([
        supabase.rpc("get_pet_goal_progress", {
          p_pet_id: petId!,
          p_utc_offset_minutes: utcOffsetMinutes,
        }),
        supabase.rpc("get_next_upcoming_event", { p_pet_id: petId! }),
      ]);

      if (cancelled) {
        return;
      }

      if (goalsResult.data) {
        setGoalProgress(
          (goalsResult.data as GoalProgressRow[]).map((row) => ({
            goalId: row.goal_id,
            goalType: row.goal_type as GoalProgress["goalType"],
            targetValue: row.target_value,
            targetUnit: row.target_unit,
            heroCardSlot: row.hero_card_slot,
            currentValue: row.current_value,
          })),
        );
      }

      if (eventResult.data && eventResult.data.length > 0) {
        const row = (eventResult.data as UpcomingEventRow[])[0];
        setUpcomingEvent({
          eventType: row.event_type as NonNullable<UpcomingEvent>["eventType"],
          title: row.title,
          dueDate: row.due_date,
          daysUntil: row.days_until,
        });
      } else {
        setUpcomingEvent(null);
      }

      setFetching(false);
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [petId, refreshKey]);

  return { goalProgress, upcomingEvent, loading };
};
