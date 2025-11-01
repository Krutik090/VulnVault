// =======================================================================
// FILE: src/components/SearchableDropdown.jsx
// PURPOSE: Reusable, theme-aware dropdown with search and compliance
// SOC 2: Input validation, XSS prevention, audit logging, WCAG compliance
// =======================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { 
  ChevronDownIcon, 
  CheckIcon, 
  CloseIcon, 
  AlertTriangleIcon,
  SearchIcon
} from './Icons';

/**
 * SearchableDropdown Component
 * Accessible, searchable dropdown with validation and compliance
 * 
 * @param {Array} options - Array of { value, label } objects
 * @param {string|null} value - Selected value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} label - Field label
 * @param {string} error - Error message
 * @param {boolean} disabled - Disable dropdown
 * @param {boolean} required - Mark as required
 * @param {string} noOptionsMessage - Message when no options
 * @param {Function} onError - Error callback for compliance logging
 * @param {string} className - Additional CSS classes
 * 
 * @example
 * const options = [
 *   { value: 'critical', label: 'Critical' },
 *   { value: 'high', label: 'High' }
 * ];
 * 
 * <SearchableDropdown
 *   label="Severity"
 *   options={options}
 *   value={severity}
 *   onChange={setSeverity}
 *   required
 *   onError={logError}
 * />
 */
const SearchableDropdown = React.memo(({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Select an option",
  label = null,
  error = null,
  disabled = false,
  required = false,
  noOptionsMessage = "No options found",
  onError = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const { theme, color } = useTheme();

  const fieldId = useMemo(() => `dropdown-${label?.replace(/\s+/g, '-')}`, [label]);
  const errorId = useMemo(() => `${fieldId}-error`, [fieldId]);

  /**
   * ✅ SOC 2: Validate options array
   * Ensure options have required structure
   */
  const validatedOptions = useMemo(() => {
    if (!Array.isArray(options)) {
      onError?.({
        type: 'INVALID_OPTIONS_TYPE',
        message: 'Options must be an array'
      });
      return [];
    }

    return options.filter(opt => {
      if (!opt || typeof opt !== 'object') {
        console.warn('Invalid option:', opt);
        return false;
      }
      if (opt.value === undefined || opt.value === null || !opt.label) {
        console.warn('Option missing value or label:', opt);
        return false;
      }
      return true;
    });
  }, [options, onError]);

  /**
   * ✅ SOC 2: Sanitize search input
   * Prevent XSS and injection attacks
   */
  const sanitizeSearchTerm = useCallback((term) => {
    if (!term || typeof term !== 'string') return '';
    
    return term
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 100);
  }, []);

  /**
   * ✅ Filter and sanitize options based on search
   */
  const filteredOptions = useMemo(() => {
    const sanitized = sanitizeSearchTerm(searchTerm);
    
    return validatedOptions.filter(option =>
      option?.label?.toLowerCase().includes(sanitized.toLowerCase())
    );
  }, [validatedOptions, searchTerm, sanitizeSearchTerm]);

  /**
   * Get selected option label
   */
  const selectedOptionLabel = useMemo(() => {
    if (value === undefined || value === null) return placeholder;
    const selectedOption = validatedOptions.find(option => option?.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  }, [validatedOptions, value, placeholder]);

  /**
   * ✅ SOC 2: Validate selection
   */
  const validateSelection = useCallback((selectedValue) => {
    if (required && (selectedValue === undefined || selectedValue === null)) {
      onError?.({
        type: 'REQUIRED_FIELD_EMPTY',
        field: label,
        timestamp: new Date().toISOString()
      });
      return false;
    }

    // Validate selected value exists in options
    if (selectedValue !== undefined && selectedValue !== null) {
      if (!validatedOptions.some(opt => opt.value === selectedValue)) {
        onError?.({
          type: 'INVALID_SELECTION',
          value: selectedValue,
          availableOptions: validatedOptions.map(o => o.value)
        });
        return false;
      }
    }

    return true;
  }, [required, label, validatedOptions, onError]);

  /**
   * Handle option selection
   * ✅ SOC 2: Validation and audit logging
   */
  const handleSelect = useCallback((optionValue) => {
    try {
      // ✅ Validate selection
      if (!validateSelection(optionValue)) {
        return;
      }

      // ✅ SOC 2: Audit logging
      onError?.({
        type: 'OPTION_SELECTED',
        value: optionValue,
        label: selectedOptionLabel,
        timestamp: new Date().toISOString()
      });

      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
      setIsTouched(true);
    } catch (error) {
      console.error('Selection error:', error);
      onError?.({
        type: 'SELECT_ERROR',
        error: error.message
      });
    }
  }, [onChange, validateSelection, selectedOptionLabel, onError]);

  /**
   * Handle dropdown toggle
   */
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
      
      onError?.({
        type: 'DROPDOWN_TOGGLED',
        isOpen: !isOpen,
        timestamp: new Date().toISOString()
      });
    }
  }, [isOpen, disabled, onError]);

  /**
   * Handle clear selection
   * ✅ SOC 2: Audit logging
   */
  const handleClear = useCallback((e) => {
    e.stopPropagation();
    
    onError?.({
      type: 'SELECTION_CLEARED',
      previousValue: value,
      timestamp: new Date().toISOString()
    });

    onChange(null);
    setSearchTerm('');
    setIsOpen(false);
    setIsTouched(true);
  }, [value, onChange, onError]);

  /**
   * Handle search input change
   * ✅ SOC 2: Input sanitization and logging
   */
  const handleSearchChange = useCallback((e) => {
    const searchValue = e.target.value;
    const sanitized = sanitizeSearchTerm(searchValue);
    
    setSearchTerm(sanitized);

    onError?.({
      type: 'SEARCH_TERM_CHANGED',
      searchTerm: sanitized,
      resultsCount: filteredOptions.length,
      timestamp: new Date().toISOString()
    });
  }, [sanitizeSearchTerm, filteredOptions.length, onError]);

  /**
   * Handle clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    
    onError?.({
      type: 'SEARCH_CLEARED',
      timestamp: new Date().toISOString()
    });
  }, [onError]);

  /**
   * Handle ESC and click outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsTouched(true);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setIsTouched(true);

        onError?.({
          type: 'DROPDOWN_CLOSED_ESC',
          timestamp: new Date().toISOString()
        });
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onError]);

  /**
   * Auto-focus search input when dropdown opens
   */
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div 
      className={`${theme} theme-${color} relative w-full ${className}`} 
      ref={dropdownRef}
    >
      {/* Label - ✅ Accessibility: Proper label association */}
      {label && (
        <label 
          htmlFor={fieldId}
          className="block text-sm font-medium text-card-foreground mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {/* Main Dropdown Button - ✅ Accessibility: ARIA attributes */}
      <div className="relative">
        <button
          id={fieldId}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            relative w-full px-3 py-2 text-left border rounded-lg
            bg-background text-foreground
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error && isTouched 
              ? 'border-red-500 focus:ring-red-500 focus:ring-offset-0' 
              : isOpen 
                ? 'ring-2 ring-primary border-primary ring-offset-0'
                : 'border-input hover:border-primary/50 focus:ring-primary focus:ring-offset-0'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
            }
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={`${fieldId}-label`}
          aria-invalid={!!(error && isTouched)}
          aria-describedby={error && isTouched ? errorId : undefined}
        >
          <span className={`block truncate ${!value ? 'text-muted-foreground' : ''}`}>
            {selectedOptionLabel}
          </span>

          {/* Clear button - ✅ Accessibility: ARIA label */}
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Clear selection"
            >
              <CloseIcon className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
            </button>
          )}

          {/* Dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* Dropdown Panel - ✅ Accessibility: Listbox role */}
        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
            role="listbox"
            aria-label={label}
          >
            {/* Search Input */}
            <div className="p-2 border-b border-border flex-shrink-0">
              <div className="relative">
                <SearchIcon 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" 
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-8 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  aria-label="Search options"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label="Clear search"
                  >
                    <CloseIcon className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto flex-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(option.value);
                      }
                    }}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground
                      focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary
                      ${value === option.value 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-card-foreground'
                      }
                      transition-colors cursor-pointer
                    `}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      {value === option.value && (
                        <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                  {searchTerm ? `No options found for "${searchTerm}"` : noOptionsMessage}
                </div>
              )}
            </div>

            {/* Footer with results count */}
            {filteredOptions.length > 0 && (
              <div className="px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex-shrink-0">
                {filteredOptions.length} of {validatedOptions.length} options
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message - ✅ Accessibility: ARIA live region */}
      {error && isTouched && (
        <div 
          id={errorId}
          className="mt-2 flex items-center gap-2"
          role="alert"
          aria-live="polite"
        >
          <AlertTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
});

// ✅ Display name for debugging
SearchableDropdown.displayName = 'SearchableDropdown';

export default SearchableDropdown;
