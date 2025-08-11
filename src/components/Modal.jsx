// =======================================================================
// FILE: src/components/Modal.jsx (UPDATED)
// PURPOSE: A reusable, accessible modal component with theme support.
// =======================================================================
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showCloseButton = true }) => {
  const { theme, color } = useTheme();

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
      window.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('click', handleClickOutside);
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
    full: 'max-w-full mx-4',
  };

  return (
    <div className={`${theme} theme-${color} fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
      
      {/* Modal Container */}
      <div className={`
        relative z-10 w-full ${sizeClasses[size]} 
        bg-card rounded-lg shadow-2xl border border-border 
        transform transition-all duration-300 ease-out
        max-h-[90vh] overflow-hidden
      `}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            {title && (
              <h3 className="text-lg font-semibold text-card-foreground">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors group ml-auto"
                aria-label="Close modal"
              >
                <svg 
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Optional: Modal Header component for consistency
export const ModalHeader = ({ children, className = "" }) => {
  return (
    <div className={`pb-4 border-b border-border mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Optional: Modal Footer component for actions
export const ModalFooter = ({ children, className = "" }) => {
  return (
    <div className={`pt-4 border-t border-border mt-6 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Optional: Modal Body component for structured content
export const ModalBody = ({ children, className = "" }) => {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
};

export default Modal;
