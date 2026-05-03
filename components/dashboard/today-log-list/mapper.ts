import type { ActionModalInitialValues } from "@/components/dashboard/quick-log/action-modal";
import type { TodayLog } from "@/lib/hooks/activity-logs/use-today-logs";

const METERS_PER_MILE = 1609.344;

// Builds initial form values from a TodayLog so the form can be hydrated and
// shown in read-only mode. Only walk/feeding/potty are supported — other
// activity types don't have full forms yet.
export const mapLogToInitialValues = (
  log: TodayLog,
): ActionModalInitialValues => {
  if (log.type === "walk" && log.walk) {
    const w = log.walk;
    const distanceMiles =
      w.distance_meters !== null
        ? (Number(w.distance_meters) / METERS_PER_MILE).toFixed(2)
        : "";

    const totalMin =
      w.duration_sec !== null ? Math.round(w.duration_sec / 60) : null;
    const hours =
      totalMin !== null && totalMin >= 60
        ? String(Math.floor(totalMin / 60))
        : "";
    const minutes = totalMin !== null ? String(totalMin % 60) : "";

    const meta = (w.metadata ?? {}) as Record<string, string | undefined>;

    return {
      walk: {
        id: log.id,
        distanceMiles,
        hours,
        minutes,
        startedAt: w.started_at ? new Date(w.started_at) : null,
        endedAt: w.ended_at ? new Date(w.ended_at) : null,
        environment: (meta.environment as never) ?? null,
        weather: (meta.weather as never) ?? null,
        notes: log.notes ?? "",
        detailsExpanded: true,
      },
    };
  }

  if (log.type === "feeding" && log.feeding) {
    const f = log.feeding;
    return {
      feeding: {
        id: log.id,
        foodType: (f.food_type as never) ?? null,
        mealLabel: (f.meal_label as never) ?? null,
        foodName: f.food_name ?? "",
        amount: f.amount !== null ? String(f.amount) : "",
        amountUnit: (f.amount_unit as never) ?? null,
        occurredAt: new Date(log.occurredAt),
        notes: log.notes ?? "",
        detailsExpanded: true,
      },
    };
  }

  if (log.type === "potty" && log.potty) {
    const p = log.potty;
    const pottyTypes: ("pee" | "poo")[] =
      p.potty_type === "both" ? ["pee", "poo"] : [p.potty_type];
    return {
      potty: {
        id: log.id,
        pottyTypes,
        consistency: (p.consistency as never) ?? null,
        location: p.location ?? "",
        isAccident: p.is_accident ?? false,
        occurredAt: new Date(log.occurredAt),
        notes: log.notes ?? "",
        detailsExpanded: true,
      },
    };
  }

  return {};
};

// Builds an optimistic skeleton row so the Today list updates immediately on
// log. The next refetch replaces it with the server-authoritative version.
export const buildOptimisticLog = (type: TodayLog["type"]): TodayLog => ({
  id: `optimistic-${Date.now()}`,
  type,
  occurredAt: new Date().toISOString(),
  notes: null,
  walk: null,
  feeding: null,
  potty: null,
});
