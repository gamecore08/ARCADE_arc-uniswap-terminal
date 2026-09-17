import { useEffect } from 'react';

interface ShortcutHandlers {
  onOpenSearch?: () => void;
  onGoSwap?: () => void;
  onGoPools?: () => void;
  onGoPositions?: () => void;
  onOpenCreatePool?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
  onToggleHelp?: () => void;
}

export function useShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Omnibar search: Cmd+K or Ctrl+K (works even if inside input)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handlers.onOpenSearch?.();
        return;
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        handlers.onEscape?.();
        return;
      }

      if (isInput) return;

      // Single-key shortcuts
      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          handlers.onGoSwap?.();
          break;
        case 'p':
          e.preventDefault();
          handlers.onGoPools?.();
          break;
        case 'm':
          e.preventDefault();
          handlers.onGoPositions?.();
          break;
        case 'c':
          e.preventDefault();
          handlers.onOpenCreatePool?.();
          break;
        case 'r':
          e.preventDefault();
          handlers.onRefresh?.();
          break;
        case '?':
          e.preventDefault();
          handlers.onToggleHelp?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
