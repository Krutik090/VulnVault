// =======================================================================
// FILE: src/components/Modal.jsx (COMPLETE FIX - WIDTH WORKING)
// PURPOSE: Clean, accessible modal component with compliance features
// SOC 2: Focus management, audit logging, WCAG compliance, scroll prevention
// =======================================================================

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { CloseIcon } from './Icons';

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

  const handleModalOpen = useCallback(() => {
    try {
      previousActiveElement.current = document.activeElement;

      onError?.({
        type: 'MODAL_OPENED',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      onOpen?.();

      setTimeout(() => {
        const closeButton = modalRef.current?.querySelector(
          '[aria-label="Close modal"]'
        );
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

  const handleClose = useCallback(() => {
    try {
      onError?.({
        type: 'MODAL_CLOSED',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      if (restoreFocus) {
        restoreFocus.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }

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

  const handleBackdropClick = useCallback((event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onError?.({
        type: 'MODAL_CLOSED_BACKDROP',
        title: typeof title === 'string' ? title : 'Unknown',
        timestamp: new Date().toISOString()
      });

      handleClose();
    }
  }, [closeOnBackdrop, title, onerror, handleClose]);

  const handleKeyDown = useCallback((event) => {
    if (event.keyCode !== 9) return;

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

  useEffect(() => {
    if (isOpen) {
      handleModalOpen();
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0';
      window.addEventListener('keydown', handleEscKey);

      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen, handleModalOpen, handleEscKey]);

  // ✅ FIXED: Size mapping with pixel values
  const sizePixels = useMemo(() => ({
    sm: '384px',       // ✅ DELETE MODAL - SMALL
    md: '448px',       // Medium
    lg: '512px',       // Large
    xl: '640px',       // Extra Large
    '2xl': '768px',    // 2XL
    '3xl': '896px',    // 3XL
    '4xl': '1024px',   // 4XL
    '5xl': '1280px',   // 5XL
    '6xl': '1536px',   // 6XL
    '7xl': '1792px',   // 7XL
    full: '100%'
  }), []);

  // ✅ FIXED: Get the width value
  const modalWidth = useMemo(
    () => maxWidth || sizePixels[size] || sizePixels.md,
    [maxWidth, size, sizePixels]
  );

  if (!isOpen) return null;

  const titleId = useMemo(() => `modal-title-${Date.now()}`, []);

  return (
    <div
      className={`fixed inset-0 z-50 ${theme} theme-${color}`}
      onClick={handleBackdropClick}
      role="presentation"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* ✅ FIXED: Proper centering with flex */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Modal Content Wrapper */}
        <div
          ref={modalRef}
          className={`bg-card border border-border rounded-xl shadow-2xl overflow-hidden ${className}`}
          style={{
            width: '100%',
            maxWidth: modalWidth,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex-1 pr-4">
                {typeof title === 'string' ? (
                  <h2
                    id={titleId}
                    className="text-xl font-semibold text-foreground"
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

          {/* Body */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
