import { useEffect, useRef } from 'react';

interface PRCelebrationProps {
  exerciseName: string;
  weight: number;
  reps: number;
  onDismiss: () => void;
}

// Detect prefers-reduced-motion at module level (stable for a session)
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function PRCelebration({
  exerciseName,
  weight,
  reps,
  onDismiss,
}: PRCelebrationProps) {
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss after 5 s
  useEffect(() => {
    dismissTimerRef.current = setTimeout(onDismiss, 5000);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [onDismiss]);

  return (
    /* ── Overlay backdrop ─────────────────────────────────────────────────── */
    <div
      role="status"
      aria-live="polite"
      aria-label={`Personal record! ${exerciseName}: ${weight} kg × ${reps} reps`}
      className="fixed inset-x-4 z-[100] flex justify-center"
      style={{ top: 16, pointerEvents: 'none' }}
    >
      <div
        id="pr-celebration-toast"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl"
        style={{
          background: '#1E2126',
          border: '1.5px solid rgba(232, 184, 75, 0.55)',
          boxShadow: prefersReducedMotion
            ? '0 0 0 3px rgba(232,184,75,0.3), 0 8px 32px rgba(0,0,0,0.5)'
            : '0 0 24px rgba(232,184,75,0.25), 0 8px 32px rgba(0,0,0,0.5)',
          pointerEvents: 'auto',
          animation: prefersReducedMotion
            ? 'none'
            : 'pr-slide-in 350ms cubic-bezier(0.34,1.56,0.64,1) both, pr-pulse 1.4s 400ms ease-out both',
        }}
      >
        {/* Shimmer strip — disabled on reduced-motion */}
        {!prefersReducedMotion && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background:
                'linear-gradient(105deg, transparent 40%, rgba(232,184,75,0.12) 50%, transparent 60%)',
              backgroundSize: '200% 100%',
              animation: 'pr-shimmer 2.5s 600ms linear infinite',
            }}
          />
        )}

        {/* Gold top accent bar */}
        <div
          aria-hidden
          style={{
            height: 3,
            background: prefersReducedMotion
              ? '#E8B84B'
              : 'linear-gradient(90deg, rgba(232,184,75,0.3) 0%, #E8B84B 40%, rgba(232,184,75,0.3) 100%)',
          }}
        />

        <div className="px-4 py-3 flex items-start gap-3">
          {/* Trophy icon */}
          <div
            aria-hidden
            className="flex-shrink-0 flex items-center justify-center rounded-xl mt-0.5"
            style={{
              width: 44,
              height: 44,
              background: 'rgba(232,184,75,0.12)',
              border: '1px solid rgba(232,184,75,0.3)',
              fontSize: 22,
            }}
          >
            🏆
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className="font-body font-semibold leading-tight"
              style={{ fontSize: 11, color: '#E8B84B', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              New Personal Record
            </p>
            <p
              className="font-body font-medium text-chalk mt-0.5 truncate"
              style={{ fontSize: 14, letterSpacing: '-0.01em' }}
            >
              {exerciseName}
            </p>

            {/* The PR numbers — Oswald, large, gold */}
            <div className="flex items-baseline gap-1 mt-1">
              <span
                className="font-display"
                style={{ fontSize: 30, fontWeight: 700, color: '#E8B84B', lineHeight: 1 }}
              >
                {weight}
              </span>
              <span
                className="font-body"
                style={{ fontSize: 12, color: 'rgba(232,184,75,0.7)', marginBottom: 1 }}
              >
                kg
              </span>
              <span
                className="font-body"
                style={{ fontSize: 12, color: 'rgba(232,184,75,0.5)', marginBottom: 1, marginInline: 2 }}
              >
                ×
              </span>
              <span
                className="font-display"
                style={{ fontSize: 30, fontWeight: 700, color: '#E8B84B', lineHeight: 1 }}
              >
                {reps}
              </span>
              <span
                className="font-body"
                style={{ fontSize: 12, color: 'rgba(232,184,75,0.7)', marginBottom: 1 }}
              >
                reps
              </span>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            id="pr-dismiss-btn"
            onClick={onDismiss}
            aria-label="Dismiss PR notification"
            className="flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer mt-0.5"
            style={{
              width: 24,
              height: 24,
              background: 'rgba(86,92,102,0.2)',
              border: 'none',
              color: '#565C66',
              fontSize: 14,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
