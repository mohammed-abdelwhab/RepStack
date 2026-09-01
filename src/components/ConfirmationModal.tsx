
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 relative animate-in zoom-in-95 duration-150"
        style={{
          background: "#121212",
          border: isDestructive
            ? "1px solid rgba(255, 49, 49, 0.3)"
            : "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isDestructive
                ? "rgba(255, 49, 49, 0.12)"
                : "rgba(223, 255, 0, 0.12)",
              color: isDestructive ? "#ff3131" : "#dfff00",
            }}
          >
            {isDestructive ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-black text-base text-white uppercase tracking-tight">
              {title}
            </h3>
            <p className="font-body text-xs text-steel mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 font-mono text-xs py-2.5 rounded-lg bg-zinc-900 border border-white/10 text-steel hover:text-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 font-display font-black text-xs uppercase py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
            style={{
              background: isDestructive ? "#ff3131" : "#dfff00",
              color: isDestructive ? "#ffffff" : "#000000",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
