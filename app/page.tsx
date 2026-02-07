export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <main className="flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            ReachKit<span className="text-blue-600">.ai</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="mb-4 max-w-2xl text-xl text-zinc-600 dark:text-zinc-400 sm:text-2xl">
          AI-powered cold email outreach that learns from you
        </p>

        {/* Description */}
        <p className="mb-12 max-w-xl text-base text-zinc-500 dark:text-zinc-500">
          Create personalized campaigns, generate AI-written emails, and automate follow-ups with intelligent tracking and analytics.
        </p>

        {/* Features Grid */}
        <div className="mb-16 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 font-semibold text-black dark:text-white">AI Email Generation</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              GPT-4 powered personalized emails that match your style
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 font-semibold text-black dark:text-white">Smart Follow-ups</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Automatic follow-ups based on engagement tracking
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 font-semibold text-black dark:text-white">Analytics & Insights</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Track opens, clicks, and campaign performance
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <p className="rounded-lg bg-black px-8 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
            In Progress...
          </p>
        </div>
      </main>
    </div>
  );
}
