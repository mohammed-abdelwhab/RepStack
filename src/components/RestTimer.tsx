import { useState, useEffect, useRef, useCallback } from "react";
import { soundEffects } from "../utils/audioUtils";

interface RestTimerProps {
  defaultSeconds: number;
  onClose: () => void;
  onDefaultChange: (seconds: number) => void;
}

const PRESETS = [30, 60, 90, 120, 180, 300] as const; // 30s, 1m, 1.5m, 2m, 3m, 5m
const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RestTimerStorage {
  targetEpoch: number;
  totalSeconds: number;
  isRunning: boolean;
  remainingSeconds: number;
}

export function RestTimer({
  defaultSeconds,
  onClose,
  onDefaultChange,
}: RestTimerProps) {
  // Initialize state from localStorage if available
  const [totalSeconds, setTotalSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem("repstack_rest_timer");
      if (saved) {
        const parsed: RestTimerStorage = JSON.parse(saved);
        return parsed.totalSeconds || defaultSeconds;
      }
    } catch {}
    return defaultSeconds;
  });

  const [remaining, setRemaining] = useState(() => {
    try {
      const saved = localStorage.getItem("repstack_rest_timer");
      if (saved) {
        const parsed: RestTimerStorage = JSON.parse(saved);
        if (parsed.isRunning) {
          const rem = Math.max(
            0,
            Math.ceil((parsed.targetEpoch - Date.now()) / 1000),
          );
          return rem;
        }
        return parsed.remainingSeconds || defaultSeconds;
      }
    } catch {}
    return defaultSeconds;
  });

  const [isRunning, setIsRunning] = useState(() => {
    try {
      const saved = localStorage.getItem("repstack_rest_timer");
      if (saved) {
        const parsed: RestTimerStorage = JSON.parse(saved);
        if (parsed.isRunning) {
          return parsed.targetEpoch > Date.now();
        }
        return false;
      }
    } catch {}
    return true;
  });

  const [targetEpoch, setTargetEpoch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("repstack_rest_timer");
      if (saved) {
        const parsed: RestTimerStorage = JSON.parse(saved);
        if (parsed.isRunning && parsed.targetEpoch) {
          return parsed.targetEpoch;
        }
      }
    } catch {}
    return Date.now() + defaultSeconds * 1000;
  });

  const [isDone, setIsDone] = useState(() => {
    try {
      const saved = localStorage.getItem("repstack_rest_timer");
      if (saved) {
        const parsed: RestTimerStorage = JSON.parse(saved);
        if (parsed.isRunning && parsed.targetEpoch <= Date.now()) {
          return true;
        }
      }
    } catch {}
    return false;
  });

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const [soundMuted, setSoundMuted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync mute state with soundEffects singleton
  const toggleSound = () => {
    soundEffects.soundEnabled = soundMuted;
    setSoundMuted(!soundMuted);
  };

  // Wall-clock countdown cycle
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const checkTime = () => {
      const now = Date.now();
      const rem = Math.max(0, Math.ceil((targetEpoch - now) / 1000));
      setRemaining(rem);

      if (rem <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setIsDone(true);
        soundEffects.playRestDoneChime();
        localStorage.setItem(
          "repstack_rest_timer",
          JSON.stringify({
            targetEpoch,
            totalSeconds,
            isRunning: false,
            remainingSeconds: 0,
          }),
        );
      }
    };

    checkTime();
    intervalRef.current = setInterval(checkTime, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, targetEpoch, totalSeconds]);

  const reset = useCallback(
    (seconds: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const newTarget = Date.now() + seconds * 1000;
      setTotalSeconds(seconds);
      setRemaining(seconds);
      setTargetEpoch(newTarget);
      setIsDone(false);
      setIsRunning(true);

      localStorage.setItem(
        "repstack_rest_timer",
        JSON.stringify({
          targetEpoch: newTarget,
          totalSeconds: seconds,
          isRunning: true,
          remainingSeconds: seconds,
        }),
      );
    },
    [],
  );

  const handleClose = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.removeItem("repstack_rest_timer");
    onClose();
  };

  const handlePreset = (sec: number) => {
    onDefaultChange(sec);
    reset(sec);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    const v = parseInt(customVal, 10);
    if (!isNaN(v) && v > 0 && v <= 3600) {
      handlePreset(v);
      setCustomVal("");
    }
  };

  const handleAddThirty = () => {
    const newRemaining = remaining + 30;
    const newTotal = totalSeconds + 30;
    const newTarget = Date.now() + newRemaining * 1000;

    if (intervalRef.current) clearInterval(intervalRef.current);
    setTotalSeconds(newTotal);
    setRemaining(newRemaining);
    setTargetEpoch(newTarget);
    setIsDone(false);
    setIsRunning(true);

    localStorage.setItem(
      "repstack_rest_timer",
      JSON.stringify({
        targetEpoch: newTarget,
        totalSeconds: newTotal,
        isRunning: true,
        remainingSeconds: newRemaining,
      }),
    );
  };

  const handleToggleRunning = () => {
    if (isDone) return;
    if (isRunning) {
      // Pause
      setIsRunning(false);
      localStorage.setItem(
        "repstack_rest_timer",
        JSON.stringify({
          targetEpoch,
          totalSeconds,
          isRunning: false,
          remainingSeconds: remaining,
        }),
      );
    } else {
      // Resume
      const newTarget = Date.now() + remaining * 1000;
      setTargetEpoch(newTarget);
      setIsRunning(true);
      localStorage.setItem(
        "repstack_rest_timer",
        JSON.stringify({
          targetEpoch: newTarget,
          totalSeconds,
          isRunning: true,
          remainingSeconds: remaining,
        }),
      );
    }
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeDisplay = `${mins > 0 ? `${mins}:` : ""}${String(secs).padStart(mins > 0 ? 2 : 1, "0")}`;

  const ringColor = isDone ? "#dfff00" : "#dfff00";

  return (
    <div
      id="rest-timer-overlay"
      role="timer"
      aria-live="polite"
      aria-label={`Rest timer: ${timeDisplay} remaining`}
      className="fixed top-16 left-3 right-3 max-w-lg mx-auto z-50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 animate-in slide-in-from-top-4"
      style={{
        background: "#161616",
        border: isDone
          ? "1.5px solid #dfff00"
          : "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: isDone
          ? "0 0 25px rgba(223, 255, 0, 0.3), 0 10px 40px rgba(0,0,0,0.8)"
          : "0 10px 40px rgba(0,0,0,0.8)",
      }}
    >
      {/* Top progress line */}
      <div style={{ height: 3, background: "rgba(255, 255, 255, 0.08)" }}>
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "#dfff00",
            transition: "width 1s linear",
            borderRadius: "0 2px 2px 0",
          }}
        />
      </div>

      <div className="flex items-center gap-3.5 px-4 py-3">
        {/* ── Circular Countdown Ring ─────────────────────────────────────── */}
        <div
          className="flex-shrink-0 relative flex items-center justify-center"
          style={{ width: 68, height: 68 }}
        >
          <svg width="68" height="68" viewBox="0 0 96 96" aria-hidden>
            {/* Background Track */}
            <circle
              cx="48"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="6"
            />
            {/* Progress Arc */}
            <circle
              cx="48"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 48 48)"
              style={{
                transition: "stroke-dashoffset 1s linear",
              }}
            />
          </svg>

          {/* Time Display Centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-mono leading-none tracking-tight"
              style={{
                fontSize: remaining >= 60 ? 15 : 20,
                fontWeight: 800,
                color: isDone ? "#dfff00" : "#ffffff",
              }}
            >
              {isDone ? "GO!" : timeDisplay}
            </span>
            {!isDone && (
              <span className="font-body text-[8px] font-bold text-steel uppercase mt-0.5 tracking-wider">
                REST
              </span>
            )}
          </div>
        </div>

        {/* ── Center Controls & Presets ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-body text-xs font-medium text-steel">
              {isDone ? (
                <span className="text-[#dfff00] font-bold">
                  ✓ Time's up! Ready for next set
                </span>
              ) : isRunning ? (
                "Resting between exercises..."
              ) : (
                "Rest paused"
              )}
            </p>

            {/* Sound Mute Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className="text-steel hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer transition-colors"
              title={soundMuted ? "Unmute chime" : "Mute chime"}
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-1 flex-wrap">
            {PRESETS.map((sec) => {
              const label = sec < 60 ? `${sec}s` : `${sec / 60}m`;
              const isSelected = totalSeconds === sec;
              return (
                <button
                  key={sec}
                  onClick={() => handlePreset(sec)}
                  className="font-mono text-xs rounded-md transition-all active:scale-95 cursor-pointer px-2 py-1"
                  style={{
                    background: isSelected
                      ? "rgba(223, 255, 0, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                    border: isSelected
                      ? "1px solid #dfff00"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isSelected ? "#dfff00" : "#9ca3af",
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  {label}
                </button>
              );
            })}
            <button
              onClick={() => setShowCustomInput((v) => !v)}
              className="font-body text-xs rounded-md transition-all active:scale-95 cursor-pointer px-2 py-1"
              style={{
                background: showCustomInput
                  ? "rgba(223, 255, 0, 0.15)"
                  : "rgba(255, 255, 255, 0.05)",
                border: showCustomInput
                  ? "1px solid #dfff00"
                  : "1px solid rgba(255, 255, 255, 0.08)",
                color: showCustomInput ? "#dfff00" : "#9ca3af",
              }}
            >
              Custom
            </button>
          </div>

          {/* Custom Input Dropdown */}
          {showCustomInput && (
            <div className="flex gap-1.5 items-center mt-1">
              <input
                type="number"
                inputMode="numeric"
                min="5"
                max="3600"
                placeholder="Seconds (e.g. 120)"
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                className="font-mono text-xs text-center rounded-md bg-black text-white px-2.5 py-1 border border-white/20 focus:border-[#dfff00] outline-none w-28"
                autoFocus
              />
              <button
                type="button"
                onClick={handleCustomSubmit}
                className="font-display font-bold text-xs rounded-md bg-[#dfff00] text-black px-2.5 py-1 cursor-pointer"
              >
                Set
              </button>
            </div>
          )}
        </div>

        {/* ── Right Actions ──────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button
            onClick={handleAddThirty}
            title="Add 30 seconds"
            className="font-mono text-[11px] font-semibold rounded-lg px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer border border-white/10"
          >
            +30s
          </button>
          <button
            onClick={handleToggleRunning}
            title={isRunning ? "Pause" : "Resume"}
            className="font-body text-xs rounded-lg px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer border border-white/10"
          >
            {isRunning ? "⏸" : "▶"}
          </button>
          <button
            onClick={handleClose}
            title="Close rest timer"
            className="font-body text-xs rounded-lg px-2 py-1 bg-zinc-800/60 hover:bg-zinc-700 text-steel hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
export default RestTimer;
