export function PageSkeletonLoader() {
  return (
    <div
      className="min-h-screen flex flex-col pb-24 animate-pulse select-none"
      style={{ background: "#131313", color: "#e5e2e1" }}
      aria-label="Loading content..."
      role="status"
    >
      {/* ── Top Header Skeleton ────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(19, 19, 19, 0.95)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Hamburger button skeleton */}
          <div className="w-8 h-8 rounded-lg bg-zinc-800/80" />
          <div className="flex flex-col gap-1.5">
            {/* Title skeleton */}
            <div className="w-28 h-4 rounded bg-zinc-800/90" />
            {/* Subtitle skeleton */}
            <div className="w-36 h-2.5 rounded bg-zinc-800/50" />
          </div>
        </div>

        {/* Action button skeleton */}
        <div className="w-20 h-7 rounded-md bg-zinc-800/70" />
      </header>

      {/* ── Main Content Skeleton ──────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-5 flex flex-col gap-6 max-w-lg mx-auto w-full">
        {/* Routines Section Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="w-32 h-5 rounded bg-zinc-800/80" />
          <div className="w-20 h-7 rounded bg-zinc-800/60" />
        </div>

        {/* Routine Cards Skeleton */}
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center rounded-xl p-4"
              style={{
                background: "#121212",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="w-28 h-4 rounded bg-zinc-800" />
                <div className="w-20 h-3 rounded bg-zinc-800/50" />
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-7 rounded bg-zinc-800/60" />
                <div className="w-16 h-7 rounded bg-zinc-800/80" />
              </div>
            </div>
          ))}
        </div>

        {/* Progression Chart Card Skeleton */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            background: "#121212",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          {/* Chart Header */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1.5">
              <div className="w-24 h-3 rounded bg-zinc-800/50" />
              <div className="w-44 h-5 rounded bg-zinc-800" />
            </div>
            <div className="w-16 h-3 rounded bg-zinc-800/50" />
          </div>

          {/* Exercise Filter Pills Skeleton */}
          <div className="flex gap-2 overflow-hidden">
            <div className="w-20 h-6 rounded-full bg-zinc-800" />
            <div className="w-24 h-6 rounded-full bg-zinc-800/50" />
            <div className="w-20 h-6 rounded-full bg-zinc-800/50" />
          </div>

          {/* Bento Metric Boxes Skeleton */}
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl p-3 flex flex-col gap-1.5"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                <div className="w-16 h-2.5 rounded bg-zinc-800/50" />
                <div className="w-20 h-6 rounded bg-zinc-800" />
              </div>
            ))}
          </div>

          {/* Faux Graph Canvas Skeleton */}
          <div
            className="w-full h-36 rounded-xl bg-zinc-900/60 flex items-end justify-between p-4"
            style={{ border: "1px solid rgba(255, 255, 255, 0.04)" }}
          >
            <div className="w-2 h-10 rounded-t bg-zinc-800" />
            <div className="w-2 h-16 rounded-t bg-zinc-800" />
            <div className="w-2 h-20 rounded-t bg-zinc-800" />
            <div className="w-2 h-24 rounded-t bg-zinc-800" />
            <div className="w-2 h-28 rounded-t bg-zinc-800" />
          </div>
        </div>
      </main>

      {/* ── Bottom Nav Tab Bar Skeleton ────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center px-4 py-3"
        style={{
          background: "rgba(18, 18, 18, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="w-12 h-6 rounded-full bg-zinc-800" />
        <div className="w-12 h-6 rounded-full bg-zinc-800/50" />
        <div className="w-12 h-6 rounded-full bg-zinc-800/50" />
        <div className="w-12 h-6 rounded-full bg-zinc-800/50" />
      </nav>
    </div>
  );
}

export default PageSkeletonLoader;
