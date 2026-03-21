export default function DashboardSectionLoading() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="rk-fade-in mb-8">
        <div
          className="h-8 w-52 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <div
          className="mt-2 h-4 w-64 rounded-lg animate-pulse"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={`dashboard-loading-card-${index}`}
            className="rounded-xl p-5"
            style={{ background: "var(--rk-surface)", border: "1px solid var(--rk-border)" }}
          >
            <div
              className="h-4 w-20 rounded-md animate-pulse"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <div
              className="mt-3 h-6 w-24 rounded-md animate-pulse"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />
            <div
              className="mt-4 h-3 w-full rounded-md animate-pulse"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
