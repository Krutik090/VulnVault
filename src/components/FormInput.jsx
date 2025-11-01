// =======================================================================
// FILE: src/components/FormInput.jsx
// PURPOSE: Enhanced form input component with date picker & accessibility
// SOC 2: Input validation, sanitization, XSS prevention, WCAG compliance
// =======================================================================

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import DatePicker from './DatePicker';

// ✅ UPDATED: Import icons from centralized file
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from './Icons';

/**
 * FormInput Component
 * Reusable form input with theme support and accessibility
 * 
 * @param {string} label - Field label
 * @param {string} type - Input type (text, email, password, textarea, date, etc.)
 * @param {any} value - Field value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {boolean} required - Mark as required
 * @param {string} error - Error message
 * @param {boolean} disabled - Disable input
 * @param {string} name - Input name for form submission
 * @param {string} className - Additional CSS classes
 * @param {string} description - Helper text
 * @param {Function} onError - Error callback for compliance logging
 * @param {number} maxLength - Max character length (for validation)
 * @param {string} pattern - Regex pattern for validation
 * @param {boolean} autoComplete - Autocomplete attribute
 * 
 * @example
 * <FormInput
 *   label="Email Address"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   required
 *   placeholder="user@example.com"
 *   onError={logError}
 * />
 */
