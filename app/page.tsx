import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex min-h-screen items-center justify-center relative overflow-hidden"
      style={{ background: "var(--rk-bg)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse, rgba(212,168,83,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--rk-gold) 1px, transparent 1px), linear-gradient(90deg, var(--rk-gold) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <main className="relative z-10 flex flex-col items-center px-6 py-24 text-center">
        {/* Brand */}
        <div className="rk-fade-up mb-6">
          <h1
            className="text-5xl font-medium tracking-tight sm:text-6xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--rk-text)" }}
          >
            ReachKit<span style={{ color: "var(--rk-gold)" }}>.ai</span>
          </h1>
        </div>

        {/* Tagline */}
        <p
          className="rk-fade-up rk-delay-1 mb-3 max-w-2xl text-xl sm:text-2xl"
          style={{ color: "var(--rk-text-muted)", fontStyle: "italic", fontFamily: "var(--font-display)" }}
        >
          AI-powered cold email outreach that learns from you
        </p>

        {/* Description */}
        <p
          className="rk-fade-up rk-delay-2 mb-12 max-w-lg text-sm leading-relaxed"
          style={{ color: "var(--rk-text-sub)" }}
        >
          Create personalized campaigns, generate AI-written emails, and automate
          follow-ups with intelligent tracking and analytics.
        </p>

        {/* Features */}
        <div className="rk-fade-up rk-delay-3 mb-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { title: "AI Email Generation", desc: "GPT-4 powered emails that match your voice" },
            { title: "Smart Follow-ups", desc: "Automatic follow-ups based on engagement" },
            { title: "Analytics & Insights", desc: "Track opens, clicks, and performance" },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-5 text-left"
              style={{
                background: "var(--rk-surface)",
                border: "1px solid var(--rk-border)",
              }}
            >
              <div
                className="w-1 h-5 rounded-full mb-3"
                style={{ background: "var(--rk-gold)" }}
              />
              <h3
                className="font-medium mb-1 text-sm"
                style={{ color: "var(--rk-text)" }}
              >
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--rk-text-muted)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="rk-fade-up rk-delay-4 flex flex-col gap-3 sm:flex-row">
          <Link href="/signup">
            <button className="rk-btn-gold" style={{ width: "auto", padding: "0.75rem 2.5rem" }}>
              Get Started Free
            </button>
          </Link>
          <Link href="/login">
            <button className="rk-btn-ghost" style={{ width: "auto", padding: "0.73rem 2.5rem" }}>
              Sign In
            </button>
          </Link>
        </div>

        <p
          className="rk-fade-up rk-delay-5 mt-8 text-xs"
          style={{ color: "var(--rk-text-sub)" }}
        >
          In active development · Phase 1 complete
        </p>
      </main>
    </div>
  );
}
