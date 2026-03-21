"use server";

import { createClient } from "@/lib/supabase/server";

export type AnalyticsCampaign = {
  id: string;
  name: string;
  status: string;
};

export type AnalyticsRow = {
  id: string;
  campaign_id: string | null;
  contact_id: string | null;
  status: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
  contacts?: {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    company?: string | null;
  } | null;
  campaigns?: {
    name?: string | null;
  } | null;
};

export type AnalyticsOverview = {
  campaigns: AnalyticsCampaign[];
  rows: AnalyticsRow[];
  error: string | null;
};

export async function getAnalyticsOverview(rangeDays: number): Promise<AnalyticsOverview> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { campaigns: [], rows: [], error: "Not authenticated" };

  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("id, name, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (campaignsError) return { campaigns: [], rows: [], error: campaignsError.message };

  const since = new Date();
  since.setDate(since.getDate() - Math.max(1, Math.min(rangeDays, 365)));

  const { data: rows, error: rowsError } = await supabase
    .from("sent_emails")
    .select(
      "id, campaign_id, contact_id, status, sent_at, opened_at, clicked_at, created_at, contacts(email, first_name, last_name, company), campaigns(name)"
    )
    .eq("user_id", user.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (rowsError) return { campaigns: campaigns ?? [], rows: [], error: rowsError.message };

  return {
    campaigns: (campaigns ?? []) as AnalyticsCampaign[],
    rows: (rows ?? []) as AnalyticsRow[],
    error: null,
  };
}
