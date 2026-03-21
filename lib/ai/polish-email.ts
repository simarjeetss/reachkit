"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAndIncrementAiUsage } from "@/lib/supabase/ai-usage";
import { FREE_AI_LIMIT } from "@/lib/supabase/ai-usage-config";

export interface PolishEmailInput {
  userInput: string;
  mode: "prompt" | "polish";
  campaignName: string;
  senderName?: string | null;
}

export interface PolishEmailResult {
  body: string;
  subject?: string;
  error?: string;
}

export async function polishEmailWithAI(
  input: PolishEmailInput
): Promise<PolishEmailResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return { body: "", error: "AI is not configured. Add GEMINI_API_KEY to your environment." };

  if (!input.userInput.trim())
    return { body: "", error: "Please enter a prompt or draft before generating." };

  // ── Rate-limit check ──────────────────────────────────────────────────────
  const usage = await checkAndIncrementAiUsage();
  if (usage.limitExceeded) {
    return {
      body: "",
      error: `__RATE_LIMIT__:You've used all ${FREE_AI_LIMIT} free AI generations. Upgrade to a paid plan for unlimited access.`,
    };
  }
  if (usage.error) {
    console.warn("[AI rate limit] Usage check error:", usage.error);
  }
  // ─────────────────────────────────────────────────────────────────────────

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const sender = input.senderName ?? "the sender";

  const sharedRules = `
- Keep the tone professional but warm
- Use {{first_name}} and {{company}} as exact placeholder variables (keep double curly braces — they get replaced per-contact at send time)
- Write the sender's name as "${sender}" — do NOT output {{sender_name}} as a placeholder
- No hollow filler phrases like "I hope this email finds you well"
- Do NOT add a sign-off like "Best regards" — the system adds that automatically`;

  const prompt =
    input.mode === "prompt"
      ? `You are an expert cold email copywriter. Write a professional cold outreach email based on the following brief.

Campaign context: "${input.campaignName}"
Sender: ${sender}
User's brief: ${input.userInput}

Rules:${sharedRules}
- Subject line: punchy, under 50 characters
- Body: 3–5 short paragraphs with a clear call-to-action

Respond with ONLY valid JSON:
{ "subject": "...", "body": "..." }`
      : `You are an expert email editor. Rewrite the following rough draft into a polished cold outreach email.

Campaign context: "${input.campaignName}"
Sender: ${sender}
User's draft:
---
${input.userInput}
---

Rules:${sharedRules}
- Preserve the original intent and any specific details from the draft
- Improve clarity, tone, and persuasiveness
- Keep it concise — trim anything redundant

Respond with ONLY valid JSON:
{ "body": "..." }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const clean = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(clean) as { subject?: string; body: string };

    if (!parsed.body) throw new Error("Incomplete response from AI");

    return { body: parsed.body, subject: parsed.subject };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { body: "", error: `AI generation failed: ${msg}` };
  }
}
