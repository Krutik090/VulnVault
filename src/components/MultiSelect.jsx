// =======================================================================
// FILE: src/components/MultiSelect.jsx (FIXED)
// PURPOSE: User-friendly multi-select component with validation & accessibility
// SOC 2: Selection validation, audit logging, WCAG compliance, XSS prevention
// =======================================================================

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import icons from centralized file
import { ChevronDownIcon, CheckIcon, AlertTriangleIcon } from './Icons';

/**
 * MultiSelect Component
 * Accessible multi-select dropdown with search and validation
 */
const MultiSelect = React.memo(({ 
  label, 
  options = [],
  value = [],
  onChange, 
  placeholder = "Select options...", 
  disabled = false, 
  error = null,
  maxDisplayTags = 3,
  required = false,
  description = null,
  maxSelections = null,
  onError = null,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTouched, setIsTouched] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const { theme, color } = useTheme();

  /**
   * ✅ SOC 2: Ensure value is always an array
   * Type safety for selection
   */
  const selected = useMemo(() => {
    if (!Array.isArray(value)) {
      onError?.({
        type: 'INVALID_VALUE_TYPE',
        message: 'MultiSelect value must be an array',
        value: typeof value
      });
      return [];
    }
    return value;
  }, [value, onError]);

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
      if (!opt.value || !opt.label) {
        console.warn('Option missing value or label:', opt);
        return false;
      }
      return true;
    });
  }, [options, onError]);

  /**
   * ✅ SOC 2: Validate selection value
   * Ensure value exists in options
   */
  const validateSelection = useCallback((selectionValue) => {
    const validationErrors = {};

    if (required && selectionValue.length === 0) {
      validationErrors.required = `${label || 'This field'} requires at least one selection`;
    }

    // Validate all selected values exist in options
    selectionValue.forEach(val => {
      if (!validatedOptions.some(opt => opt.value === val)) {
        validationErrors.invalid = `Invalid selection: ${val}`;
        onError?.({
          type: 'INVALID_SELECTION',
          value: val,
          availableOptions: validatedOptions.map(o => o.value)
        });
      }
    });

    // Check max selections
    if (maxSelections && selectionValue.length > maxSelections) {
      validationErrors.maxSelections = `Maximum ${maxSelections} selections allowed`;
    }

    return validationErrors;
  }, [validatedOptions, required, label, maxSelections, onError]);

  /**
   * Handle selection/deselection with proper event handling
   * ✅ SOC 2: Input validation, audit logging
   */
  const handleSelect = useCallback((optionValue) => {
    try {
      if (!onChange) return;

      let newSelected;

      if (selected.includes(optionValue)) {
        // Deselect
        newSelected = selected.filter(item => item !== optionValue);

        onError?.({
          type: 'OPTION_DESELECTED',
          value: optionValue,
          timestamp: new Date().toISOString()
        });
      } else {
        // Select
        // ✅ SOC 2: Check max selections before adding
        if (maxSelections && selected.length >= maxSelections) {
          onError?.({
            type: 'MAX_SELECTIONS_REACHED',
            maxSelections,
            currentCount: selected.length,
            attemptedValue: optionValue
          });
          return;
        }

        newSelected = [...selected, optionValue];

        onError?.({
          type: 'OPTION_SELECTED',
          value: optionValue,
          totalSelected: newSelected.length,
          timestamp: new Date().toISOString()
        });
      }

      // ✅ SOC 2: Validate before calling onChange
      const validationErrors = validateSelection(newSelected);
      if (Object.keys(validationErrors).length > 0) {
        onError?.({
          type: 'VALIDATION_ERROR',
          errors: validationErrors
        });
      }

      onChange(newSelected);
      // ✅ FIXED: Keep dropdown open for multiple selections
    } catch (error) {
      console.error('Select error:', error);
      onError?.({
        type: 'SELECT_ERROR',
        error: error.message
      });
    }
  }, [selected, onChange, maxSelections, validateSelection, onError]);

  /**
   * Get label for option value
   * ✅ Security: Sanitize label output
   */
  const getOptionLabel = useCallback((optionValue) => {
    const option = validatedOptions.find(opt => opt.value === optionValue);
    if (!option) return '';
    
    // ✅ Security: Sanitize label to prevent XSS
    return String(option.label)
      .replace(/[<>]/g, '')
      .trim();
  }, [validatedOptions]);

  /**
   * Handle tag removal with proper event handling
   * ✅ SOC 2: Audit logging
   */
  const removeTag = useCallback((valueToRemove, e) => {
    try {
      e?.stopPropagation();
      
      if (!onChange) return;

      const newSelected = selected.filter(item => item !== valueToRemove);
      
      onError?.({
        type: 'TAG_REMOVED',
        value: valueToRemove,
        remainingCount: newSelected.length,
        timestamp: new Date().toISOString()
      });

      onChange(newSelected);
    } catch (error) {
      console.error('Remove tag error:', error);
      onError?.({
        type: 'REMOVE_TAG_ERROR',
        error: error.message
      });
    }
  }, [selected, onChange, onError]);

  /**
   * Handle search term change
   * ✅ Security: Sanitize search input
   */
  const handleSearchChange = useCallback((e) => {
    const searchValue = e.target.value;
    
    // ✅ Security: Sanitize search term
    const sanitized = searchValue
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 100); // Limit search length

    setSearchTerm(sanitized);

    onError?.({
      type: 'SEARCH_TERM_CHANGED',
      searchTerm: sanitized,
      timestamp: new Date().toISOString()
    });
  }, [onError]);

  /**
   * Filter options based on search
   */
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return validatedOptions;

    return validatedOptions.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [validatedOptions, searchTerm]);

  /**
   * Calculate display tags and hidden count
   */
  const { displayTags, hiddenCount } = useMemo(() => {
    return {
      displayTags: selected.slice(0, maxDisplayTags),
      hiddenCount: Math.max(0, selected.length - maxDisplayTags)
    };
  }, [selected, maxDisplayTags]);

  /**
   * ✅ FIXED: Handle click outside with better event handling
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsTouched(true);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      // Use a small delay to allow the click event to propagate
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  /**
   * Handle blur event
   * ✅ Accessibility: Mark as touched
   */
  const handleBlur = useCallback(() => {
    setIsTouched(true);

    onError?.({
      type: 'MULTISELECT_BLURRED',
      selectedCount: selected.length,
      timestamp: new Date().toISOString()
    });
  }, [selected.length, onError]);

  /**
   * Handle focus event
   * ✅ SOC 2: Audit logging
   */
  const handleFocus = useCallback(() => {
    onError?.({
      type: 'MULTISELECT_FOCUSED',
      timestamp: new Date().toISOString()
    });
  }, [onError]);

  /**
   * ✅ FIXED: Handle container click without closing
   */
  const handleContainerClick = (e) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Memoize field IDs for accessibility
  const fieldId = useMemo(() => `multiselect-${label?.replace(/\s+/g, '-')}`, [label]);
  const errorId = useMemo(() => `${fieldId}-error`, [fieldId]);
  const descriptionId = useMemo(() => `${fieldId}-description`, [fieldId]);

  // ✅ SOC 2: Validate initial state
  useMemo(() => {
    if (selected.length > 0) {
      validateSelection(selected);
    }
  }, [selected, validateSelection]);

  return (
    <div className={`${theme} theme-${color} relative ${className}`} ref={containerRef}>
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
      
      {/* Selection Display - ✅ Accessibility: ARIA attributes */}
      <div
        id={fieldId}
        className={`
          min-h-[42px] w-full px-3 py-2 border rounded-lg bg-background cursor-pointer 
          flex flex-wrap items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            disabled 
              ? 'bg-muted cursor-not-allowed opacity-60' 
              : error && isTouched
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500 focus:ring-offset-0' 
                : isOpen
                  ? 'border-primary bg-background focus:ring-primary focus:border-primary focus:ring-offset-0'
                  : 'border-input hover:border-primary/50 focus:ring-primary focus:border-primary focus:ring-offset-0'
          }
        `}
        onClick={handleContainerClick}
        onBlur={handleBlur}
        onFocus={handleFocus}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`${fieldId}-listbox`}
        aria-invalid={!!(error && isTouched)}
        aria-describedby={
          error && isTouched 
            ? errorId 
            : description 
              ? descriptionId 
              : undefined
        }
      >
        {/* Selected Tags */}
        {displayTags.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
            role="option"
            aria-selected="true"
          >
            {getOptionLabel(val)}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => removeTag(val, e)}
                className="text-primary/70 hover:text-primary ml-1 focus:outline-none focus:ring-1 focus:ring-primary rounded"
                aria-label={`Remove ${getOptionLabel(val)}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        
        {/* Hidden count indicator */}
        {hiddenCount > 0 && (
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
            +{hiddenCount} more
          </span>
        )}
        
        {/* Placeholder */}
        {selected.length === 0 && (
          <span className="text-muted-foreground text-sm">
            {placeholder}
          </span>
        )}
        
        {/* Dropdown Arrow */}
        <div className="ml-auto flex-shrink-0 pointer-events-none">
          <ChevronDownIcon
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Error Message - ✅ Accessibility: ARIA live region */}
      {error && isTouched && (
        <p 
          id={errorId}
          className="mt-1 text-sm text-red-600 flex items-center gap-2"
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
          className="mt-1 text-sm text-muted-foreground"
        >
          {description}
        </p>
      )}

      {/* Selection Count - ✅ UX improvement */}
      {selected.length > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          {selected.length} {selected.length === 1 ? 'option' : 'options'} selected
          {maxSelections && ` (max ${maxSelections})`}
        </div>
      )}

      {/* Dropdown List - ✅ FIXED: Improved event handling */}
      {isOpen && !disabled && (
        <div 
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-72 overflow-hidden flex flex-col"
          role="listbox"
          id={`${fieldId}-listbox`}
          ref={dropdownRef}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-border flex-shrink-0">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
              aria-label="Search options"
            />
          </div>

          {/* Selection Summary */}
          <div className="px-3 py-2 bg-muted/50 border-b border-border flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {selected.length} of {validatedOptions.length} options selected
            </span>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors flex items-center justify-between
                    hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary
                    ${
                      selected.includes(option.value) 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-card-foreground'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(option.value);
                    }
                  }}
                  role="option"
                  aria-selected={selected.includes(option.value)}
                  tabIndex={0}
                >
                  <span className="text-sm">{option.label}</span>
                  {selected.includes(option.value) && (
                    <CheckIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// ✅ Display name for debugging
MultiSelect.displayName = 'MultiSelect';

// ✅ Default props
MultiSelect.defaultProps = {
  options: [],
  value: [],
  maxDisplayTags: 3,
  placeholder: "Select options...",
  disabled: false
};

export default MultiSelect;
