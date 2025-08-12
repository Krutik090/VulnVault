// =======================================================================
// FILE: src/components/Modal.jsx (FIXED SCROLLING COMPLETELY)
// PURPOSE: A reusable modal component with proper scrolling support
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

  const modalSizeClass = maxWidth ? sizeClasses[maxWidth] || `max-w-${maxWidth}` : sizeClasses[size];

  return (
    <div className={`${theme} theme-${color}`}>
      {/* Fixed Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container - COMPLETELY FIXED */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 pb-8">
        <div className={`
          relative w-full bg-card border border-border rounded-xl shadow-2xl
          ${modalSizeClass}
          max-h-full
          overflow-hidden
          ${className}
        `}>
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Modal Header */}
          {title && (
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-card-foreground pr-8">
                {title}
              </h2>
            </div>
          )}

          {/* Modal Content - This will handle its own scrolling */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
