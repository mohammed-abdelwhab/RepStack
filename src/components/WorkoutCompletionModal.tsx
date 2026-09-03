import { useEffect, useState } from "react";

interface WorkoutCompletionModalProps {
  isOpen: boolean;
  dayName: string;
  totalVolume: number;
  totalSets: number;
  exercisesCompleted: number;
  newPRs: { exerciseName: string; weight: number; reps: number }[];
  onClose: () => void;
}

export function WorkoutCompletionModal({
  isOpen,
  dayName,
  totalVolume,
  totalSets,
  exercisesCompleted,
  newPRs,
  onClose,
}: WorkoutCompletionModalProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0, 0, 0, 0.88)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          background: "#161616",
          border: "1.5px solid #dfff00",
          boxShadow: "0 0 35px rgba(223, 255, 0, 0.25), 0 20px 50px rgba(0,0,0,0.9)",
        }}
      >
        {/* Glow effect */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(223, 255, 0, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Celebration Trophy Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-3 text-3xl shadow-inner"
          style={{
            background: "rgba(223, 255, 0, 0.12)",
            border: "1px solid rgba(223, 255, 0, 0.35)",
          }}
        >
          🎖️💪
        </div>

        {/* Title & Subtitle */}
        <h2
          id="completion-title"
          className="font-display font-black text-2xl text-white uppercase tracking-wide"
        >
          Nice Work!
        </h2>
        <p className="font-body text-xs text-steel mt-1">
          <strong className="text-[#dfff00]">{dayName}</strong> session saved to your database history!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 my-5">
          <div
            className="rounded-xl p-2.5 flex flex-col items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span className="font-display font-black text-base text-white">
              {totalVolume.toLocaleString()}
            </span>
            <span className="font-body text-[9px] uppercase tracking-wider text-steel mt-0.5">
              Total kg
            </span>
          </div>

          <div
            className="rounded-xl p-2.5 flex flex-col items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span className="font-display font-black text-base text-white">
              {totalSets}
            </span>
            <span className="font-body text-[9px] uppercase tracking-wider text-steel mt-0.5">
              Sets
            </span>
          </div>

          <div
            className="rounded-xl p-2.5 flex flex-col items-center justify-center"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span className="font-display font-black text-base text-white">
              {exercisesCompleted}
            </span>
            <span className="font-body text-[9px] uppercase tracking-wider text-steel mt-0.5">
              Exercises
            </span>
          </div>
        </div>

        {/* New PRs broken badge list if any */}
        {newPRs.length > 0 && (
          <div
            className="rounded-xl p-3 mb-5 text-left"
            style={{
              background: "rgba(223, 255, 0, 0.08)",
              border: "1px solid rgba(223, 255, 0, 0.25)",
            }}
          >
            <div className="flex items-center gap-1.5 font-display font-black text-[11px] text-[#dfff00] uppercase mb-1">
              <span>🏆</span>
              <span>New Personal Record Achieved!</span>
            </div>
            {newPRs.map((pr, idx) => (
              <p key={idx} className="font-body text-xs text-white">
                • {pr.exerciseName}: <strong>{pr.weight} kg × {pr.reps} reps</strong>
              </p>
            ))}
          </div>
        )}

        {/* Close / Return to Dashboard Action */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl py-3.5 font-display font-black text-xs uppercase transition-all duration-150 active:scale-95 cursor-pointer shadow-lg"
          style={{
            background: "#dfff00",
            color: "#000000",
            boxShadow: "0 0 16px rgba(223, 255, 0, 0.35)",
          }}
        >
          Return to Dashboard ({countdown}s)
        </button>
      </div>
    </div>
  );
}

export default WorkoutCompletionModal;
