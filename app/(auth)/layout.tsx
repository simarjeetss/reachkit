export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--rk-bg)" }}
    >
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(135deg, #0d0d0f 0%, #141416 40%, #1a1508 100%)",
          borderRight: "1px solid var(--rk-border)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute"
          style={{
            top: "15%",
            left: "10%",
            width: "420px",
            height: "420px",
            background:
              "radial-gradient(circle, rgba(212,168,83,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "10%",
            right: "5%",
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, rgba(212,168,83,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--rk-gold) 1px, transparent 1px), linear-gradient(90deg, var(--rk-gold) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Logo */}
        <div className="rk-fade-up relative z-10">
          <span
            className="text-2xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--rk-text)",
            }}
          >
            ReachKit<span style={{ color: "var(--rk-gold)" }}>.ai</span>
          </span>
        </div>

        {/* Central quote */}
        <div className="relative z-10">
          <div
            className="rk-fade-up rk-delay-1 mb-6 w-10 h-[2px]"
            style={{ background: "var(--rk-gold)" }}
          />
          <blockquote
            className="rk-fade-up rk-delay-2 mb-6 text-4xl font-medium leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--rk-text)",
              fontStyle: "italic",
            }}
          >
            "The right email, to the right person, at exactly the right moment."
          </blockquote>
          <p
            className="rk-fade-up rk-delay-3 text-sm"
            style={{ color: "var(--rk-text-muted)" }}
          >
            AI-powered outreach that learns your voice
          </p>
        </div>

        {/* Bottom stats row */}
        <div className="rk-fade-up rk-delay-4 relative z-10 grid grid-cols-3 gap-6">
          {[
            { value: "GPT-4", label: "Powered" },
            { value: "∞", label: "Contacts" },
            { value: "Auto", label: "Follow-ups" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                className="text-2xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--rk-gold)",
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--rk-text-sub)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 rk-fade-in">
          <span
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--rk-text)",
            }}
          >
            ReachKit<span style={{ color: "var(--rk-gold)" }}>.ai</span>
          </span>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
