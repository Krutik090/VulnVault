// =======================================================================
// FILE: src/components/FormInput.jsx (ENHANCED WITH FOCUS LOSS PREVENTION)
// PURPOSE: Enhanced form input component with modern date picker support and focus loss prevention
// =======================================================================
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import DatePicker from './DatePicker';

// ✅ ADDED: AlertTriangleIcon for error messages
const AlertTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

// ✅ ENHANCED: Wrapped with React.memo to prevent focus loss
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
  // ✅ ADDED: description prop for additional help text
  description = null,
  ...props 
}) => {
  const { theme, color } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  // Handle date picker
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
      />
    );
  }

  // Handle password input
  if (type === 'password') {
    return (
      <div className={`${theme} theme-${color} ${className}`}>
        {label && (
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name={name}
            value={value || ''} // ✅ ENHANCED: Ensure controlled input
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled 
                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
                : error 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {/* ✅ ENHANCED: Better error message styling with icon */}
        {error && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangleIcon />
            {error}
          </p>
        )}
        {/* ✅ ADDED: Description support */}
        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      </div>
    );
  }

  // Handle regular inputs
  return (
    <div className={`${theme} theme-${color} space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''} // ✅ ENHANCED: Ensure controlled input
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
              : error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          rows={4}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''} // ✅ ENHANCED: Ensure controlled input
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
              : error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          {...props}
        />
      )}
      
      {/* ✅ ENHANCED: Better error message styling with icon */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <AlertTriangleIcon />
          {error}
        </p>
      )}

      {/* ✅ ADDED: Description support */}
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
});

// ✅ ADDED: Display name for debugging
FormInput.displayName = 'FormInput';

export default FormInput;
