// =======================================================================
// FILE: src/components/Modal.jsx (COMPLETE FIX - HOOKS & WIDTH WORKING)
// PURPOSE: Clean, accessible modal component with compliance features
// SOC 2: Focus management, audit logging, WCAG compliance, scroll prevention
// =======================================================================

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ CENTRALIZED ICON IMPORTS
import { XIcon } from './Icons';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  maxWidth = null,
  showCloseButton = true,
  className = '',
  closeOnBackdrop = true,
  closeOnEsc = true,
}) => {
  const { theme, color } = useTheme();
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // ✅ FIX: Memoize size values to avoid recreation
  const sizePixels = useMemo(
    () => ({
      sm: '384px', // DELETE DIALOG - SMALL
      md: '448px', // MEDIUM
      lg: '512px', // LARGE
      xl: '640px', // EXTRA LARGE
      '2xl': '768px', // 2XL
      '3xl': '896px', // 3XL
      '4xl': '1024px', // 4XL
      '5xl': '1280px', // 5XL
      '6xl': '1536px', // 6XL
      '7xl': '1792px', // 7XL
      full: '100%',
    }),
    []
  );

  // ✅ FIX: Get modal width with proper memoization
  const modalWidth = useMemo(
    () => maxWidth || sizePixels[size] || sizePixels.md,
    [maxWidth, size, sizePixels]
  );

  // ✅ FIX: Generate stable title ID
  const titleId = useMemo(
    () => `modal-title-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // ✅ FIX: Memoize close handler
  const handleClose = useCallback(() => {
    try {
      console.log('🔐 Closing modal');

      if (previousActiveElement.current) {
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }

      onClose?.();
    } catch (error) {
      console.error('❌ Modal close error:', error.message);
      onClose?.();
    }
  }, [onClose]);

  // ✅ FIX: Memoize backdrop click handler
  const handleBackdropClick = useCallback(
    (event) => {
      if (
        closeOnBackdrop &&
        event.target === event.currentTarget
      ) {
        console.log('👆 Backdrop clicked, closing modal');
        handleClose();
      }
    },
    [closeOnBackdrop, handleClose]
  );

  // ✅ FIX: Memoize escape key handler
  const handleEscKey = useCallback(
    (event) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault();

        console.log('⌨️ Escape key pressed, closing modal');
        handleClose();
      }
    },
    [closeOnEsc, handleClose]
  );

  // ✅ FIX: Memoize tab trap handler
  const handleKeyDown = useCallback((event) => {
    if (event.key !== 'Tab') return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  // ✅ FIX: Single effect for modal lifecycle
  useEffect(() => {
    if (!isOpen) return;

    console.log('🔓 Opening modal');

    // Store previous focus
    previousActiveElement.current = document.activeElement;

    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Set focus to modal after rendering
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 0);

    // Add keyboard listeners
    document.addEventListener('keydown', handleEscKey);

    // Cleanup function
    return () => {
      console.log('🔐 Modal cleanup');

      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = originalOverflow;

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscKey]);

  // ✅ FIX: Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${theme} theme-${color}`}
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden="false"
    >
      {/* ========== BACKDROP ========== */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* ========== MODAL CONTAINER ========== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modal Content */}
        <div
          ref={modalRef}
          className={`bg-card border border-border rounded-lg shadow-2xl overflow-hidden ${className}`}
          style={{
            width: '100%',
            maxWidth: modalWidth,
            maxHeight: '90vh',
            overflow: 'auto',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {/* ========== HEADER ========== */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex-1 pr-4 min-w-0">
                {typeof title === 'string' ? (
                  <h2
                    id={titleId}
                    className="text-xl font-semibold text-foreground truncate"
                  >
                    {title}
                  </h2>
                ) : (
                  <div id={titleId}>{title}</div>
                )}
              </div>

              {/* Close Button */}
              {showCloseButton && onClose && (
                <button
                  onClick={handleClose}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label="Close modal"
                  type="button"
                >
                  <XIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* ========== BODY ========== */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export default Modal;
