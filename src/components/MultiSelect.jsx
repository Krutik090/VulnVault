// =======================================================================
// FILE: src/components/MultiSelect.jsx (FIXED)
// PURPOSE: A user-friendly multi-select component with proper undefined handling
// =======================================================================
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MultiSelect = ({ 
  label, 
  options = [], // ✅ Default to empty array
  value = [], // ✅ FIXED: Default to empty array instead of 'selected'
  onChange, 
  placeholder = "Select options...", 
  disabled = false, 
  error = null, 
  maxDisplayTags = 3 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);
  const { theme, color } = useTheme();

  // ✅ FIXED: Ensure value is always an array
  const selected = Array.isArray(value) ? value : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  const handleSelect = (optionValue) => {
    if (!onChange) return; // ✅ Safety check
    
    if (selected.includes(optionValue)) {
      onChange(selected.filter(item => item !== optionValue));
    } else {
      onChange([...selected, optionValue]);
    }
  };

  const getOptionLabel = (value) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : '';
  };

  const removeTag = (valueToRemove) => {
    if (!onChange) return; // ✅ Safety check
    onChange(selected.filter(item => item !== valueToRemove));
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ FIXED: Safe slice operation with fallback
  const displayTags = selected.slice(0, maxDisplayTags);
  const hiddenCount = Math.max(0, selected.length - maxDisplayTags);

  return (
    <div className={`${theme} theme-${color} relative`} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-2">
          {label}
        </label>
      )}
      
      {/* Selection Display */}
      <div
        className={`min-h-[42px] w-full px-3 py-2 border rounded-lg bg-background cursor-pointer flex flex-wrap items-center gap-2 ${
          disabled 
            ? 'bg-muted cursor-not-allowed opacity-60' 
            : error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-input focus:ring-2 focus:ring-ring focus:border-transparent hover:border-primary/50'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {/* Selected Tags */}
        {displayTags.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
          >
            {getOptionLabel(value)}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(value);
                }}
                className="text-primary/70 hover:text-primary ml-1"
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
        <svg
          className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Selection Summary */}
          <div className="px-3 py-2 bg-muted/50 border-b border-border">
            <span className="text-xs text-muted-foreground">
              {selected.length} of {options.length} options selected
            </span>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-between ${
                    selected.includes(option.value) 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-card-foreground'
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="text-sm">{option.label}</span>
                  {selected.includes(option.value) && (
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
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
};

// ✅ FIXED: Set default props to prevent undefined errors
MultiSelect.defaultProps = {
  options: [],
  value: [],
  maxDisplayTags: 3,
  placeholder: "Select options...",
  disabled: false
};

export default MultiSelect;
