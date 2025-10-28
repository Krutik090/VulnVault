// =======================================================================
// FILE: src/components/Modal.jsx (COMPLETELY FIXED)
// PURPOSE: Clean, properly styled modal component
// =======================================================================

import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
      if (event.keyCode === 27 && onClose) onClose();
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
    full: 'max-w-full'
  };

  const widthClass = maxWidth || sizeClasses[size] || sizeClasses.md;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 lg:p-8 ${theme} theme-${color}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* Modal Container with Scroll */}
      <div className="relative w-full h-full flex items-start justify-center overflow-y-auto py-8">
        {/* Modal Content */}
        <div
          className={`relative w-full ${widthClass} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl">
            
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-border">
                <div className="flex-1">
                  {typeof title === 'string' ? (
                    <h2 className="text-xl font-semibold text-foreground">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                </div>
                
                {showCloseButton && onClose && (
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors flex-shrink-0"
                    aria-label="Close modal"
                  >
                    <CloseIcon />
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
    </div>
  );
};

export default Modal;
