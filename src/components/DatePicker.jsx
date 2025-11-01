// =======================================================================
// FILE: src/components/DatePicker.jsx
// PURPOSE: Professional date picker with modern styling and accessibility
// SOC 2: Input validation, date range security, audit logging, WCAG compliance
// =======================================================================

import { useState, useCallback, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { ChevronLeftIcon, ChevronRightIcon, AlertTriangleIcon, InfoIcon, CalendarIcon } from './Icons';

import 'react-day-picker/dist/style.css';

/**
 * DatePicker Component
 * Professional date picker with theme support and accessibility
 * 
 * @param {string} label - Field label
 * @param {Date|object|Array} value - Selected date(s)
 * @param {Function} onChange - Callback when date changes
 * @param {string} placeholder - Placeholder text
 * @param {boolean} disabled - Disable input
 * @param {string} error - Error message
 * @param {boolean} required - Mark as required
 * @param {string} mode - Selection mode: "single", "range", "multiple"
 * @param {boolean} showToday - Show "Today" button
 * @param {boolean} showWeekNumber - Show week numbers
 * @param {number} weekStartsOn - Week start day (0-6)
 * @param {Array} disabledDays - Disabled day conditions
 * @param {Date} minDate - Minimum selectable date
 * @param {Date} maxDate - Maximum selectable date
 * @param {string} className - Additional CSS classes
 * @param {Function} onError - Error callback for compliance logging
 * 
 * @example
 * <DatePicker
 *   label="Start Date"
 *   value={startDate}
 *   onChange={setStartDate}
 *   mode="single"
 *   required
 *   minDate={new Date('2025-01-01')}
 *   onError={logError}
 * />
 */
const DatePicker = ({ 
  label,
  value, 
  onChange, 
  placeholder = "Select a date",
  disabled = false,
  error = null,
  required = false,
  mode = "single",
  showToday = true,
  showWeekNumber = false,
  weekStartsOn = 1,
  disabledDays = [],
  minDate = null,
  maxDate = null,
  className = "",
  onError = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, color } = useTheme();

  /**
   * ✅ SOC 2: Validate date range
   * Ensure minDate < maxDate and dates are valid
   */
  const validateDateRange = useCallback(() => {
    if (minDate && maxDate && minDate > maxDate) {
      console.warn('DatePicker: minDate is after maxDate');
      onError?.({
        type: 'INVALID_DATE_RANGE',
        minDate,
        maxDate,
        message: 'Minimum date is after maximum date'
      });
      return false;
    }
    return true;
  }, [minDate, maxDate, onError]);

  /**
   * ✅ SOC 2: Validate selected date
   */
  const isDateValid = useCallback((date) => {
    if (!date) return true;

    if (minDate && date < minDate) {
      onError?.({
        type: 'DATE_BEFORE_MIN',
        date,
        minDate
      });
      return false;
    }

    if (maxDate && date > maxDate) {
      onError?.({
        type: 'DATE_AFTER_MAX',
        date,
        maxDate
      });
      return false;
    }

    return true;
  }, [minDate, maxDate, onError]);

  /**
   * Handle date selection with validation
   * ✅ SOC 2: Input validation, audit logging
   */
  const handleSelect = useCallback((date) => {
    try {
      // Validate date
      if (mode === "single" && date && !isDateValid(date)) {
        return;
      }

      // Validate range dates
      if (mode === "range" && date) {
        if (date.from && !isDateValid(date.from)) return;
        if (date.to && !isDateValid(date.to)) return;

        // ✅ SOC 2: Ensure from <= to
        if (date.from && date.to && date.from > date.to) {
          onError?.({
            type: 'INVALID_RANGE_ORDER',
            from: date.from,
            to: date.to
          });
          return;
        }
      }

      // Call onChange callback
      onChange?.(date);

      // ✅ SOC 2: Audit logging
      onError?.({
        type: 'DATE_SELECTED',
        mode,
        date,
        timestamp: new Date().toISOString()
      });

      // Close on single selection
      if (mode === "single") {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Date selection error:', error);
      onError?.({
        type: 'DATE_SELECTION_ERROR',
        error: error.message
      });
    }
  }, [mode, onChange, isDateValid, onError]);

  /**
   * Format display value with input validation
   * ✅ SOC 2: Safe date formatting
   */
  const formatDisplayValue = useCallback(() => {
    try {
      if (!value) return '';
      
      if (mode === "single" && value instanceof Date) {
        if (isNaN(value.getTime())) {
          console.warn('DatePicker: Invalid date value');
          return '';
        }
        return format(value, 'dd/MM/yyyy');
      }
      
      if (mode === "range" && value?.from) {
        if (isNaN(value.from.getTime())) {
          console.warn('DatePicker: Invalid from date');
          return '';
        }
        
        if (value.to) {
          if (isNaN(value.to.getTime())) {
            console.warn('DatePicker: Invalid to date');
            return '';
          }
          return `${format(value.from, 'dd/MM/yyyy')} - ${format(value.to, 'dd/MM/yyyy')}`;
        }
        return `${format(value.from, 'dd/MM/yyyy')} - ...`;
      }
      
      if (mode === "multiple" && Array.isArray(value) && value.length > 0) {
        return `${value.length} dates selected`;
      }
      
      return '';
    } catch (error) {
      console.error('Format display error:', error);
      return '';
    }
  }, [value, mode]);

  /**
   * Get disabled days configuration
   * ✅ SOC 2: Prevent selection of invalid dates
   */
  const getDisabledDays = useCallback(() => {
    const disabled = [...disabledDays];
    
    if (minDate) {
      disabled.push({ before: minDate });
    }
    
    if (maxDate) {
      disabled.push({ after: maxDate });
    }
    
    return disabled;
  }, [disabledDays, minDate, maxDate]);

  // Memoize values to prevent unnecessary re-renders
  const displayValue = useMemo(() => formatDisplayValue(), [formatDisplayValue]);
  const disabledConfig = useMemo(() => getDisabledDays(), [getDisabledDays]);
  const isRangeIncomplete = useMemo(() => mode === "range" && value?.from && !value?.to, [mode, value]);

  // ✅ SOC 2: Validate date range on mount
  useMemo(() => validateDateRange(), [validateDateRange]);

  /**
   * Handle "Today" button click
   * ✅ SOC 2: Audit logging
   */
  const handleSelectToday = useCallback(() => {
    const today = new Date();
    
    if (!isDateValid(today)) {
      return;
    }

    let selectedDate = today;

    if (mode === "range") {
      selectedDate = { from: today, to: today };
    } else if (mode === "multiple") {
      selectedDate = [today];
    }

    onError?.({
      type: 'TODAY_SELECTED',
      date: today,
      timestamp: new Date().toISOString()
    });

    handleSelect(selectedDate);
  }, [mode, isDateValid, handleSelect, onError]);

  return (
    <div className={`${theme} theme-${color} relative ${className}`}>
      {/* Label - ✅ Accessibility: Proper label association */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      {/* Input Display - ✅ Accessibility: ARIA labels and roles */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-3 text-left border rounded-lg transition-all duration-200 
            flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              disabled 
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
                : error 
                  ? 'border-red-300 bg-white dark:bg-gray-800 focus:ring-red-500 focus:border-red-500 hover:border-red-400 focus:ring-offset-2' 
                  : isOpen
                    ? 'border-blue-500 bg-white dark:bg-gray-800 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-blue-200 focus:border-blue-500'
            }
          `}
          aria-label={label || "Date picker"}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
        >
          <span className={`text-sm ${displayValue ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {displayValue || placeholder}
          </span>
          <CalendarIcon 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Calendar Dropdown - ✅ Accessibility: Dialog role */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            
            {/* Calendar Popup */}
            <div 
              className="absolute z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[320px]"
              role="dialog"
              aria-modal="true"
              aria-label="Date picker calendar"
            >
              {/* DayPicker Container - ✅ Custom styled */}
              <div className="modern-calendar p-4">
                <style jsx>{`
                  .modern-calendar .rdp {
                    margin: 0;
                    font-family: inherit;
                  }
                  
                  .modern-calendar .rdp-months {
                    display: flex;
                    justify-content: center;
                  }
                  
                  .modern-calendar .rdp-month {
                    margin: 0;
                  }
                  
                  .modern-calendar .rdp-caption {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 0.5rem 0 1rem 0;
                    margin-bottom: 1rem;
                    position: relative;
                  }
                  
                  .modern-calendar .rdp-caption_label {
                    font-size: 1rem;
                    font-weight: 700;
                    color: ${theme === 'dark' ? '#f3f4f6' : '#1f2937'};
                  }
                  
                  .modern-calendar .rdp-nav {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                  }
                  
                  .modern-calendar .rdp-nav_button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 2rem;
                    height: 2rem;
                    padding: 0;
                    border: none;
                    border-radius: 0.5rem;
                    background: transparent;
                    color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
                    cursor: pointer;
                    transition: all 0.2s;
                    focus: outline-offset 2px;
                  }
                  
                  .modern-calendar .rdp-nav_button:hover {
                    background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
                    color: ${theme === 'dark' ? '#f3f4f6' : '#1f2937'};
                  }
                  
                  .modern-calendar .rdp-nav_button:focus {
                    outline: 2px solid ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                    outline-offset: 2px;
                  }
                  
                  .modern-calendar .rdp-nav_button_previous {
                    position: absolute;
                    left: 0;
                  }
                  
                  .modern-calendar .rdp-nav_button_next {
                    position: absolute;
                    right: 0;
                  }
                  
                  .modern-calendar .rdp-table {
                    border-collapse: separate;
                    border-spacing: 2px;
                    width: 100%;
                  }
                  
                  .modern-calendar .rdp-head_cell {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-align: center;
                    padding: 0.5rem;
                    color: ${theme === 'dark' ? '#9ca3af' : '#6b7280'};
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                  }
                  
                  .modern-calendar .rdp-cell {
                    text-align: center;
                    padding: 0;
                  }
                  
                  .modern-calendar .rdp-button {
                    width: 2.5rem;
                    height: 2.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    background: transparent;
                    color: ${theme === 'dark' ? '#f3f4f6' : '#1f2937'};
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    focus: outline-offset 2px;
                  }
                  
                  .modern-calendar .rdp-button:hover:not(.rdp-button_disabled) {
                    background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
                    transform: scale(1.05);
                  }
                  
                  .modern-calendar .rdp-button:focus {
                    outline: 2px solid ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
                    outline-offset: 2px;
                  }
                  
                  .modern-calendar .rdp-day_today .rdp-button {
                    background: ${theme === 'dark' ? '#1e40af' : '#3b82f6'};
                    color: white;
                    font-weight: 700;
                  }
                  
                  .modern-calendar .rdp-day_selected .rdp-button {
                    background: ${theme === 'dark' ? '#059669' : '#10b981'};
                    color: white;
                    font-weight: 700;
                  }
                  
                  .modern-calendar .rdp-day_selected .rdp-button:hover {
                    background: ${theme === 'dark' ? '#047857' : '#059669'};
                    transform: scale(1.05);
                  }
                  
                  .modern-calendar .rdp-button_disabled {
                    color: ${theme === 'dark' ? '#4b5563' : '#d1d5db'};
                    cursor: not-allowed;
                    opacity: 0.5;
                  }
                  
                  .modern-calendar .rdp-day_outside .rdp-button {
                    color: ${theme === 'dark' ? '#6b7280' : '#9ca3af'};
                  }
                  
                  .modern-calendar .rdp-day_range_start .rdp-button,
                  .modern-calendar .rdp-day_range_end .rdp-button {
                    background: ${theme === 'dark' ? '#059669' : '#10b981'};
                    color: white;
                  }
                  
                  .modern-calendar .rdp-day_range_middle .rdp-button {
                    background: ${theme === 'dark' ? '#065f46' : '#a7f3d0'};
                    color: ${theme === 'dark' ? '#d1fae5' : '#064e3b'};
                  }
                `}</style>
                
                <DayPicker
                  mode={mode}
                  selected={value}
                  onSelect={handleSelect}
                  disabled={disabledConfig}
                  showWeekNumber={showWeekNumber}
                  weekStartsOn={weekStartsOn}
                  showOutsideDays
                  fixedWeeks
                  components={{
                    IconLeft: (props) => (
                      <ChevronLeftIcon 
                        {...props} 
                        className="w-4 h-4" 
                        aria-hidden="true"
                      />
                    ),
                    IconRight: (props) => (
                      <ChevronRightIcon 
                        {...props} 
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                    ),
                  }}
                />
              </div>
              
              {/* Footer - ✅ Accessibility: Button with proper ARIA */}
              {showToday && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    type="button"
                    onClick={handleSelectToday}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Select today's date"
                  >
                    <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                    Select Today
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Error Message - ✅ Accessibility: ARIA live region */}
      {error && (
        <p 
          id={`${label}-error`}
          className="mt-2 text-sm text-red-600 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Helper Text for Range Selection - ✅ Accessibility: ARIA live region */}
      {isRangeIncomplete && (
        <p 
          className="mt-1 text-sm text-blue-600 flex items-center gap-1"
          role="status"
          aria-live="polite"
        >
          <InfoIcon className="w-4 h-4" aria-hidden="true" />
          Please select an end date
        </p>
      )}
    </div>
  );
};

export default DatePicker;
