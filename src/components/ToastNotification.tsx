import { useEffect } from "react";
import type { AlertVariant } from "./StatusAlert";

interface ToastNotificationProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  duration?: number; // ms
  onClose: () => void;
}

export function ToastNotification({
  variant = "success",
  title,
  message,
  duration = 3500,
  onClose,
}: ToastNotificationProps) {
  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      border: "1px solid rgba(223, 255, 0, 0.4)",
      background: "#131313",
      textColor: "#dfff00",
      glow: "0 8px 30px rgba(223, 255, 0, 0.25)",
      icon: "✓",
    },
    warning: {
      border: "1px solid rgba(255, 170, 0, 0.4)",
      background: "#131313",
      textColor: "#ffaa00",
      glow: "0 8px 30px rgba(255, 170, 0, 0.25)",
      icon: "⚠️",
    },
    error: {
      border: "1px solid rgba(255, 49, 49, 0.4)",
      background: "#131313",
      textColor: "#ff3131",
      glow: "0 8px 30px rgba(255, 49, 49, 0.25)",
      icon: "✕",
    },
    info: {
      border: "1px solid rgba(0, 240, 255, 0.4)",
      background: "#131313",
      textColor: "#00f0ff",
      glow: "0 8px 30px rgba(0, 240, 255, 0.25)",
      icon: "ℹ",
    },
  }[variant];

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-3 fade-in duration-200">
      <div
        className="rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xl"
        style={{
          border: styles.border,
          background: styles.background,
          boxShadow: styles.glow,
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{
              background: `rgba(255, 255, 255, 0.05)`,
              color: styles.textColor,
              border: styles.border,
            }}
          >
            {styles.icon}
          </div>
          <div className="min-w-0 flex-1">
            {title && (
              <h4
                className="font-display font-black text-xs uppercase tracking-wide truncate"
                style={{ color: styles.textColor }}
              >
                {title}
              </h4>
            )}
            <p className="font-body text-xs text-chalk truncate">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-steel hover:text-white p-1 cursor-pointer flex-shrink-0"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
