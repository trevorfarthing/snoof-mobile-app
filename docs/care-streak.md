# Care Streak

How the daily care streak feature works end to end.

## What it is

A streak day is a local day on which a pet met all of its active daily goals. The dashboard shows the last 7 days as paw circles plus a current streak count and a best (longest) streak count.

Each paw is one of three states:

- **met** (green, filled): the pet hit every active goal that day
- **in_progress** (orange, dashed): today, with some activity logged but goals not all met yet
- **missed** (gray): no goals met that day

## Database

### Tables

`activity_logs` (existing, with new columns)

- `utc_offset_minutes SMALLINT NOT NULL`: the writer's UTC offset at insert time. Frozen. Never changes on edits.
- `local_day DATE NOT NULL`: derived from `occurred_at + utc_offset_minutes` by a BEFORE trigger on every insert and on updates of either source column. Used for bucketing logs by the day they actually happened in the writer's local time. We use a trigger rather than a generated column because the natural expression involves `AT TIME ZONE`, which Postgres treats as STABLE rather than IMMUTABLE.

`pet_streak_days` (new)

- One row per (pet_id, day) combination where the pet met all goals.
- Stores `goals_snapshot JSONB`: the goal definitions that applied when the day was first met. This is the freeze record. It guarantees that changing a goal later does not retroactively un-meet a past day.

`pet_streaks` (new)

- One row per pet. Cached counts so the dashboard does not have to recompute on every read.
- Fields: `current_streak`, `longest_streak`, `last_met_day`.

### Functions

`evaluate_pet_day(pet_id, day) -> (all_met, snapshot)`

- Decides if a given day is met.
- If a `pet_streak_days` row already exists for that day, it evaluates against the frozen snapshot stored on that row.
- If no row exists, it evaluates against current `pet_daily_goals`.
- Returns `(false, NULL)` if there are no goals to evaluate (pet is paused).

`recompute_pet_streak(pet_id, day) -> void`

- Calls `evaluate_pet_day` for that (pet, day).
- If met, upserts the `pet_streak_days` row. The original snapshot is preserved on update.
- If not met, deletes any existing row for that day.
- Walks back from the most recent met day to find the new current streak length and updates the `pet_streaks` cache (important if the user deleted an old log).

`get_pet_streak(pet_id, utc_offset_minutes) -> rows`

- The RPC the client calls to render the card.
- Returns 7 rows (one per day in the past week) with status, plus the cached current and longest counts.
- Uses `utc_offset_minutes` only to figure out what "today" means for the in-progress cell. Past days come straight from `pet_streak_days` by their stored `local_day`.
- Treats the cached `current_streak` as 0 if `last_met_day` is older than yesterday (the streak has lapsed since the cache was written).

### Triggers

All triggers are statement-level on `AFTER` events. They fire synchronously inside the same transaction as the write, so the streak is up to date by the time the client gets a response.

- `walks_streak_insert` and `feedings_streak_insert`: recompute when a new walk or feeding is added. These are the real handler for new logs because the client inserts the child row in a separate request after the parent activity_logs row, so an activity_logs INSERT trigger would fire before the goal-relevant data exists.
- `walks_streak_update` and `feedings_streak_update`: recompute when child-table edits change values that goals depend on (walk distance, walk duration, food type, etc.).
- `activity_logs_streak_update`: recomputes both the old and new local day. Catches the case where an edit to `occurred_at` shifts which day a log belongs to (the child rows are unchanged in that case, so their triggers wouldn't fire).
- `activity_logs_streak_delete`: recomputes the deleted log's local day. Handles deletes uniformly for all activity types.

There is intentionally no trigger on `pet_daily_goals` changes. See "Goal changes" below.

## Flow

### Logging an activity

1. Client builds the log payload, including the writer's current `utc_offset_minutes`.
2. Insert into `activity_logs`. The BEFORE trigger sets `local_day` from `occurred_at` and `utc_offset_minutes`.
3. Insert into the child table (`walks`, `feedings`, etc.).
4. The activity log insert trigger fires `recompute_pet_streak(pet_id, local_day)`.
5. `evaluate_pet_day` checks whether all current goals are met (or all snapshot goals if today already has a row).
6. If met, the row is upserted in `pet_streak_days` and the cache is updated. If not, any existing row is deleted and the cache is updated.
7. The client refetches the streak via `get_pet_streak` and the dashboard updates.

### Editing or deleting an activity

Same path. The trigger handles update and delete. For an update that shifts `local_day`, both the old and new day are recomputed.

If a delete causes a previously met day to no longer meet its frozen snapshot, the row is removed and the current streak is recomputed. This can collapse a long streak if the deleted log was holding it together. A future UI confirmation should warn the user when this is about to happen.

### Reading the dashboard

The client calls `get_pet_streak(pet_id, utc_offset_minutes)`. It returns the 7 day window plus current and longest counts. The hook in `lib/hooks/use-care-streak.ts` shapes the response and hands it to `CareStreakCard`.

## Goal changes

Goal create, update, and delete do not trigger any recompute. This is on purpose.

If we recomputed past days when goals changed, we would re-evaluate them against the new goal definitions and risk un-meeting historical days that were legitimately met under the old goals. The frozen snapshot on each `pet_streak_days` row exists to prevent that.

The tradeoff: if a user changes a goal mid-day and does not log anything else that day, today's status will not refresh until their next log. Acceptable lag for a rare action.

When the goal create/update UI is built, the client should call `recompute_pet_streak(pet_id, today)` once after a successful save. That covers the lag without involving any database trigger and without risking historical re-evaluation.

## Timezone handling

There is no timezone column on `households` or `profiles`. Each `activity_logs` row carries the writer's UTC offset at the time it was created. A BEFORE trigger derives `local_day` from that.

This means:

- A log made in NYC stays bucketed to its NYC day forever. Moving to LA does not re-bucket past logs.
- Editing a log does not change its `utc_offset_minutes`. The walk happened where it happened.
- Multiple household members in different timezones see the same day attribution because `local_day` is set by whoever logged the activity, not by whoever is reading.
- The dashboard's "today" comes from the reading client's current offset, passed into `get_pet_streak`.

The edit time picker should display log times in their original offset, not the device's current offset, to keep edits consistent. That is a UI concern, not a schema one.

## Pause behavior

A pet with no active goals is paused. No streak days accrue. The dashboard shows today as in_progress and past days as missed. Adding a goal starts the streak from the next met day forward.

## Performance notes

- All trigger work is bounded by single-pet, single-day queries. Indexed lookups, sub-10ms in practice.
- The walk-back loop in `recompute_pet_streak` is bounded by streak length and runs only when a write actually changes a streak day. Each iteration is one indexed lookup.
- `get_pet_streak` reads the cache row plus a 7-day join against `pet_streak_days`. Constant work per dashboard load.