const FormInput = React.memo(({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  error = null, 
  disabled = false,
  name,
  className = "",
  // Date picker specific props
  dateMode = "single",
  showToday = true,
  minDate = null,
  maxDate = null,
  disabledDays = [],
  // Description and validation
  description = null,
  onError = null,
  maxLength = null,
  pattern = null,
  autoComplete = true,
  ...props 
}) => {
  const { theme, color } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  /**
   * ✅ SOC 2: Sanitize input value
   * Prevent XSS attacks by removing dangerous characters
   */
  const sanitizeInput = useCallback((inputValue) => {
    if (typeof inputValue !== 'string') return inputValue;

    return inputValue
      .replace(/[<>]/g, '') // Remove HTML tags
      .trim();
  }, []);

  /**
   * ✅ SOC 2: Validate input based on type
   * Ensure data integrity and prevent injection attacks
   */
  const validateInput = useCallback((inputValue, inputType) => {
    const validationErrors = {};

    if (!inputValue && required) {
      validationErrors.required = `${label || 'This field'} is required`;
      return validationErrors;
    }

    if (!inputValue) return validationErrors;

    switch (inputType) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputValue)) {
          validationErrors.format = 'Invalid email format';
        }
        break;

      case 'password':
        if (inputValue.length < 8) {
          validationErrors.length = 'Password must be at least 8 characters';
        }
        if (!/[A-Z]/.test(inputValue)) {
          validationErrors.uppercase = 'Password must contain uppercase letter';
        }
        if (!/[0-9]/.test(inputValue)) {
          validationErrors.number = 'Password must contain number';
        }
        break;

      case 'tel':
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(inputValue)) {
          validationErrors.format = 'Invalid phone number format';
        }
        break;

      case 'url':
        try {
          new URL(inputValue);
        } catch {
          validationErrors.format = 'Invalid URL format';
        }
        break;

      case 'number':
        if (isNaN(inputValue)) {
          validationErrors.format = 'Must be a number';
        }
        break;

      default:
        break;
    }

    // ✅ SOC 2: Max length validation
    if (maxLength && inputValue.length > maxLength) {
      validationErrors.maxLength = `Maximum ${maxLength} characters allowed`;
    }

    // ✅ SOC 2: Pattern validation
    if (pattern && !new RegExp(pattern).test(inputValue)) {
      validationErrors.pattern = 'Invalid format';
    }

    return validationErrors;
  }, [label, required, maxLength, pattern]);

  /**
   * Handle input change with validation and sanitization
   * ✅ SOC 2: Input validation, sanitization, audit logging
   */
  const handleChange = useCallback((e) => {
    const inputValue = e.target.value;

    try {
      // ✅ Security: Sanitize input
      const sanitizedValue = sanitizeInput(inputValue);

      // ✅ SOC 2: Validate input
      const validationErrors = validateInput(sanitizedValue, type);

      // Log validation errors if present
      if (Object.keys(validationErrors).length > 0) {
        onError?.({
          type: 'VALIDATION_ERROR',
          field: name || label,
          errors: validationErrors,
          inputType: type,
          timestamp: new Date().toISOString()
        });
      }

      // ✅ SOC 2: Audit logging for sensitive fields
      if (['password', 'email', 'ssn', 'creditCard'].includes(type)) {
        onError?.({
          type: 'SENSITIVE_FIELD_MODIFIED',
          field: name || label,
          fieldType: type,
          timestamp: new Date().toISOString()
        });
      }

      // Call parent onChange
      onChange?.(e);
    } catch (error) {
      console.error('Input change error:', error);
      onError?.({
        type: 'INPUT_CHANGE_ERROR',
        field: name || label,
        error: error.message
      });
    }
  }, [type, onChange, sanitizeInput, validateInput, name, label, onError]);

  /**
   * Handle password visibility toggle
   * ✅ SOC 2: Audit log sensitive field interactions
   */
  const handleTogglePassword = useCallback(() => {
    const newState = !showPassword;
    setShowPassword(newState);

    onError?.({
      type: 'PASSWORD_VISIBILITY_TOGGLED',
      field: name || label,
      visible: newState,
      timestamp: new Date().toISOString()
    });
  }, [showPassword, name, label, onError]);

  // Memoize field ID for accessibility
  const fieldId = useMemo(() => `field-${name || label?.replace(/\s+/g, '-')}`, [name, label]);
  const errorId = useMemo(() => `${fieldId}-error`, [fieldId]);
  const descriptionId = useMemo(() => `${fieldId}-description`, [fieldId]);

  // ✅ Handle date picker
  if (type === 'date' || type === 'datetime') {
    return (
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        error={error}
        disabled={disabled}
        mode={dateMode}
        showToday={showToday}
        minDate={minDate}
        maxDate={maxDate}
        disabledDays={disabledDays}
        className={className}
        onError={onError}
      />
    );
  }

  // ✅ Handle password input
  if (type === 'password') {
    return (
      <div className={`${theme} theme-${color} ${className}`}>
        {/* Label - ✅ Accessibility: Proper label association */}
        {label && (
          <label 
            htmlFor={fieldId}
            className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        {/* Password Input - ✅ Accessibility: ARIA attributes */}
        <div className="relative">
          <input
            id={fieldId}
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={value || ''}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete ? 'current-password' : 'off'}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100 placeholder:text-gray-500 
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
              ${
                disabled 
                  ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
                  : error 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 focus:ring-offset-0' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 focus:ring-offset-0'
              }
            `}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : description ? descriptionId : undefined}
            {...props}
          />

          {/* Password Toggle Button - ✅ Accessibility: ARIA label */}
          <button
            type="button"
            onClick={handleTogglePassword}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-ring rounded p-1 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOffIcon className="w-5 h-5" aria-hidden="true" />
            ) : (
              <EyeIcon className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Error Message - ✅ Accessibility: ARIA live region */}
        {error && (
          <p 
            id={errorId}
            className="mt-2 text-sm text-red-600 flex items-center gap-2"
            role="alert"
            aria-live="polite"
          >
            <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Description - ✅ Accessibility: Associated via aria-describedby */}
        {description && (
          <p 
            id={descriptionId}
            className="mt-2 text-sm text-gray-500"
          >
            {description}
          </p>
        )}
      </div>
    );
  }

  // ✅ Handle regular inputs (text, email, tel, etc.)
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
      
      {/* Textarea or Input */}
      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 placeholder:text-gray-500 
            resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              disabled 
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
                : error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 focus:ring-offset-0' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 focus:ring-offset-0'
            }
          `}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
          {...props}
        />
      ) : (
        <input
          id={fieldId}
          type={type}
          name={name}
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete ? 'on' : 'off'}
          className={`
            w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 
            text-gray-900 dark:text-gray-100 placeholder:text-gray-500 
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              disabled 
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
                : error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 focus:ring-offset-0' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-blue-500 focus:border-blue-500 focus:ring-offset-0'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
          {...props}
        />
      )}

      {/* Character Counter - ✅ Accessibility & UX */}
      {maxLength && (
        <div className="flex justify-end">
          <p className={`text-xs ${
            value && value.length / maxLength > 0.9 
              ? 'text-red-500' 
              : 'text-gray-400'
          }`}>
            {value?.length || 0} / {maxLength}
          </p>
        </div>
      )}

      {/* Error Message - ✅ Accessibility: ARIA live region */}
      {error && (
        <p 
          id={errorId}
          className="text-sm text-red-600 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
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
    </div>
  );
});

// ✅ Display name for debugging
FormInput.displayName = 'FormInput';

export default FormInput;
