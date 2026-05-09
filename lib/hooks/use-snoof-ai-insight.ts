import { supabase } from "@/lib/utils/supabase";
import { useEffect, useRef, useState } from "react";
import { getTimePeriod } from "../utils/utils";

export type InsightState =
  | { status: "loading" }
  | { status: "fun_fact" }
  | { status: "ready"; text: string; generatedAt: string };

type CachedInsight = {
  insight_text: string;
  time_of_day: string;
  generated_at: string;
};

/* Returns true when the cached insight should be regenerated. */
const isStale = (cached: CachedInsight): boolean => {
  const today = new Date().toDateString();
  const cachedDate = new Date(cached.generated_at).toDateString();
  const sameBucket =
    getTimePeriod(new Date().getHours()) === cached.time_of_day;
  return cachedDate !== today || !sameBucket;
};

export const useSnoofAiInsight = (petId: string | null, refreshKey = 0) => {
  const [state, setState] = useState<InsightState>({ status: "loading" });
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!petId) {
      setState({ status: "loading" });
      return;
    }

    let cancelled = false;
    pendingRef.current = false;

    const run = async () => {
      /* Step 1: serve cached insight immediately if one exists. */
      const { data: cached } = await supabase
        .from("pet_insights" as any)
        .select("insight_text, time_of_day, generated_at")
        .eq("pet_id", petId)
        .single<CachedInsight>();

      if (cancelled) {
        return;
      }

      if (cached) {
        setState({
          status: "ready",
          text: cached.insight_text,
          generatedAt: cached.generated_at,
        });
      }

      /* Step 2: regenerate in the background if stale or missing. */
      if (!cached || isStale(cached)) {
        if (pendingRef.current) {
          return;
        }
        pendingRef.current = true;

        const utcOffsetMinutes = -new Date().getTimezoneOffset();

        const { data, error } = await supabase.functions.invoke(
          "generate-pet-insight",
          { body: { pet_id: petId, utc_offset_minutes: utcOffsetMinutes } },
        );

        pendingRef.current = false;
        if (cancelled) {
          return;
        }

        if (error || !data) {
          /* If we already have a cached insight, keep showing it. */
          if (!cached) {
            setState({ status: "fun_fact" });
          }
          return;
        }

        if (!data.has_enough_data) {
          setState({ status: "fun_fact" });
          return;
        }

        setState({
          status: "ready",
          text: data.insight,
          generatedAt: data.generated_at,
        });
      } else if (!cached) {
        setState({ status: "fun_fact" });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [petId, refreshKey]);

  return state;
};
