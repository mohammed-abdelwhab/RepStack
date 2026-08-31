interface EditModeToggleProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export function EditModeToggle({ isEditMode, onToggle }: EditModeToggleProps) {
  return (
    <button
      id="edit-mode-toggle"
      role="switch"
      aria-checked={isEditMode}
      aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
      onClick={onToggle}
      className="group flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer select-none transition-all duration-200 focus-visible:ring-2 active:scale-95"
      style={{
        background: isEditMode ? 'rgba(196,98,45,0.15)' : 'rgba(86,92,102,0.15)',
        border: `1px solid ${isEditMode ? 'rgba(196,98,45,0.4)' : 'rgba(86,92,102,0.3)'}`,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Toggle track */}
      <span
        className="relative flex-shrink-0"
        style={{ width: 32, height: 18 }}
        aria-hidden
      >
        {/* Track */}
        <span
          className="absolute inset-0 rounded-full transition-colors duration-200"
          style={{
            background: isEditMode ? '#C4622D' : '#565C66',
          }}
        />
        {/* Thumb */}
        <span
          className="absolute top-0.5 rounded-full transition-transform duration-200 shadow-sm"
          style={{
            width: 14,
            height: 14,
            background: '#EDEDEA',
            left: 2,
            transform: isEditMode ? 'translateX(14px)' : 'translateX(0)',
          }}
        />
      </span>

      {/* Label */}
      <span
        className="font-body text-xs font-medium tracking-wide transition-colors duration-200"
        style={{
          color: isEditMode ? '#C4622D' : '#565C66',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {isEditMode ? 'Editing' : 'View'}
      </span>
    </button>
  );
}
