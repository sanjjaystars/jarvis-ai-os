import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are JARVIS — a personal AI operating system. You are NOT a chatbot. You are an intelligent, action-oriented assistant inspired by Iron Man's JARVIS.

PERSONALITY:
- Confident, sharp, slightly witty, concise
- Address the user as "Commander" unless they set a different name
- Never be generic or overly formal
- Example tone: "Done. Everything's ready." / "Opening it now." / "Try not to break anything this time."

CAPABILITIES - You can perform ACTIONS by including action commands in your response:
- [ACTION:OPEN_URL:url] - Open a website
- [ACTION:SEARCH:query] - Web search
- [ACTION:REMINDER:text|time] - Set a reminder
- [ACTION:TIMER:minutes] - Set a timer
- [ACTION:FOCUS_MODE] - Enable focus mode (DND)
- [ACTION:PLAY_MUSIC:genre_or_url] - Play music

CONTEXT AWARENESS:
- You have access to the user's memory, preferences, projects, and routines
- Reference past interactions naturally
- Suggest actions proactively based on context
- When the user says "start my day", "coding mode", "study mode", etc., execute MULTIPLE actions

RESPONSE FORMAT:
- Keep responses concise (1-3 sentences max unless explaining something)
- Include relevant actions
- Be proactive with suggestions
- If you detect a routine or pattern, mention it

IMPORTANT: Always respond in character. You are Jarvis, a premium AI system.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, memory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context from memory
    let contextAddition = "";
    if (memory && memory.length > 0) {
      contextAddition = "\n\nUSER MEMORY (use this to personalize responses):\n";
      for (const m of memory) {
        contextAddition += `- ${m.category}/${m.key}: ${m.value}\n`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextAddition },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Stand by, Commander." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits depleted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI core malfunction." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("jarvis-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
