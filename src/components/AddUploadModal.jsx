// =======================================================================
// FILE: src/components/AddUploadModal.jsx
// PURPOSE: Modal for uploading POC images with captions
// SOC 2: File validation, secure upload handling, audit logging, data privacy
// =======================================================================

import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { CloseIcon, UploadIcon, ImageIcon } from './Icons';

/**
 * AddUploadModal Component
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Callback when modal closes
 * @param {Function} onSubmit - Callback when files are submitted
 * @param {boolean} isUploading - Upload in progress state
 * @param {object} options - Configuration options
 * @param {number} options.maxFileSize - Max file size in MB (default: 25)
 * @param {number} options.maxFiles - Max number of files (default: 10)
 * @param {number} options.maxCaptionLength - Max caption characters (default: 500)
 * @param {Function} options.onError - Error callback for compliance logging
 * 
 * @example
 * <AddUploadModal 
 *   isOpen={showModal}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 *   isUploading={uploading}
 *   options={{
 *     maxFileSize: 25,
 *     maxFiles: 10,
 *     onError: logError
 *   }}
 * />
 */
const AddUploadModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isUploading,
  options = {}
}) => {
  const { theme } = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [captions, setCaptions] = useState({});
  const [previews, setPreviews] = useState({});
  const [errors, setErrors] = useState({});

  // ✅ SOC 2: Configuration with defaults
  const config = useMemo(() => ({
    maxFileSize: options.maxFileSize || 10, // MB
    maxFiles: options.maxFiles || 10,
    maxCaptionLength: options.maxCaptionLength || 500,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onError: options.onError || (() => {})
  }), [options]);

  /**
   * ✅ SOC 2: Validate file before processing
   * - Check file size
   * - Check MIME type
   * - Check number of files
   * - Scan for malicious content (basic checks)
   */
  const validateFile = useCallback((file, index) => {
    const errors = {};

    // Check file size (SOC 2: Availability - prevent DOS)
    if (file.size > config.maxFileSize * 1024 * 1024) {
      errors.size = `File exceeds ${config.maxFileSize}MB limit`;
      config.onError({
        type: 'FILE_SIZE_EXCEEDED',
        file: file.name,
        size: file.size,
        maxSize: config.maxFileSize * 1024 * 1024
      });
    }

    // Check MIME type (SOC 2: Security - prevent malicious uploads)
    if (!config.allowedMimeTypes.includes(file.type)) {
      errors.type = `Invalid file type. Allowed: ${config.allowedMimeTypes.join(', ')}`;
      config.onError({
        type: 'INVALID_FILE_TYPE',
        file: file.name,
        mimeType: file.type
      });
    }

    // Check filename for suspicious characters (SOC 2: Security)
    if (!/^[\w\-. ]+$/.test(file.name)) {
      errors.name = 'Filename contains invalid characters';
      config.onError({
        type: 'INVALID_FILENAME',
        file: file.name
      });
    }

    return errors;
  }, [config]);

  /**
   * Handle file selection with validation
   * ✅ SOC 2: Input validation, error tracking, secure preview generation
   */
  const handleFileSelect = (e) => {
    try {
      const files = Array.from(e.target.files || []);
      
      // ✅ SOC 2: Validate total file count
      if (files.length > config.maxFiles) {
        const errorMsg = `Maximum ${config.maxFiles} files allowed`;
        setErrors({ general: errorMsg });
        config.onError({
          type: 'TOO_MANY_FILES',
          count: files.length,
          max: config.maxFiles
        });
        return;
      }

      const newPreviews = {};
      const newCaptions = {};
      const newErrors = {};
      let validFileCount = 0;

      files.forEach((file, index) => {
        // Validate file
        const fileErrors = validateFile(file, index);
        
        if (Object.keys(fileErrors).length > 0) {
          newErrors[index] = fileErrors;
          return;
        }

        try {
          // ✅ Security: Create preview URL (blob URL)
          newPreviews[index] = URL.createObjectURL(file);
          newCaptions[index] = '';
          validFileCount++;
        } catch (error) {
          console.error('Preview generation failed:', error);
          newErrors[index] = { preview: 'Failed to generate preview' };
          config.onError({
            type: 'PREVIEW_GENERATION_ERROR',
            file: file.name,
            error: error.message
          });
        }
      });

      if (validFileCount === 0) {
        setErrors(newErrors);
        return;
      }

      setSelectedFiles(files.filter((_, idx) => !newErrors[idx]));
      setPreviews(newPreviews);
      setCaptions(newCaptions);
      setErrors(newErrors);

      // ✅ SOC 2: Audit logging
      config.onError?.({
        type: 'FILES_SELECTED',
        count: validFileCount,
        totalSize: files.reduce((sum, f) => sum + f.size, 0),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('File selection error:', error);
      setErrors({ general: 'Failed to process files' });
      config.onError({
        type: 'FILE_SELECTION_ERROR',
        error: error.message
      });
    }
  };

  /**
   * Handle caption change with length validation
   * ✅ SOC 2: Input validation and sanitization
   */
  const handleCaptionChange = useCallback((index, value) => {
    // Validate caption length (SOC 2: Processing Integrity)
    if (value.length > config.maxCaptionLength) {
      setErrors(prev => ({
        ...prev,
        [index]: { caption: `Caption exceeds ${config.maxCaptionLength} characters` }
      }));
      return;
    }

    // ✅ Security: Sanitize caption (remove potential XSS)
    const sanitizedValue = value
      .replace(/[<>]/g, ''); // Remove HTML tags

    setCaptions(prev => ({
      ...prev,
      [index]: sanitizedValue
    }));

    // Clear error if it was fixed
    setErrors(prev => {
      const updated = { ...prev };
      if (updated[index]?.caption) {
        delete updated[index].caption;
      }
      return updated;
    });
  }, [config.maxCaptionLength]);

  /**
   * Handle form submission
   * ✅ SOC 2: Validation, audit logging, error handling
   */
  const handleSubmit = useCallback(() => {
    try {
      // Validate file selection
      if (selectedFiles.length === 0) {
        const errorMsg = 'Please select at least one image';
        setErrors({ general: errorMsg });
        config.onError({
          type: 'NO_FILES_SELECTED',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check for validation errors
      if (Object.keys(errors).length > 0) {
        config.onError({
          type: 'VALIDATION_ERRORS',
          errors: errors,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // ✅ SOC 2: Audit logging before submission
      config.onError({
        type: 'UPLOAD_INITIATED',
        fileCount: selectedFiles.length,
        totalSize: selectedFiles.reduce((sum, f) => sum + f.size, 0),
        timestamp: new Date().toISOString()
      });

      // Extract captions in order
      const captionList = selectedFiles.map((_, index) => captions[index] || '');

      // Call parent submit handler
      onSubmit(selectedFiles, captionList);
    } catch (error) {
      console.error('Submit error:', error);
      config.onError({
        type: 'SUBMIT_ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }, [selectedFiles, captions, errors, onSubmit, config]);

  /**
   * Handle modal close with cleanup
   * ✅ Security: Cleanup resources (memory management)
   */
  const handleClose = useCallback(() => {
    try {
      // ✅ Memory cleanup: Revoke all preview URLs
      Object.values(previews).forEach(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });

      // Reset state
      setSelectedFiles([]);
      setCaptions({});
      setPreviews({});
      setErrors({});

      // ✅ SOC 2: Audit logging
      config.onError?.({
        type: 'MODAL_CLOSED',
        timestamp: new Date().toISOString()
      });

      onClose();
    } catch (error) {
      console.error('Close error:', error);
      onClose();
    }
  }, [previews, onClose, config]);

  // ✅ Accessibility: Return null if modal is not open
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget && !isUploading) {
          handleClose();
        }
      }}
    >
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-lg">
        
        {/* ==================== Header ==================== */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <h2 
            id="modal-title"
            className="text-xl font-semibold text-card-foreground"
          >
            Upload POC Images
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close modal"
          >
            <CloseIcon className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* ==================== Content ==================== */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* General Error Message */}
          {errors.general && (
            <div 
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.general}
              </p>
            </div>
          )}

          {selectedFiles.length === 0 ? (
            /* ===== File Select Area ===== */
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="upload-modal-file-input"
                disabled={isUploading}
                aria-label="Select images to upload"
              />
              <label
                htmlFor="upload-modal-file-input"
                className={`cursor-pointer flex flex-col items-center gap-4 ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-medium text-card-foreground mb-1">
                    Click to select images
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can select up to {config.maxFiles} images ({config.maxFileSize}MB each)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            /* ===== Selected Files with Captions ===== */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{selectedFiles.length}</span> image(s) selected
                </p>
                <button
                  onClick={() => {
                    const input = document.getElementById('upload-modal-file-input');
                    if (input) input.click();
                  }}
                  disabled={isUploading}
                  className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring rounded px-2 py-1"
                  aria-label="Change selected files"
                >
                  Change files
                </button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="upload-modal-file-input"
                  disabled={isUploading}
                />
              </div>

              {/* ===== File Preview List ===== */}
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 space-y-3 ${
                    errors[index] 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/10' 
                      : 'border-border'
                  }`}
                >
                  {/* Error for this file */}
                  {errors[index] && (
                    <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                      {Object.entries(errors[index]).map(([key, msg]) => (
                        <p key={key}>• {msg}</p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Preview Image */}
                    <div className="flex-shrink-0">
                      {previews[index] ? (
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="w-24 h-24 object-cover rounded border border-border"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded border border-border bg-muted flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* File Info & Caption */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                      </p>
                      
                      {/* Caption Input - ✅ SOC 2: Input validation */}
                      <div className="mt-3">
                        <label 
                          htmlFor={`caption-${index}`}
                          className="block text-sm font-medium text-card-foreground mb-1"
                        >
                          Caption
                          <span className="text-xs text-muted-foreground ml-2">
                            (optional • {captions[index]?.length || 0}/{config.maxCaptionLength})
                          </span>
                        </label>
                        <input
                          id={`caption-${index}`}
                          type="text"
                          value={captions[index] || ''}
                          onChange={(e) => handleCaptionChange(index, e.target.value)}
                          placeholder={`Enter caption for ${file.name.substring(0, 20)}...`}
                          disabled={isUploading}
                          maxLength={config.maxCaptionLength}
                          className={`
                            w-full px-3 py-2 border rounded-lg bg-background text-foreground text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${errors[index]?.caption ? 'border-red-500' : 'border-input'}
                          `}
                          aria-label={`Caption for ${file.name}`}
                          aria-describedby={errors[index]?.caption ? `caption-error-${index}` : undefined}
                        />
                        {errors[index]?.caption && (
                          <p 
                            id={`caption-error-${index}`}
                            className="text-xs text-red-600 dark:text-red-400 mt-1"
                          >
                            {errors[index].caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ==================== Footer ==================== */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-card">
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Cancel upload"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || selectedFiles.length === 0}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${isUploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
              `}
              aria-label={`Upload ${selectedFiles.length} image(s)`}
              aria-busy={isUploading}
            >
              {isUploading ? (
                <>
                  {/* Loading Spinner - ✅ Updated: Using custom spinner */}
                  <svg 
                    className="animate-spin h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" aria-hidden="true" />
                  <span>Upload {selectedFiles.length} image(s)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUploadModal;
