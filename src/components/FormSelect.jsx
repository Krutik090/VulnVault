// =======================================================================
// FILE: src/components/FormSelect.jsx
// PURPOSE: Reusable form select component with validation and accessibility
// SOC 2: Input validation, selection tracking, WCAG compliance, audit logging
// =======================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { AlertTriangleIcon, ChevronDownIcon } from './Icons';

/**
 * FormSelect Component
 * Reusable select component with theme support and accessibility
 * 
 * @param {string} label - Field label
 * @param {string} name - Select name for form submission
 * @param {any} value - Selected value
 * @param {Function} onChange - Change handler
 * @param {Array} options - Array of { value, label } objects
 * @param {boolean} required - Mark as required
 * @param {string} error - Error message
 * @param {string} description - Helper text
 * @param {boolean} disabled - Disable select
 * @param {string} placeholder - Placeholder option text
 * @param {string} className - Additional CSS classes
 * @param {Function} onError - Error callback for compliance logging
 * @param {boolean} multiple - Allow multiple selections
 * @param {Array} disabledOptions - Values to disable
 * 
 * @example
 * const typeOptions = [
 *   { value: 'xss', label: 'Cross-Site Scripting (XSS)' },
 *   { value: 'sql', label: 'SQL Injection' }
 * ];
 * 
 * <FormSelect
 *   label="Vulnerability Type"
 *   name="vulnType"
 *   value={selected}
 *   onChange={(e) => setSelected(e.target.value)}
 *   options={typeOptions}
 *   required
 *   onError={logError}
 * />
 */
const FormSelect = React.memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false, 
  error = null, 
  description = null,
  disabled = false,
  placeholder = "Select an option",
  className = "",
  onError = null,
  multiple = false,
  disabledOptions = []
}) => {
  const { theme, color } = useTheme();
  const [isTouched, setIsTouched] = useState(false);

  /**
   * ✅ SOC 2: Validate select value
   * Ensure selected value is in allowed options
   */
  const validateSelection = useCallback((selectedValue) => {
    const validationErrors = {};

    // Check required field
    if (required && (!selectedValue || selectedValue === '')) {
      validationErrors.required = `${label || 'This field'} is required`;
      return validationErrors;
    }

    // Validate single selection
    if (!multiple && selectedValue) {
      const validOption = options.find(opt => opt.value === selectedValue);
      if (!validOption) {
        validationErrors.invalid = 'Selected option is not valid';
        onError?.({
          type: 'INVALID_SELECTION',
          field: name || label,
          value: selectedValue,
          availableOptions: options.map(o => o.value)
        });
      }
    }

    // Validate multiple selections
    if (multiple && Array.isArray(selectedValue)) {
      selectedValue.forEach(val => {
        const validOption = options.find(opt => opt.value === val);
        if (!validOption) {
          validationErrors.invalid = 'One or more selected options are not valid';
        }
      });
    }

    return validationErrors;
  }, [options, required, label, name, multiple, onError]);

  /**
   * Handle selection change with validation
   * ✅ SOC 2: Input validation, audit logging
   */
  const handleChange = useCallback((e) => {
    try {
      const selectedValue = e.target.value;

      // ✅ SOC 2: Validate selection
      const validationErrors = validateSelection(selectedValue);

      // Log validation errors
      if (Object.keys(validationErrors).length > 0) {
        onError?.({
          type: 'VALIDATION_ERROR',
          field: name || label,
          errors: validationErrors,
          timestamp: new Date().toISOString()
        });
      }

      // ✅ SOC 2: Audit logging for selection change
      onError?.({
        type: 'SELECT_VALUE_CHANGED',
        field: name || label,
        newValue: selectedValue,
        previousValue: value,
        timestamp: new Date().toISOString()
      });

      // Call parent onChange
      onChange?.(e);
    } catch (error) {
      console.error('Select change error:', error);
      onError?.({
        type: 'SELECT_CHANGE_ERROR',
        field: name || label,
        error: error.message
      });
    }
  }, [value, onChange, validateSelection, name, label, onError]);

  /**
   * Handle blur event
   * ✅ SOC 2: Mark as touched for validation
   */
  const handleBlur = useCallback(() => {
    setIsTouched(true);

    // ✅ SOC 2: Audit logging
    onError?.({
      type: 'SELECT_BLURRED',
      field: name || label,
      value: value,
      timestamp: new Date().toISOString()
    });
  }, [value, name, label, onError]);

  /**
   * Handle focus event
   * ✅ SOC 2: Audit logging
   */
  const handleFocus = useCallback(() => {
    onError?.({
      type: 'SELECT_FOCUSED',
      field: name || label,
      timestamp: new Date().toISOString()
    });
  }, [name, label, onError]);

  // Memoize field IDs for accessibility
  const fieldId = useMemo(() => `select-${name || label?.replace(/\s+/g, '-')}`, [name, label]);
  const errorId = useMemo(() => `${fieldId}-error`, [fieldId]);
  const descriptionId = useMemo(() => `${fieldId}-description`, [fieldId]);

  // Get current selection label for accessibility
  const selectedLabel = useMemo(() => {
    if (!value) return placeholder;
    const selected = options.find(opt => opt.value === value);
    return selected?.label || placeholder;
  }, [value, options, placeholder]);

  // ✅ SOC 2: Validate initial state
  useMemo(() => {
    if (value && options.length > 0) {
      validateSelection(value);
    }
  }, [value, options, validateSelection]);

  return (
    <div className={`${theme} theme-${color} space-y-2 ${className}`}>
      {/* Label - ✅ Accessibility: Proper label association */}
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {/* Select Wrapper - ✅ Custom styling for chevron icon */}
      <div className="relative">
        <select
          id={fieldId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          multiple={multiple}
          className={`
            w-full px-4 py-3 pr-10 border rounded-lg bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
            ${
              disabled
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400'
                : error && isTouched
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 focus:ring-offset-0'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 focus:ring-offset-0'
            }
          `}
          aria-invalid={!!(error && isTouched)}
          aria-describedby={
            error && isTouched 
              ? errorId 
              : description 
                ? descriptionId 
                : undefined
          }
          aria-label={label || "Select option"}
        >
          {/* Placeholder Option */}
          {!multiple && !value && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Option Groups or Options */}
          {options.map((option, index) => {
            // ✅ SOC 2: Check if option is disabled
            const isOptionDisabled = disabledOptions.includes(option.value);

            return (
              <option
                key={`${option.value}-${index}`}
                value={option.value}
                disabled={isOptionDisabled}
              >
                {option.label}
              </option>
            );
          })}
        </select>

        {/* Custom Chevron Icon - ✅ Visual indicator */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDownIcon 
            className="w-5 h-5" 
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Selected Value Display - ✅ Accessibility: Screen reader info */}
      {value && (
        <div className="sr-only" role="status" aria-live="polite">
          {label} selected: {selectedLabel}
        </div>
      )}

      {/* Error Message - ✅ Accessibility: ARIA live region */}
      {error && isTouched && (
        <p
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangleIcon 
            className="w-4 h-4 flex-shrink-0" 
            aria-hidden="true"
          />
          {error}
        </p>
      )}

      {/* Description - ✅ Accessibility: Associated via aria-describedby */}
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-500"
        >
          {description}
        </p>
      )}

      {/* Selected Count for Multiple - ✅ UX improvement */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="text-xs text-blue-600 dark:text-blue-400">
          {value.length} {value.length === 1 ? 'item' : 'items'} selected
        </div>
      )}
    </div>
  );
});

// ✅ Display name for debugging
FormSelect.displayName = 'FormSelect';

export default FormSelect;
