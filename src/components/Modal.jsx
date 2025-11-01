// =======================================================================
// FILE: src/components/Modal.jsx
// PURPOSE: Clean, accessible modal component with compliance features
// SOC 2: Focus management, audit logging, WCAG compliance, scroll prevention
// =======================================================================

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { CloseIcon } from './Icons';

/**
 * Modal Component
 * Reusable modal dialog with proper accessibility and compliance
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Callback when modal closes
 * @param {string|ReactNode} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {string} size - Size preset: sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full (default: md)
 * @param {string} maxWidth - Custom max-width class (overrides size)
 * @param {boolean} showCloseButton - Show close button (default: true)
 * @param {string} className - Additional CSS classes
 * @param {Function} onOpen - Callback when modal opens
 * @param {Function} onError - Error callback for compliance logging
 * @param {boolean} closeOnBackdrop - Close on backdrop click (default: true)
 * @param {boolean} closeOnEsc - Close on ESC key (default: true)
 * @param {string} ariaLabel - Custom ARIA label
 * @param {Element} restoreFocus - Element to focus on close
 * 
 * @example
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <p>Are you sure?</p>
 *   <button onClick={handleConfirm}>Yes</button>
 * </Modal>
 */
const Modal = React.memo(({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md', 
  maxWidth = null,
  showCloseButton = true,
  className = "",
  onOpen = null,
  onError = null,
  closeOnBackdrop = true,
  closeOnEsc = true,
  ariaLabel = null,
  restoreFocus = null
}) => {
  const { theme, color } = useTheme();
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  /**
   * ✅ SOC 2: Handle modal open
   * Focus management and audit logging
   */
  const handleModalOpen = useCallback(() => {
    try {
      // Store current focused element for restoration
      previousActiveElement.current = document.activeElement;

      // ✅ SOC 2: Audit logging - modal opened
      onError?.({
        type: 'MODAL_OPENED',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      // Call parent callback
      onOpen?.();

      // ✅ Accessibility: Focus on modal after brief delay
      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector('[aria-label="Close modal"]');
        if (closeButton) {
          closeButton.focus();
        } else {
          modalRef.current?.focus();
        }
      }, 100);
    } catch (error) {
      console.error('Modal open error:', error);
      onError?.({
        type: 'MODAL_OPEN_ERROR',
        error: error.message
      });
    }
  }, [title, onOpen, onError]);

  /**
   * ✅ SOC 2: Handle modal close
   * Focus restoration and audit logging
   */
  const handleClose = useCallback(() => {
    try {
      // ✅ SOC 2: Audit logging - modal closed
      onError?.({
        type: 'MODAL_CLOSED',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      // ✅ Accessibility: Restore focus to previous element
      if (restoreFocus) {
        restoreFocus.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

      // Call parent callback
      onClose?.();
    } catch (error) {
      console.error('Modal close error:', error);
      onError?.({
        type: 'MODAL_CLOSE_ERROR',
        error: error.message
      });
      onClose?.();
    }
  }, [title, onClose, onError, restoreFocus]);

  /**
   * ✅ SOC 2: Handle ESC key press
   * With audit logging
   */
  const handleEscKey = useCallback((event) => {
    if (event.keyCode === 27 && closeOnEsc) {
      event.preventDefault();

      onError?.({
        type: 'MODAL_CLOSED_ESC',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      handleClose();
    }
  }, [closeOnEsc, title, onError, handleClose]);

  /**
   * ✅ SOC 2: Handle backdrop click
   * With audit logging
   */
  const handleBackdropClick = useCallback((event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onError?.({
        type: 'MODAL_CLOSED_BACKDROP',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      handleClose();
    }
  }, [closeOnBackdrop, title, onError, handleClose]);

  /**
   * ✅ SOC 2: Trap focus within modal
   * Prevent focus from leaving modal while open
   */
  const handleKeyDown = useCallback((event) => {
    if (event.keyCode !== 9) return; // Only handle Tab key

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

  // Setup event listeners
  useEffect(() => {
    if (isOpen) {
      // Call open handler
      handleModalOpen();

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0';

      // Add event listeners
      window.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, handleModalOpen, handleEscKey]);

  // Size configuration
  const sizeClasses = useMemo(() => ({
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
    full: 'max-w-full'
  }), []);

  const widthClass = useMemo(() => 
    maxWidth || sizeClasses[size] || sizeClasses.md
  , [maxWidth, size, sizeClasses]);

  // Don't render if not open
  if (!isOpen) return null;

  // Generate title ID for ARIA
  const titleId = useMemo(() => `modal-title-${Date.now()}`, []);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8 ${theme} theme-${color}`}
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden={!isOpen}
    >
      {/* Backdrop - ✅ Accessibility: Aria-hidden */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        aria-hidden="true"
      />

      {/* Modal Container with Scroll - ✅ Accessibility: Focus trap region */}
      <div 
        className="relative w-full h-full flex items-start justify-center overflow-y-auto py-8"
        onKeyDown={handleKeyDown}
      >
        {/* Modal Content - ✅ Accessibility: Dialog role */}
        <div
          ref={modalRef}
          className={`relative w-full ${widthClass} ${className}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl">
            
            {/* Header - ✅ Accessibility: Proper structure */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-border">
                <div className="flex-1 pr-4">
                  {typeof title === 'string' ? (
                    <h2 
                      id={titleId}
                      className="text-xl font-semibold text-foreground"
                    >
                      {title}
                    </h2>
                  ) : (
                    <div id={titleId}>
                      {title}
                    </div>
                  )}
                </div>
                
                {/* Close Button - ✅ Accessibility: ARIA label and focus */}
                {showCloseButton && onClose && (
                  <button
                    onClick={handleClose}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Close modal"
                    type="button"
                  >
                    <CloseIcon 
                      className="w-5 h-5" 
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
            )}

            {/* Body - ✅ Accessibility: Proper semantics */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ✅ Display name for debugging
Modal.displayName = 'Modal';

export default Modal;
