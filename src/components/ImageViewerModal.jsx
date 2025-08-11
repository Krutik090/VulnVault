// =======================================================================
// FILE: src/components/ImageViewerModal.jsx (UPDATED)
// PURPOSE: A modal for displaying larger versions of images with theme support.
// =======================================================================
import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ImageViewerModal = ({ imageUrl, onClose }) => {
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

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    window.addEventListener('keydown', handleEsc);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div className={`${theme} theme-${color} fixed inset-0 z-50 flex items-center justify-center modal-overlay`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div className="relative z-10 max-w-7xl max-h-[90vh] mx-4 bg-card rounded-lg shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-card border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Image Viewer</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors group"
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
        </div>

        {/* Image Container */}
        <div className="p-4 flex items-center justify-center bg-muted/30">
          <img
            src={imageUrl}
            alt="Full size view"
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            onError={(e) => {
              e.target.src = '/placeholder-image.png'; // Fallback image
              e.target.alt = 'Image failed to load';
            }}
          />
        </div>

        {/* Footer with Controls */}
        <div className="p-4 bg-card border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded font-mono text-xs">ESC</kbd> or click outside to close
          </div>
          
          <div className="flex items-center gap-2">
            {/* Download Button */}
            <a
              href={imageUrl}
              download
              className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </a>
            
            {/* Open in New Tab */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </a>
          </div>
        </div>
      </div>

      {/* Loading State (if needed) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="hidden" id="image-loader">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
