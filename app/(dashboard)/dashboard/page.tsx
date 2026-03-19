import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getCampaigns } from "@/lib/supabase/campaigns";

const STAT_CARDS = [
  {
    label: "Campaigns",
    value: "0",
    sub: "No campaigns yet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
      </svg>
    ),
    color: "rgba(212,168,83,0.15)",
    iconColor: "#d4a853",
  },
  {
    label: "Contacts",
    value: "0",
    sub: "Import your first list",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "rgba(99,102,241,0.15)",
    iconColor: "#818cf8",
  },
  {
    label: "Emails Sent",
    value: "0",
    sub: "Ready to send",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: "rgba(34,197,94,0.12)",
    iconColor: "#4ade80",
  },
  {
    label: "Open Rate",
    value: "—",
    sub: "No data yet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    color: "rgba(251,146,60,0.12)",
    iconColor: "#fb923c",
  },
];

const NEXT_STEPS = [
  {
    step: "01",
    title: "Auth & Setup",
    desc: "Supabase auth, protected routes, login/signup pages, and the dashboard shell — fully wired up.",
    done: true,
    tag: "Phase 1 ✓",
  },
  {
    step: "02",
    title: "Campaigns & Contacts",
    desc: "Create campaigns, add contacts manually or via CSV import, and manage your outreach lists.",
    done: true,
    tag: "Phase 2 ✓",
  },
  {
    step: "03",
    title: "AI Email Generation",
    desc: "AI-powered email composer with {{first_name}}, {{company}} variables, live preview, and one-click generation.",
    done: true,
    tag: "Phase 3 ✓",
  },
  {
    step: "04",
    title: "Email Sending & Tracking",
    desc: "Send via Resend, track opens with pixels, track clicks — all stored back to Supabase.",
    done: false,
    tag: "Phase 4 — Next",
  },
  {
    step: "05",
    title: "Follow-ups & Analytics",
    desc: "Automated follow-ups via cron, open-rate dashboard, click charts, and contact status table.",
    done: false,
    tag: "Phase 5–6",
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: campaigns } = await getCampaigns();
  const totalContacts = campaigns.reduce((sum, c) => sum + (c.contact_count ?? 0), 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome header */}
      <div className="rk-fade-up mb-8">
        <h1
          className="text-3xl font-medium mb-1"
          style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
        >
          Welcome to ReachKit
          <span style={{ color: "var(--rk-gold)" }}>.</span>
        </h1>
        <p className="text-sm" style={{ color: "var(--rk-text-muted)" }}>
          Your AI-powered outreach dashboard · {user?.email}
        </p>
      </div>

      {/* Stats grid */}
      <div className="rk-fade-up rk-delay-1 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card) => {
          const value =
            card.label === "Campaigns" ? String(campaigns.length) :
            card.label === "Contacts"  ? String(totalContacts) :
            card.value;
          const sub =
            card.label === "Campaigns" && campaigns.length > 0
              ? `${campaigns.filter((c) => c.status === "active").length} active`
              : card.label === "Contacts" && totalContacts > 0
              ? `Across ${campaigns.length} campaign${campaigns.length !== 1 ? "s" : ""}`
              : card.sub;

          const inner = (
            <div
              key={card.label}
              className="rounded-xl p-5 flex flex-col gap-3 transition-all group"
              style={{
                background: "var(--rk-surface)",
                border: "1px solid var(--rk-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: card.color, color: card.iconColor }}
              >
                {card.icon}
              </div>
              <div>
                <div
                  className="text-2xl font-semibold mb-0.5"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--rk-text)",
                  }}
                >
                  {value}
                </div>
                <div
                  className="text-xs font-medium mb-0.5 uppercase tracking-wider"
                  style={{ color: "var(--rk-text-muted)" }}
                >
                  {card.label}
                </div>
                <div className="text-[11px]" style={{ color: "var(--rk-text-sub)" }}>
                  {sub}
                </div>
              </div>
            </div>
          );

          if (card.label === "Campaigns" || card.label === "Contacts") {
            return (
              <Link key={card.label} href="/dashboard/campaigns" className="block">
                {inner}
              </Link>
            );
          }
          return <div key={card.label}>{inner}</div>;
        })}
      </div>

      {/* Main 2-col */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Next Steps */}
        <div
          className="rk-fade-up rk-delay-2 lg:col-span-3 rounded-xl p-6"
          style={{
            background: "var(--rk-surface)",
            border: "1px solid var(--rk-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
            >
              Roadmap
            </h2>
            <div
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "var(--rk-gold-dim)",
                color: "var(--rk-gold)",
                border: "1px solid rgba(212,168,83,0.2)",
              }}
            >
              3 / 5
            </div>
          </div>

          <div className="space-y-3">
            {NEXT_STEPS.map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-4 p-3 rounded-lg transition-colors"
                style={{
                  border: s.done
                    ? "1px solid rgba(34,197,94,0.2)"
                    : "1px solid var(--rk-border)",
                  background: s.done
                    ? "rgba(34,197,94,0.04)"
                    : "var(--rk-surface-2)",
                  opacity: s.done ? 1 : 0.85,
                }}
              >
                <div
                  className="shrink-0 text-xs font-mono font-bold mt-0.5"
                  style={{ color: s.done ? "#4ade80" : "var(--rk-gold)", opacity: 0.8 }}
                >
                  {s.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <div
                      className="text-sm font-medium"
                      style={{ color: s.done ? "var(--rk-text)" : "var(--rk-text)" }}
                    >
                      {s.title}
                    </div>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        background: s.done
                          ? "rgba(34,197,94,0.1)"
                          : s.tag.includes("Next")
                          ? "var(--rk-gold-dim)"
                          : "var(--rk-surface)",
                        color: s.done
                          ? "#4ade80"
                          : s.tag.includes("Next")
                          ? "var(--rk-gold)"
                          : "var(--rk-text-sub)",
                        border: s.done
                          ? "1px solid rgba(34,197,94,0.2)"
                          : s.tag.includes("Next")
                          ? "1px solid rgba(212,168,83,0.2)"
                          : "1px solid var(--rk-border)",
                      }}
                    >
                      {s.tag}
                    </span>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: "var(--rk-text-muted)" }}>
                    {s.desc}
                  </div>
                </div>
                <div
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    background: s.done ? "rgba(34,197,94,0.12)" : "var(--rk-surface)",
                    border: s.done ? "1px solid rgba(34,197,94,0.3)" : "1px solid var(--rk-border-md)",
                  }}
                >
                  {s.done && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links + info */}
        <div className="rk-fade-up rk-delay-3 lg:col-span-2 space-y-4">
          {/* Build status */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--rk-surface)",
              border: "1px solid var(--rk-border)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
            >
              Build Status
            </h3>
            {[
              { label: "Auth & Setup", done: true },
              { label: "Campaigns", done: true },
              { label: "AI Generation", done: true },
              { label: "Email Sending", done: false },
              { label: "Analytics", done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 py-1.5">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: item.done
                      ? "rgba(34,197,94,0.12)"
                      : "var(--rk-surface-2)",
                    border: item.done
                      ? "1px solid rgba(34,197,94,0.3)"
                      : "1px solid var(--rk-border)",
                  }}
                >
                  {item.done && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-xs"
                  style={{
                    color: item.done ? "var(--rk-text-muted)" : "var(--rk-text-sub)",
                  }}
                >
                  {item.label}
                </span>
                {!item.done && (
                  <span
                    className="ml-auto text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      background: "var(--rk-surface-2)",
                      color: "var(--rk-text-sub)",
                    }}
                  >
                    Soon
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Stack */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--rk-surface)",
              border: "1px solid var(--rk-border)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
            >
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Next.js 16", "Supabase", "Gemini AI", "Resend", "Tailwind", "shadcn/ui"].map(
                (tech) => (
                  <span
                    key={tech}
                    className="text-[11px] px-2 py-1 rounded-md"
                    style={{
                      background: "var(--rk-surface-2)",
                      border: "1px solid var(--rk-border)",
                      color: "var(--rk-text-muted)",
                    }}
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
