// =======================================================================
// FILE: src/components/StatCard.jsx
// PURPOSE: Reusable stat card component for dashboard with compliance
// SOC 2: Data validation, XSS prevention, audit logging, WCAG compliance
// =======================================================================

import React, { useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  AlertTriangleIcon
} from './Icons';

/**
 * StatCard Component
 * Reusable dashboard stat card with trend indicators
 * 
 * @param {string} title - Card title/label
 * @param {string|number} value - Main stat value
 * @param {React.Component} icon - Icon component to display
 * @param {string} trend - Trend direction: 'up', 'down', or 'neutral'
 * @param {string|number} trendValue - Trend value to display
 * @param {string} description - Optional description text
 * @param {string} color - Color theme: 'primary', 'success', 'warning', 'danger', 'info'
 * @param {Function} onClick - Click handler
 * @param {Function} onError - Error callback for compliance logging
 * @param {string} className - Additional CSS classes
 * @param {boolean} loading - Show loading state
 * 
 * @example
 * <StatCard
 *   title="Total Projects"
 *   value={42}
 *   icon={ProjectsIcon}
 *   trend="up"
 *   trendValue="+12.5%"
 *   color="primary"
 *   onClick={handleClick}
 *   onError={logError}
 * />
 */
const StatCard = React.memo(({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  description,
  color = 'primary',
  onClick = null,
  onError = null,
  className = '',
  loading = false
}) => {
  const { theme, color: themeColor } = useTheme();

  /**
   * ✅ SOC 2: Validate color prop
   */
  const colorClasses = useMemo(() => ({
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
    danger: 'bg-red-500/10 text-red-500',
    info: 'bg-blue-500/10 text-blue-500',
  }), []);

  /**
   * ✅ SOC 2: Validate color value
   */
  const validatedColor = useMemo(() => {
    if (!colorClasses[color]) {
      onError?.({
        type: 'INVALID_COLOR',
        color,
        availableColors: Object.keys(colorClasses),
        timestamp: new Date().toISOString()
      });
      return 'primary';
    }
    return color;
  }, [color, colorClasses, onError]);

  /**
   * ✅ SOC 2: Validate trend value
   */
  const validatedTrend = useMemo(() => {
    const validTrends = ['up', 'down', 'neutral', null];
    if (trend && !validTrends.includes(trend)) {
      onError?.({
        type: 'INVALID_TREND',
        trend,
        availableTrends: validTrends,
        timestamp: new Date().toISOString()
      });
      return null;
    }
    return trend;
  }, [trend, onError]);

  /**
   * ✅ SOC 2: Sanitize and validate text inputs
   */
  const sanitizeText = useCallback((text) => {
    if (!text) return '';
    if (typeof text !== 'string' && typeof text !== 'number') return '';
    
    return String(text)
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 500);
  }, []);

  const sanitizedTitle = useMemo(() => sanitizeText(title), [title, sanitizeText]);
  const sanitizedDescription = useMemo(() => sanitizeText(description), [description, sanitizeText]);
  const sanitizedTrendValue = useMemo(() => sanitizeText(trendValue), [trendValue, sanitizeText]);

  /**
   * ✅ SOC 2: Validate numeric value
   */
  const validatedValue = useMemo(() => {
    if (value === undefined || value === null) return '—';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value).substring(0, 50);
  }, [value]);

  /**
   * Get trend icon based on direction
   */
  const getTrendIcon = useCallback(() => {
    if (validatedTrend === 'up') {
      return <TrendingUpIcon className="w-4 h-4 text-green-500 flex-shrink-0" aria-hidden="true" />;
    }
    if (validatedTrend === 'down') {
      return <TrendingDownIcon className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />;
    }
    return <MinusIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />;
  }, [validatedTrend]);

  /**
   * ✅ SOC 2: Handle click with audit logging
   */
  const handleCardClick = useCallback(() => {
    try {
      onError?.({
        type: 'STAT_CARD_CLICKED',
        title: sanitizedTitle,
        value: validatedValue,
        color: validatedColor,
        timestamp: new Date().toISOString()
      });

      onClick?.();
    } catch (error) {
      console.error('StatCard click error:', error);
      onError?.({
        type: 'STAT_CARD_CLICK_ERROR',
        error: error.message
      });
    }
  }, [onClick, sanitizedTitle, validatedValue, validatedColor, onError]);

  /**
   * ✅ SOC 2: Get trend label for accessibility
   */
  const getTrendLabel = useCallback(() => {
    if (validatedTrend === 'up') {
      return `Trending up by ${sanitizedTrendValue}`;
    }
    if (validatedTrend === 'down') {
      return `Trending down by ${sanitizedTrendValue}`;
    }
    return 'No trend change';
  }, [validatedTrend, sanitizedTrendValue]);

  return (
    <div 
      className={`${theme} theme-${themeColor} ${className}`}
      role="region"
      aria-label={`${sanitizedTitle} statistic`}
    >
      <div
        className={`
          bg-card border border-border rounded-lg p-6 
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          ${onClick 
            ? 'cursor-pointer hover:shadow-lg hover:border-primary/50' 
            : 'hover:shadow-md'
          }
          ${loading ? 'opacity-70' : ''}
        `}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleCardClick();
          }
        }}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-busy={loading}
      >
        <div className="flex items-start justify-between">
          {/* Left side - Content */}
          <div className="flex-1 min-w-0">
            {/* Title - ✅ Accessibility: Proper heading */}
            <p 
              className="text-sm font-medium text-muted-foreground truncate"
              id={`stat-title-${sanitizedTitle?.replace(/\s+/g, '-')}`}
            >
              {sanitizedTitle}
            </p>

            {/* Value - ✅ Accessibility: Clear value */}
            <h3 
              className="text-3xl font-bold mt-2 text-foreground"
              aria-label={`${sanitizedTitle}: ${validatedValue}`}
            >
              {loading ? (
                <span className="inline-block w-20 h-8 bg-muted rounded animate-pulse" />
              ) : (
                validatedValue
              )}
            </h3>
            
            {/* Description */}
            {sanitizedDescription && !loading && (
              <p className="text-xs text-muted-foreground mt-1">
                {sanitizedDescription}
              </p>
            )}
            
            {/* Trend indicator - ✅ Accessibility: ARIA label */}
            {validatedTrend && !loading && (
              <div 
                className="flex items-center gap-2 mt-3"
                role="status"
                aria-label={getTrendLabel()}
              >
                {getTrendIcon()}
                <span className="text-sm text-muted-foreground">
                  {sanitizedTrendValue}
                </span>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="mt-3">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
            )}
          </div>
          
          {/* Right side - Icon */}
          {Icon && !loading && (
            <div 
              className={`p-3 rounded-lg ${colorClasses[validatedColor]} flex-shrink-0 ml-4`}
              aria-hidden="true"
            >
              <Icon className="w-6 h-6" />
            </div>
          )}

          {/* Loading icon state */}
          {loading && (
            <div 
              className={`p-3 rounded-lg ${colorClasses[validatedColor]} flex-shrink-0 ml-4 opacity-50`}
              aria-hidden="true"
            >
              <div className="w-6 h-6 rounded-full border-2 border-muted border-t-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Error state indicator */}
        {validatedColor === 'danger' && (
          <div 
            className="mt-2 flex items-center gap-1 text-danger text-xs"
            role="status"
          >
            <AlertTriangleIcon className="w-3 h-3" aria-hidden="true" />
            <span>Requires attention</span>
          </div>
        )}
      </div>
    </div>
  );
});

// ✅ Display name for debugging
StatCard.displayName = 'StatCard';

export default StatCard;
