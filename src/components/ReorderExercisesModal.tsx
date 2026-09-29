import { useState, useEffect } from "react";

interface ExerciseItem {
  id: string | number;
  name: string;
}

interface ReorderExercisesModalProps {
  isOpen: boolean;
  exercises: ExerciseItem[];
  onSave: (orderedIds: (string | number)[]) => void;
  onClose: () => void;
}

export function ReorderExercisesModal({
  isOpen,
  exercises,
  onSave,
  onClose,
}: ReorderExercisesModalProps) {
  const [items, setItems] = useState<ExerciseItem[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setItems([...exercises]);
    }
  }, [isOpen, exercises]);

  if (!isOpen) return null;

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const copy = [...items];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setItems(copy);
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    moveItem(draggedIdx, idx);
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleSave = () => {
    onSave(items.map((it) => it.id));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reorder-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-4 shadow-2xl relative"
        style={{
          background: "#161616",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.8)",
          maxHeight: "85vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3
              id="reorder-title"
              className="font-display font-black text-sm tracking-wide text-white uppercase"
            >
              Reorder Exercises
            </h3>
            <p className="font-body text-xs text-steel mt-0.5">
              Tap arrows or drag to rearrange exercise order
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-steel hover:text-white bg-white/5 border border-white/10 cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable List of Exercise Chips */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
          {items.map((ex, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;
            const isBeingDragged = draggedIdx === idx;

            return (
              <div
                key={ex.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition-all select-none ${
                  isBeingDragged
                    ? "opacity-50 scale-[0.98] border-dashed border-[#dfff00]"
                    : "bg-white/[0.03] border border-white/10 hover:border-white/20"
                }`}
                style={{
                  background: isBeingDragged
                    ? "rgba(223, 255, 0, 0.08)"
                    : "rgba(255, 255, 255, 0.03)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Drag Handle */}
                  <span
                    className="font-mono text-base text-steel/60 hover:text-[#dfff00] cursor-grab active:cursor-grabbing px-1"
                    title="Drag to reorder"
                  >
                    ⠿
                  </span>

                  {/* Order Index & Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-bold text-[#dfff00] w-5">
                      {idx + 1}.
                    </span>
                    <span className="font-display font-bold text-sm text-white truncate">
                      {ex.name}
                    </span>
                  </div>
                </div>

                {/* 1-Tap Quick Shift Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveItem(idx, idx - 1)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs transition-colors cursor-pointer ${
                      isFirst
                        ? "text-steel/20 bg-transparent cursor-not-allowed"
                        : "text-steel hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
                    }`}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => moveItem(idx, idx + 1)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs transition-colors cursor-pointer ${
                      isLast
                        ? "text-steel/20 bg-transparent cursor-not-allowed"
                        : "text-steel hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
                    }`}
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-display font-bold text-xs uppercase bg-white/5 hover:bg-white/10 text-steel hover:text-white transition-all cursor-pointer border border-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-display font-black text-xs uppercase transition-all cursor-pointer shadow-lg"
            style={{
              background: "#dfff00",
              color: "#000000",
              boxShadow: "0 0 15px rgba(223, 255, 0, 0.25)",
            }}
          >
            Save Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReorderExercisesModal;
