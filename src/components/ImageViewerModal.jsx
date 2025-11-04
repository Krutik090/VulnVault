// =======================================================================
// FILE: src/components/ImageViewerModal.jsx (ENHANCED)
// PURPOSE: Accessible, robust modal with zoom/pan for image viewing
// SOC 2: Secure URL handling, accessibility (WCAG), resilient state
// =======================================================================

import { useState, useEffect, useCallback } from 'react';
import {
  XIcon,
  DownloadIcon,
  ExternalLinkIcon,
  ZoomInIcon,     // <-- NEW
  ZoomOutIcon,    // <-- NEW
  RefreshCwIcon,  // <-- NEW
  AlertTriangleIcon // <-- From your original
} from './Icons';
import { useTheme } from '../contexts/ThemeContext';

const ImageViewerModal = ({
  isOpen,
  imageUrl,
  onClose,
  alt = "Image preview" // <-- NEW: More accessible alt prop
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // --- NEW: State for Zoom & Pan ---
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  // ---

  // ✅ NEW: Reset state when modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setImageError(false);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // ✅ NEW: Handle Escape key to close (Accessibility)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // ✅ ENHANCED: Robust download for cross-origin images
  const handleDownload = useCallback(async () => {
    if (!imageUrl) return;

    try {
      // Fetch the image
      const response = await fetch(imageUrl, {
        mode: 'cors', // Handle cross-origin
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const filename = imageUrl.split('/').pop() || 'image';

      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Download error:', error);
      // Fallback: Try the simple open-in-tab method
      handleOpenInTab();
    }
  }, [imageUrl]);

  const handleOpenInTab = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // --- NEW: Zoom & Pan Handlers ---
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 5)); // Max 5x zoom
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const newZoom = Math.max(prev / 1.5, 1); // Min 1x zoom
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 }); // Reset position at 1x
      }
      return newZoom;
    });
  };

  const handleMouseDown = (e) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.target.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoom <= 1) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    // Find the image element and reset cursor
    const img = document.getElementById('zoomable-image');
    if (img) {
      img.style.cursor = zoom > 1 ? 'grab' : 'default';
    }
  };

  const handleImageError = (e) => {
    console.error('❌ Image loading error:', imageUrl);
    console.error('Error details:', e);
    setImageError(true);
    setIsLoading(false);
  };

  const handleReload = () => {
    setImageError(false);
    setIsLoading(true);
  };
  // ---

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      // ✅ NEW: Accessibility roles
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`${theme} relative bg-card rounded-xl shadow-2xl max-w-5xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-foreground">
            Image Viewer
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
            aria-label="Close modal (Press Escape)"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div
          className="flex-1 flex items-center justify-center min-h-[400px] bg-black/10 overflow-hidden"
          // ✅ NEW: Mouse events for panning
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {imageError ? (
            // ✅ ENHANCED: Error state with "Try Again"
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Image Failed to Load
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                The image URL might be incorrect or the file may have been moved.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleReload} // <-- NEW
                  className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCwIcon className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={handleOpenInTab}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  Open in Tab
                </button>
              </div>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute z-10 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <img
                id="zoomable-image" // <-- NEW ID
                src={imageUrl}
                alt={alt}
                className="max-w-full max-h-full object-contain transition-transform duration-100 ease-linear"
                style={{
                  // ✅ NEW: Apply zoom and pan
                  transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                  cursor: isLoading ? 'wait' : (zoom > 1 ? 'grab' : 'default'),
                  visibility: isLoading ? 'hidden' : 'visible'
                }}
                onLoad={() => setIsLoading(false)}
                onError={handleImageError}
                onMouseDown={handleMouseDown} // <-- NEW
                crossOrigin="anonymous" // Keep for CORS
              />
            </>
          )}
        </div>

        {/* Footer */}
        {!imageError && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30 flex-shrink-0">
            {/* ✅ NEW: Zoom Controls */}
            <div className="flex items-center gap-1 p-1 bg-background border border-border rounded-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1 || isLoading}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOutIcon className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-mono text-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 5 || isLoading}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomInIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                aria-label="Download image"
              >
                <DownloadIcon className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleOpenInTab}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                aria-label="Open in new tab"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                Open in Tab
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewerModal;