// =======================================================================
// FILE: src/components/FormSelect.jsx (NEW)
// PURPOSE: Reusable form select component
// =======================================================================
import React from 'react';

const AlertTriangleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const FormSelect = React.memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false, 
  error = null, 
  description = null,
  className = ""
}) => (
  <div className={`space-y-3 ${className}`}>
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
        error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-2">
        <AlertTriangleIcon />
        {error}
      </p>
    )}
    {description && <p className="text-sm text-gray-500">{description}</p>}
  </div>
));

FormSelect.displayName = 'FormSelect';

export default FormSelect;
