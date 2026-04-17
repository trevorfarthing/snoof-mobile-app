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

export function useHeroStats(petId: string | null): HeroStats {
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId) {
      setGoalProgress([]);
      setUpcomingEvent(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchStats() {
      setLoading(true);

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

      setLoading(false);
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [petId]);

  return { goalProgress, upcomingEvent, loading };
}
