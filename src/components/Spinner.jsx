// =======================================================================
// FILE: src/components/Spinner.jsx
// PURPOSE: Reusable, theme-aware loading spinner with compliance
// SOC 2: Accessibility, user feedback, audit logging
// =======================================================================

import React, { useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Spinner Component
 * Loading indicator with theme support and accessibility
 * 
 * @param {boolean} fullPage - Display as full page overlay
 * @param {string} size - Spinner size: 'sm', 'md', 'lg', 'xl'
 * @param {string} message - Loading message to display
 * @param {boolean} overlay - Show background overlay
 * @param {Function} onError - Error callback for compliance logging
 * 
 * @example
 * <Spinner fullPage message="Loading data..." />
 * <Spinner size="lg" message="Processing..." />
 */
const Spinner = React.memo(({ 
  fullPage = false, 
  size = 'md', 
  message = null,
  overlay = true,
  onError = null
}) => {
  const { theme, color } = useTheme();

  /**
   * ✅ Size configuration
   */
  const sizeClasses = useMemo(() => ({
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  }), []);

  /**
   * ✅ Wrapper classes
   */
  const wrapperClasses = useMemo(() => {
    if (fullPage) {
      return `fixed inset-0 flex flex-col items-center justify-center z-50 ${
        overlay ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'
      }`;
    }
    return 'flex flex-col items-center justify-center p-4';
  }, [fullPage, overlay]);

  /**
   * ✅ SOC 2: Log spinner display
   */
  useEffect(() => {
    onError?.({
      type: 'SPINNER_DISPLAYED',
      fullPage,
      size,
      message,
      timestamp: new Date().toISOString()
    });

    return () => {
      onError?.({
        type: 'SPINNER_HIDDEN',
        timestamp: new Date().toISOString()
      });
    };
  }, [fullPage, size, message, onError]);

  return (
    <div 
      className={`${theme} theme-${color} ${wrapperClasses}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message || 'Loading'}
    >
      {/* Spinner */}
      <div className="relative">
        {/* Main spinner */}
        <div 
          className={`
            ${sizeClasses[size]} 
            border-muted-foreground/20 
            border-t-primary 
            rounded-full 
            animate-spin
          `}
          aria-hidden="true"
        />
        
        {/* Inner glow effect */}
        <div 
          className={`
            absolute inset-0
            ${sizeClasses[size]} 
            border-transparent 
            border-t-primary/30 
            rounded-full 
            animate-spin
            blur-sm
          `}
          aria-hidden="true"
        />
      </div>

      {/* Loading message - ✅ Accessibility: ARIA live region */}
      {message && (
        <div className="mt-4 text-center">
          <p 
            className="text-sm text-muted-foreground font-medium"
            role="status"
            aria-live="assertive"
          >
            {message}
          </p>
        </div>
      )}

      {/* Pulsing dots for additional visual interest */}
      {fullPage && !message && (
        <div 
          className="mt-6 flex space-x-1"
          aria-hidden="true"
        >
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.075s' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
        </div>
      )}
    </div>
  );
});

Spinner.displayName = 'Spinner';

/**
 * LoadingSkeleton Component
 * Text skeleton for placeholder loading states
 * 
 * @param {number} lines - Number of skeleton lines
 * @param {string} className - Additional CSS classes
 * @param {Function} onError - Error callback for compliance logging
 */
export const LoadingSkeleton = React.memo(({ 
  lines = 3, 
  className = "",
  onError = null
}) => {
  const { theme, color } = useTheme();

  useEffect(() => {
    onError?.({
      type: 'LOADING_SKELETON_DISPLAYED',
      lines,
      timestamp: new Date().toISOString()
    });
  }, [lines, onError]);
  
  return (
    <div 
      className={`${theme} theme-${color} animate-pulse ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            h-4 bg-muted rounded 
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            ${index !== 0 ? 'mt-2' : ''}
          `}
          aria-hidden="true"
        />
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * CardSkeleton Component
 * Card placeholder loading state
 * 
 * @param {Function} onError - Error callback for compliance logging
 */
export const CardSkeleton = React.memo(({ onError = null }) => {
  const { theme, color } = useTheme();

  useEffect(() => {
    onError?.({
      type: 'CARD_SKELETON_DISPLAYED',
      timestamp: new Date().toISOString()
    });
  }, [onError]);
  
  return (
    <div 
      className={`${theme} theme-${color} bg-card rounded-lg border border-border p-6 animate-pulse`}
      role="status"
      aria-label="Loading card content"
    >
      {/* Avatar and header */}
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="w-12 h-12 bg-muted rounded-full"
          aria-hidden="true"
        />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-1/2" aria-hidden="true" />
          <div className="h-3 bg-muted rounded w-1/3" aria-hidden="true" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" aria-hidden="true" />
        <div className="h-4 bg-muted rounded" aria-hidden="true" />
        <div className="h-4 bg-muted rounded w-3/4" aria-hidden="true" />
      </div>
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

/**
 * TableSkeleton Component
 * Table placeholder loading state
 * 
 * @param {number} rows - Number of rows to show
 * @param {number} columns - Number of columns
 * @param {Function} onError - Error callback for compliance logging
 */
export const TableSkeleton = React.memo(({ 
  rows = 5, 
  columns = 4,
  onError = null
}) => {
  const { theme, color } = useTheme();

  useEffect(() => {
    onError?.({
      type: 'TABLE_SKELETON_DISPLAYED',
      rows,
      columns,
      timestamp: new Date().toISOString()
    });
  }, [rows, columns, onError]);
  
  return (
    <div 
      className={`${theme} theme-${color} bg-card rounded-lg border border-border overflow-hidden`}
      role="status"
      aria-label={`Loading table with ${rows} rows and ${columns} columns`}
    >
      {/* Header */}
      <div className="bg-muted/50 p-4 border-b border-border">
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          aria-hidden="true"
        >
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="p-4 border-b border-border last:border-b-0"
          aria-hidden="true"
        >
          <div 
            className="grid gap-4 animate-pulse"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

TableSkeleton.displayName = 'TableSkeleton';

/**
 * ButtonSpinner Component
 * Small spinner for button loading states
 * 
 * @param {string} size - Spinner size: 'sm', 'md', 'lg'
 * @param {Function} onError - Error callback for compliance logging
 */
export const ButtonSpinner = React.memo(({ 
  size = 'sm',
  onError = null
}) => {
  const sizeClasses = useMemo(() => ({
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-2'
  }), []);

  useEffect(() => {
    onError?.({
      type: 'BUTTON_SPINNER_DISPLAYED',
      size,
      timestamp: new Date().toISOString()
    });
  }, [size, onError]);

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        border-current 
        border-t-transparent 
        rounded-full 
        animate-spin
      `}
      role="status"
      aria-label="Loading"
      aria-hidden="true"
    />
  );
});

ButtonSpinner.displayName = 'ButtonSpinner';

/**
 * SkeletonBlock Component
 * Generic skeleton placeholder
 * 
 * @param {number} height - Height in pixels
 * @param {number} width - Width percentage (1-100)
 * @param {boolean} rounded - Apply border radius
 * @param {Function} onError - Error callback for compliance logging
 */
export const SkeletonBlock = React.memo(({
  height = 20,
  width = 100,
  rounded = true,
  onError = null
}) => {
  const { theme, color } = useTheme();

  return (
    <div 
      className={`${theme} theme-${color} bg-muted animate-pulse ${rounded ? 'rounded' : ''}`}
      style={{
        height: `${height}px`,
        width: `${width}%`
      }}
      role="status"
      aria-label="Loading"
      aria-hidden="true"
    />
  );
});

SkeletonBlock.displayName = 'SkeletonBlock';

export default Spinner;
