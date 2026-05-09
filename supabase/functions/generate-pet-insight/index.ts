import { createClient } from "jsr:@supabase/supabase-js@2";

/* Mirrors getTimePeriod from lib/utils/utils.ts — kept inline because Deno
   edge functions can't resolve the @/ alias or import from the RN source tree. */
const getTimePeriod = (hour: number): string => {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 21) {
    return "evening";
  }
  return "night";
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const SYSTEM_PROMPT = `You are a warm, knowledgeable dog care assistant inside a mobile app called Snoof.
Write a 2-3 sentence insight about the dog based on the structured JSON data provided.

Rules:
- Use specific numbers or trends when notable (e.g. "12% longer", "2.4 miles", "on track for a 6-day streak")
- Tailor tone and content to the time_of_day field: morning = motivational/plan-ahead, afternoon = check-in progress, evening = day review, night = recap and look-ahead
- Optionally end with a brief soft question or call-to-action if something needs attention (upcoming medication refill, vaccination due, etc.)
- Warm, encouraging, never clinical or preachy
- Plain prose only — no bullet points, no markdown formatting, no lists
- Never invent data that is not present in the JSON input. If a field is null or an array is empty, ignore it
- Output ONLY the insight text, nothing else`;

/* Stable MD5-like hash — good enough for cache invalidation. */
const hashString = async (str: string): Promise<string> => {
  const data = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16); // 16 hex chars is plenty for a cache key
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    /* ── Auth ─────────────────────────────────────────────────────────── */
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json(
        { error: "Missing authorization header" },
        { status: 401 },
      );
    }

    /* User client — respects RLS, used only to verify the JWT. */
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* Service client — bypasses RLS for context queries and insight upsert. */
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    /* ── Request body ─────────────────────────────────────────────────── */
    const { pet_id, utc_offset_minutes = 0 } = await req.json();
    if (!pet_id) {
      return Response.json({ error: "pet_id is required" }, { status: 400 });
    }

    /* ── Verify user has access to this pet ───────────────────────────── */
    const { data: accessCheck } = await serviceClient
      .from("pets")
      .select("id, household_id")
      .eq("id", pet_id)
      .single();

    if (!accessCheck) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }

    const { data: memberCheck } = await serviceClient
      .from("household_members")
      .select("user_id")
      .eq("household_id", accessCheck.household_id)
      .eq("user_id", user.id)
      .single();

    if (!memberCheck) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ── Build context snapshot ───────────────────────────────────────── */
    const nowDate = new Date();
    const localHour = new Date(nowDate.getTime() + utc_offset_minutes * 60_000);
    const timeBucket = getTimePeriod(localHour.getUTCHours());
    const localDate = localHour.toISOString().slice(0, 10);

    const { data: context, error: contextError } = await serviceClient.rpc(
      "get_pet_insight_context",
      { p_pet_id: pet_id, p_local_today: localDate },
    );

    if (contextError) {
      console.error("Context query failed:", contextError);
      return Response.json(
        { error: "Failed to build context" },
        { status: 500 },
      );
    }

    /* ── Not enough data — let client show fun fact instead ───────────── */
    const daysWithLogs =
      ((context as Record<string, unknown>).days_with_logs_total as number) ??
      0;
    if (daysWithLogs < 3) {
      return Response.json({ insight: null, has_enough_data: false });
    }

    /* ── Cache check ──────────────────────────────────────────────────── */
    const contextHash = await hashString(JSON.stringify(context) + timeBucket);

    const { data: cached } = await serviceClient
      .from("pet_insights")
      .select("insight_text, context_hash, time_of_day, generated_at")
      .eq("pet_id", pet_id)
      .single();

    if (cached && cached.context_hash === contextHash) {
      return Response.json({
        insight: cached.insight_text,
        has_enough_data: true,
        generated_at: cached.generated_at,
        cached: true,
      });
    }

    /* ── Call Gemini 2.0 Flash ────────────────────────────────────────── */
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return Response.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    const geminiPayload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({ time_of_day: timeBucket, ...context }),
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 120,
        temperature: 0.7,
      },
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      console.error("Gemini error:", err);
      return Response.json({ error: "AI generation failed" }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const insightText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!insightText) {
      return Response.json(
        { error: "Empty response from AI" },
        { status: 502 },
      );
    }

    /* ── Cache result ─────────────────────────────────────────────────── */
    const now = new Date().toISOString();
    await serviceClient.from("pet_insights").upsert(
      {
        pet_id,
        insight_text: insightText,
        time_of_day: timeBucket,
        context_hash: contextHash,
        generated_at: now,
      },
      { onConflict: "pet_id" },
    );

    return Response.json({
      insight: insightText,
      has_enough_data: true,
      generated_at: now,
      cached: false,
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
});
