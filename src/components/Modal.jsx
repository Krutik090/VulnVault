// =======================================================================
// FILE: src/components/Modal.jsx (UPDATED - FULL THEME SUPPORT)
// PURPOSE: A reusable modal component with proper theme and scrolling support
// =======================================================================

import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  maxWidth = null, 
  showCloseButton = true, 
  className = "" 
}) => {
  const { theme, color } = useTheme();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const modalSizeClass = maxWidth 
    ? sizeClasses[maxWidth] || `max-w-${maxWidth}` 
    : sizeClasses[size];

  return (
    // ✅ FIXED: Apply theme classes to modal overlay
    <div 
      className={`${theme} theme-${color} fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn`}
      onClick={onClose}
    >
      {/* ✅ FIXED: Modal content with theme classes */}
      <div
        className={`relative ${modalSizeClass} w-full bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-slideIn ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            {title && (
              <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors ml-auto"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
