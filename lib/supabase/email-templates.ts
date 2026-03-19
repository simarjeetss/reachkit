"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface EmailTemplate {
  id: string;
  campaign_id: string;
  user_id: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at: string;
}

/** Fetch the email template for a campaign (null if none exists yet) */
export async function getEmailTemplate(
  campaignId: string
): Promise<{ data: EmailTemplate | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: data as EmailTemplate | null, error: null };
}

/** Save (upsert) an email template — one per campaign */
export async function saveEmailTemplate(
  campaignId: string,
  subject: string,
  body: string
): Promise<{ data: EmailTemplate | null; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated" };

  if (!subject.trim()) return { data: null, error: "Subject is required." };
  if (!body.trim())    return { data: null, error: "Body is required." };

  const { data, error } = await supabase
    .from("email_templates")
    .upsert(
      { campaign_id: campaignId, user_id: user.id, subject: subject.trim(), body: body.trim() },
      { onConflict: "campaign_id" }
    )
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
  return { data: data as EmailTemplate, error: null };
}
