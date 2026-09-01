export type AlertVariant = "success" | "warning" | "error" | "info";

interface StatusAlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function StatusAlert({
  variant = "error",
  title,
  message,
  onClose,
  className = "",
}: StatusAlertProps) {
  if (!message) return null;

  // Visual tokens by variant matching Stitch Design System
  const styles = {
    success: {
      border: "1px solid rgba(223, 255, 0, 0.35)",
      background: "rgba(223, 255, 0, 0.08)",
      textColor: "#dfff00",
      subtextColor: "#e5e2e1",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    warning: {
      border: "1px solid rgba(255, 170, 0, 0.35)",
      background: "rgba(255, 170, 0, 0.08)",
      textColor: "#ffaa00",
      subtextColor: "#e5e2e1",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    error: {
      border: "1px solid rgba(255, 49, 49, 0.35)",
      background: "rgba(255, 49, 49, 0.08)",
      textColor: "#ff3131",
      subtextColor: "#e5e2e1",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    info: {
      border: "1px solid rgba(0, 240, 255, 0.35)",
      background: "rgba(0, 240, 255, 0.08)",
      textColor: "#00f0ff",
      subtextColor: "#e5e2e1",
      icon: (
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  }[variant];

  return (
    <div
      role="alert"
      className={`rounded-xl p-3.5 flex items-start justify-between gap-3 transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${className}`}
      style={{
        border: styles.border,
        background: styles.background,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <span style={{ color: styles.textColor, marginTop: "2px" }}>
          {styles.icon}
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4
              className="font-display font-bold text-xs uppercase tracking-wide leading-tight mb-0.5"
              style={{ color: styles.textColor }}
            >
              {title}
            </h4>
          )}
          <p
            className="font-body text-xs leading-relaxed"
            style={{ color: styles.subtextColor }}
          >
            {message}
          </p>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="text-steel hover:text-white transition-colors p-1 rounded cursor-pointer -mr-1 -mt-1 flex-shrink-0"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
