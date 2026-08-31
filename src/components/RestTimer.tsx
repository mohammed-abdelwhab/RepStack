import { useState, useEffect, useRef, useCallback } from 'react';

interface RestTimerProps {
  defaultSeconds: number;
  onClose: () => void;
  onDefaultChange: (seconds: number) => void;
}

const PRESETS = [30, 60, 90, 120] as const;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function RestTimer({ defaultSeconds, onClose, onDefaultChange }: RestTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultSeconds);
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashRef = useRef(false);

  // Start/pause countdown
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setIsDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const reset = useCallback((seconds: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setIsDone(false);
    setIsRunning(true);
    flashRef.current = false;
  }, []);

  const handlePreset = (sec: number) => {
    onDefaultChange(sec);
    reset(sec);
    setShowCustomInput(false);
  };

  const handleCustomSubmit = () => {
    const v = parseInt(customVal, 10);
    if (!isNaN(v) && v > 0 && v <= 3600) {
      handlePreset(v);
      setCustomVal('');
    }
  };

  const handleAddThirty = () => {
    const newRemaining = remaining + 30;
    const newTotal = totalSeconds + 30;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTotalSeconds(newTotal);
    setRemaining(newRemaining);
    setIsDone(false);
    setIsRunning(true);
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeDisplay = `${mins > 0 ? `${mins}:` : ''}${String(secs).padStart(mins > 0 ? 2 : 1, '0')}`;

  // Ring color: iron → amber as it approaches 0
  const pct = progress;
  const ringColor = isDone
    ? '#C4622D'
    : pct > 0.5
    ? '#C4622D'
    : pct > 0.2
    ? '#d97f2e'
    : '#e8a832';

  return (
    /* ── Floating bar anchored above safe-area bottom ─────────────────────── */
    <div
      id="rest-timer-overlay"
      role="timer"
      aria-live="polite"
      aria-label={`Rest timer: ${timeDisplay} remaining`}
      className="fixed inset-x-3 z-[80] rounded-2xl overflow-hidden"
      style={{
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        background: '#1E2126',
        border: `1.5px solid ${isDone ? 'rgba(196,98,45,0.6)' : 'rgba(86,92,102,0.25)'}`,
        boxShadow: isDone
          ? '0 0 20px rgba(196,98,45,0.25), 0 8px 32px rgba(0,0,0,0.5)'
          : '0 8px 32px rgba(0,0,0,0.5)',
        transition: prefersReducedMotion ? 'none' : 'box-shadow 400ms, border-color 400ms',
        animation: !prefersReducedMotion && isDone ? 'pr-pulse 0.6s ease-out' : 'none',
      }}
    >
      {/* Progress bar strip at top */}
      <div style={{ height: 3, background: 'rgba(86,92,102,0.15)' }}>
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: ringColor,
            transition: prefersReducedMotion ? 'none' : 'width 1s linear, background 500ms',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3">
        {/* ── Circular countdown ring ─────────────────────────────────────── */}
        <div className="flex-shrink-0 relative" style={{ width: 72, height: 72 }}>
          <svg width="72" height="72" viewBox="0 0 96 96" aria-hidden>
            {/* Track circle */}
            <circle
              cx="48" cy="48" r={RADIUS}
              fill="none"
              stroke="rgba(86,92,102,0.2)"
              strokeWidth="7"
            />
            {/* Progress arc */}
            <circle
              cx="48" cy="48" r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 48 48)"
              style={{
                transition: prefersReducedMotion ? 'none' : 'stroke-dashoffset 1s linear, stroke 500ms',
              }}
            />
          </svg>
          {/* Time display centred inside ring */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span
              className="font-display leading-none"
              style={{
                fontSize: remaining >= 60 ? 16 : 22,
                fontWeight: 700,
                color: isDone ? '#C4622D' : '#EDEDEA',
                letterSpacing: '-0.02em',
                transition: 'color 300ms',
              }}
            >
              {isDone ? '✓' : timeDisplay}
            </span>
            {!isDone && (
              <span
                className="font-body leading-none mt-0.5"
                style={{ fontSize: 8, color: '#565C66', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                REST
              </span>
            )}
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {/* Done state */}
          {isDone ? (
            <p
              className="font-body font-medium"
              style={{ fontSize: 13, color: '#C4622D', letterSpacing: '-0.01em' }}
            >
              Time's up — start your next set!
            </p>
          ) : (
            <p
              className="font-body"
              style={{ fontSize: 12, color: '#565C66' }}
            >
              {isRunning ? 'Resting…' : 'Paused'}
            </p>
          )}

          {/* Preset duration buttons */}
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map((sec) => {
              const label = sec < 60 ? `${sec}s` : `${sec / 60}m`;
              const isSelected = totalSeconds === sec;
              return (
                <button
                  key={sec}
                  id={`timer-preset-${sec}`}
                  onClick={() => handlePreset(sec)}
                  aria-pressed={isSelected}
                  className="font-body text-xs rounded-lg transition-all duration-150 active:scale-90 cursor-pointer"
                  style={{
                    padding: '3px 8px',
                    background: isSelected ? 'rgba(196,98,45,0.2)' : 'rgba(86,92,102,0.12)',
                    border: `1px solid ${isSelected ? 'rgba(196,98,45,0.4)' : 'rgba(86,92,102,0.2)'}`,
                    color: isSelected ? '#C4622D' : '#565C66',
                    fontSize: 11,
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              );
            })}
            {/* Custom button */}
            <button
              id="timer-custom-btn"
              onClick={() => setShowCustomInput((v) => !v)}
              className="font-body text-xs rounded-lg transition-all duration-150 active:scale-90 cursor-pointer"
              style={{
                padding: '3px 8px',
                background: showCustomInput ? 'rgba(196,98,45,0.1)' : 'rgba(86,92,102,0.08)',
                border: `1px solid ${showCustomInput ? 'rgba(196,98,45,0.3)' : 'rgba(86,92,102,0.15)'}`,
                color: showCustomInput ? '#C4622D' : '#565C66',
                fontSize: 11,
              }}
            >
              Custom
            </button>
          </div>

          {/* Custom seconds input */}
          {showCustomInput && (
            <div className="flex gap-1.5 items-center">
              <input
                id="timer-custom-input"
                type="number"
                inputMode="numeric"
                min="5"
                max="3600"
                placeholder="sec"
                value={customVal}
                onChange={(e) => setCustomVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomSubmit()}
                className="font-display text-center rounded-lg"
                style={{
                  width: 60,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#EDEDEA',
                  background: 'rgba(86,92,102,0.1)',
                  border: '1px solid rgba(196,98,45,0.3)',
                  outline: 'none',
                  padding: '4px 6px',
                }}
                autoFocus
              />
              <button
                id="timer-custom-go"
                onClick={handleCustomSubmit}
                className="font-body text-xs rounded-lg transition-all duration-150 active:scale-90 cursor-pointer"
                style={{
                  padding: '4px 10px',
                  background: 'rgba(196,98,45,0.2)',
                  border: '1px solid rgba(196,98,45,0.4)',
                  color: '#C4622D',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                Set
              </button>
            </div>
          )}
        </div>

        {/* ── Right action buttons ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {/* +30s */}
          <button
            id="timer-add-30"
            onClick={handleAddThirty}
            aria-label="Add 30 seconds"
            className="font-body text-xs rounded-lg transition-all duration-150 active:scale-90 cursor-pointer"
            style={{
              padding: '5px 8px',
              background: 'rgba(86,92,102,0.12)',
              border: '1px solid rgba(86,92,102,0.2)',
              color: '#565C66',
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            +30s
          </button>

          {/* Pause / Resume */}
          <button
            id="timer-pause-resume"
            onClick={() => { if (!isDone) setIsRunning((v) => !v); }}
            aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
            className="font-body text-xs rounded-lg transition-all duration-150 active:scale-90 cursor-pointer"
            style={{
              padding: '5px 8px',
              background: 'rgba(86,92,102,0.12)',
              border: '1px solid rgba(86,92,102,0.2)',
              color: '#565C66',
              fontSize: 14,
            }}
          >
            {isRunning ? '⏸' : '▶'}
          </button>

          {/* Close */}
          <button
            id="timer-close"
            onClick={onClose}
            aria-label="Close rest timer"
            className="rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 cursor-pointer"
            style={{
              padding: '5px 8px',
              background: 'rgba(86,92,102,0.08)',
              border: '1px solid rgba(86,92,102,0.15)',
              color: '#565C66',
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
