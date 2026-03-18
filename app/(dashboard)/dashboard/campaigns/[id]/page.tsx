import { getCampaign, getContacts } from "@/lib/supabase/campaigns";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddContactForm from "@/components/campaigns/add-contact-form";
import ContactsTable from "@/components/campaigns/contacts-table";
import CsvImportButton from "@/components/campaigns/csv-import-button";
import CampaignStatusSelect from "@/components/campaigns/campaign-status-select";
import DeleteCampaignButton from "@/components/campaigns/delete-campaign-button";

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  draft:     { bg: "rgba(255,255,255,0.04)", color: "var(--rk-text-muted)", border: "rgba(255,255,255,0.1)" },
  active:    { bg: "rgba(34,197,94,0.08)",   color: "#4ade80",              border: "rgba(34,197,94,0.2)"   },
  paused:    { bg: "rgba(251,146,60,0.08)",  color: "#fb923c",              border: "rgba(251,146,60,0.2)"  },
  completed: { bg: "rgba(99,102,241,0.08)",  color: "#818cf8",              border: "rgba(99,102,241,0.2)"  },
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: campaign, error: cError }, { data: contacts, error: ctError }] =
    await Promise.all([getCampaign(id), getContacts(id)]);

  if (cError || !campaign) notFound();

  const st = STATUS_STYLES[campaign.status] ?? STATUS_STYLES.draft;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="rk-fade-up mb-8">
        <Link
          href="/dashboard/campaigns"
          className="flex items-center gap-1.5 text-xs mb-4 w-fit transition-colors"
          style={{ color: "var(--rk-text-muted)" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          All campaigns
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1
                className="text-3xl font-medium"
                style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
              >
                {campaign.name}
              </h1>
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
              >
                {campaign.status}
              </span>
            </div>
            {campaign.description && (
              <p className="text-sm" style={{ color: "var(--rk-text-muted)" }}>
                {campaign.description}
              </p>
            )}
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 flex-wrap">
            <CampaignStatusSelect campaignId={id} currentStatus={campaign.status} />
            <DeleteCampaignButton campaignId={id} campaignName={campaign.name} />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="rk-fade-up rk-delay-1 grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Contacts", value: contacts.length },
          { label: "Emails Sent", value: 0 },
          { label: "Open Rate", value: "—" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4"
            style={{ background: "var(--rk-surface)", border: "1px solid var(--rk-border)" }}
          >
            <div
              className="text-2xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
            >
              {s.value}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--rk-text-muted)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {ctError && (
        <div
          className="rk-fade-in mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
        >
          {ctError}
        </div>
      )}

      {/* 2-col: contacts list + add form */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Contacts table */}
        <div className="lg:col-span-3 rk-fade-up rk-delay-2">
          <div className="flex items-center gap-2 mb-3">
            <h2
              className="text-sm font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
            >
              Contacts
            </h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--rk-gold-dim)", color: "var(--rk-gold)", border: "1px solid rgba(212,168,83,0.2)" }}
            >
              {contacts.length}
            </span>
            <div className="ml-auto">
              <CsvImportButton campaignId={id} />
            </div>
          </div>
          <ContactsTable contacts={contacts} campaignId={id} />
        </div>

        {/* Add contact form */}
        <div className="lg:col-span-2 rk-fade-up rk-delay-3">
          <h2
            className="text-sm font-semibold mb-3"
            style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
          >
            Add Contact
          </h2>
          <AddContactForm campaignId={id} />
        </div>
      </div>
    </div>
  );
}
