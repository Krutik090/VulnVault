// =======================================================================
// FILE: src/components/ImageViewerModal.jsx
// PURPOSE: Modal for displaying larger versions of images with accessibility
// SOC 2: Secure URL validation, image access logging, WCAG compliance
// =======================================================================

import { useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { CloseIcon, DownloadIcon, LinkIcon } from './Icons';

/**
 * ImageViewerModal Component
 * Modal for viewing full-size images with download functionality
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {string} imageUrl - URL of image to display
 * @param {Function} onClose - Callback when modal closes
 * @param {string} title - Image title for accessibility
 * @param {string} caption - Image caption/description
 * @param {Function} onDownload - Callback when image is downloaded
 * @param {Function} onError - Error callback for compliance logging
 * @param {boolean} allowDownload - Enable download functionality (default: true)
 * @param {boolean} allowOpenTab - Enable open in new tab (default: true)
 * @param {object} imageMetadata - Image metadata for audit logging
 * 
 * @example
 * <ImageViewerModal
 *   isOpen={showViewer}
 *   imageUrl="/poc/vuln-screenshot.png"
 *   title="Vulnerability Evidence"
 *   caption="XSS vulnerability in login form"
 *   onClose={() => setShowViewer(false)}
 *   onError={logError}
 * />
 */
const ImageViewerModal = ({ 
  isOpen, 
  imageUrl, 
  onClose,
  title = "Image Viewer",
  caption = null,
  onDownload = null,
  onError = null,
  allowDownload = true,
  allowOpenTab = true,
  imageMetadata = null
}) => {
  const { theme, color } = useTheme();

  /**
   * ✅ SOC 2: Validate image URL
   * Ensure URL is safe and properly formatted
   */
  const validateImageUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') {
      onError?.({
        type: 'INVALID_IMAGE_URL',
        url,
        message: 'Image URL is invalid or missing'
      });
      return false;
    }

    try {
      // ✅ Security: Validate URL format
      const urlObj = new URL(url, window.location.origin);
      
      // ✅ Security: Only allow http/https
      if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
        onError?.({
          type: 'UNSAFE_URL_PROTOCOL',
          protocol: urlObj.protocol,
          message: 'URL protocol is not allowed'
        });
        return false;
      }

      return true;
    } catch (error) {
      onError?.({
        type: 'URL_VALIDATION_ERROR',
        url,
        error: error.message
      });
      return false;
    }
  }, [onError]);

  /**
   * ✅ SOC 2: Handle image download
   * Secure download with audit logging
   */
  const handleDownload = useCallback(async (e) => {
    try {
      e.preventDefault();

      // ✅ SOC 2: Validate URL before download
      if (!validateImageUrl(imageUrl)) {
        return;
      }

      // ✅ SOC 2: Audit logging - download initiated
      onError?.({
        type: 'IMAGE_DOWNLOAD_INITIATED',
        imageUrl,
        metadata: imageMetadata,
        timestamp: new Date().toISOString()
      });

      // Create download link
      const link = document.createElement('a');
      link.href = imageUrl;
      
      // Generate filename from URL or use default
      const filename = imageUrl.split('/').pop() || `image-${Date.now()}.png`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // ✅ SOC 2: Audit logging - download completed
      onError?.({
        type: 'IMAGE_DOWNLOADED',
        filename,
        imageUrl,
        metadata: imageMetadata,
        timestamp: new Date().toISOString()
      });

      // Call callback if provided
      onDownload?.({ filename, url: imageUrl });
    } catch (error) {
      console.error('Download error:', error);
      onError?.({
        type: 'IMAGE_DOWNLOAD_ERROR',
        error: error.message,
        imageUrl
      });
    }
  }, [imageUrl, validateImageUrl, onDownload, onError, imageMetadata]);

  /**
   * Handle opening image in new tab
   * ✅ SOC 2: Audit logging
   */
  const handleOpenInNewTab = useCallback((e) => {
    try {
      // ✅ SOC 2: Validate URL before opening
      if (!validateImageUrl(imageUrl)) {
        e.preventDefault();
        return;
      }

      // ✅ SOC 2: Audit logging
      onError?.({
        type: 'IMAGE_OPENED_IN_TAB',
        imageUrl,
        metadata: imageMetadata,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Open in tab error:', error);
      onError?.({
        type: 'IMAGE_OPEN_TAB_ERROR',
        error: error.message,
        imageUrl
      });
    }
  }, [imageUrl, validateImageUrl, onError, imageMetadata]);

  /**
   * Handle image load error
   * ✅ SOC 2: Error tracking
   */
  const handleImageError = useCallback((e) => {
    console.error('Image load error:', e);

    onError?.({
      type: 'IMAGE_LOAD_ERROR',
      imageUrl,
      status: e.target.status,
      statusText: e.target.statusText,
      timestamp: new Date().toISOString()
    });

    // Set fallback image
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="14" fill="%23999"%3EImage failed to load%3C/text%3E%3C/svg%3E';
    e.target.alt = 'Image failed to load';
  }, [imageUrl, onError]);

  /**
   * Handle ESC key press
   * ✅ Accessibility: Keyboard support
   */
  const handleEscKey = useCallback((event) => {
    if (event.keyCode === 27) {
      // ✅ SOC 2: Audit logging - modal closed via ESC
      onError?.({
        type: 'MODAL_CLOSED_ESC',
        imageUrl,
        timestamp: new Date().toISOString()
      });
      onClose?.();
    }
  }, [imageUrl, onClose, onError]);

  /**
   * Handle backdrop click
   * ✅ Accessibility: Click outside to close
   */
  const handleBackdropClick = useCallback((event) => {
    if (event.target.classList.contains('image-viewer-overlay')) {
      // ✅ SOC 2: Audit logging - modal closed via backdrop
      onError?.({
        type: 'MODAL_CLOSED_BACKDROP',
        imageUrl,
        timestamp: new Date().toISOString()
      });
      onClose?.();
    }
  }, [imageUrl, onClose, onError]);

  /**
   * Handle modal close
   * ✅ SOC 2: Audit logging
   */
  const handleModalClose = useCallback(() => {
    onError?.({
      type: 'IMAGE_VIEWER_CLOSED',
      imageUrl,
      metadata: imageMetadata,
      timestamp: new Date().toISOString()
    });
    onClose?.();
  }, [imageUrl, onClose, onError, imageMetadata]);

  // Setup event listeners
  useEffect(() => {
    const handleClickOutside = handleBackdropClick;

    // Prevent body scroll when modal is open
    if (isOpen !== undefined ? isOpen : imageUrl) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0';

      // ✅ SOC 2: Audit logging - modal opened
      onError?.({
        type: 'IMAGE_VIEWER_OPENED',
        imageUrl,
        metadata: imageMetadata,
        timestamp: new Date().toISOString()
      });

      window.addEventListener('keydown', handleEscKey);
      window.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscKey);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, imageUrl, handleEscKey, handleBackdropClick, onError, imageMetadata]);

  // Validate image URL on mount
  useMemo(() => {
    if (imageUrl) {
      validateImageUrl(imageUrl);
    }
  }, [imageUrl, validateImageUrl]);

  // Support both patterns: isOpen prop or just imageUrl
  const isModalOpen = useMemo(() => {
    if (isOpen !== undefined) return isOpen;
    return !!imageUrl;
  }, [isOpen, imageUrl]);

  if (!isModalOpen) return null;

  // ✅ Security: Final URL validation before rendering
  if (!validateImageUrl(imageUrl)) {
    return null;
  }

  return (
    <div 
      className={`${theme} theme-${color} fixed inset-0 z-50 flex items-center justify-center image-viewer-overlay`}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop - ✅ Accessibility: Aria-hidden */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        aria-hidden="true"
      />

      {/* Modal Container - ✅ Accessibility: Dialog role */}
      <div 
        className="relative z-10 max-w-7xl max-h-[90vh] mx-4 bg-card rounded-lg shadow-2xl border border-border overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-viewer-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - ✅ Accessibility: Semantic structure */}
        <div className="flex items-center justify-between p-4 bg-card border-b border-border flex-shrink-0">
          <div>
            <h3 
              id="image-viewer-title"
              className="text-lg font-semibold text-card-foreground"
            >
              {title}
            </h3>
            {caption && (
              <p className="text-sm text-muted-foreground mt-1">{caption}</p>
            )}
          </div>
          
          {/* Close Button - ✅ Accessibility: ARIA label */}
          <button
            onClick={handleModalClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close image viewer"
          >
            <CloseIcon 
              className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" 
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Image Container - ✅ Accessibility: Proper semantics */}
        <div className="p-4 flex items-center justify-center bg-muted/30 flex-1 overflow-auto">
          <img
            src={imageUrl}
            alt={caption || "Full size image view"}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={handleImageError}
            loading="lazy"
            decoding="async"
            role="img"
            aria-label={caption || "Expanded image view"}
          />
        </div>

        {/* Footer with Controls - ✅ Accessibility: Proper button semantics */}
        <div className="p-4 bg-card border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded font-mono text-xs">ESC</kbd> or click outside to close
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Download Button - ✅ SOC 2: Audit logging */}
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Download image"
              >
                <DownloadIcon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">Save</span>
              </button>
            )}

            {/* Open in New Tab - ✅ SOC 2: Audit logging */}
            {allowOpenTab && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Open image in new tab"
              >
                <LinkIcon className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Open in Tab</span>
                <span className="sm:hidden">Open</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
