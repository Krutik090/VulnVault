// =======================================================================
// FILE: src/components/MultiSelect.jsx (UPDATED)
// PURPOSE: A user-friendly multi-select component with tag display and theme support.
// =======================================================================
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const MultiSelect = ({ 
  label, 
  options, 
  selected, 
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
    onChange(selected.filter(item => item !== valueToRemove));
  };

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayTags = selected.slice(0, maxDisplayTags);
  const hiddenCount = selected.length - maxDisplayTags;

  return (
    <div className={`${theme} theme-${color} relative`} ref={ref}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-card-foreground mb-2">
          {label}
          {selected.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({selected.length} selected)
            </span>
          )}
        </label>
      )}

      {/* Main Input Container */}
      <div className={`
        relative min-h-[42px] w-full px-3 py-2 border rounded-lg
        bg-background text-foreground
        ${error ? 'border-red-500' : 'border-input'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isOpen ? 'ring-2 ring-ring border-transparent' : 'hover:border-primary/50'}
        transition-all duration-200
      `}>
        <div 
          className="flex flex-wrap items-center gap-1 min-h-[26px]"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {/* Selected Tags */}
          {displayTags.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm border border-primary/20"
            >
              {getOptionLabel(value)}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(value);
                }}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                disabled={disabled}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}

          {/* Hidden count indicator */}
          {hiddenCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              +{hiddenCount} more
            </span>
          )}

          {/* Placeholder or Search Input */}
          {selected.length === 0 && !isOpen && (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}

          {isOpen && (
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
              autoFocus
            />
          )}
        </div>

        {/* Dropdown Arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg 
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Select All / Clear All */}
          <div className="p-2 border-b border-border bg-muted/30">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => onChange(options.map(opt => opt.value))}
                className="text-xs text-primary hover:text-primary/80 font-medium"
                disabled={selected.length === options.length}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground font-medium"
                disabled={selected.length === 0}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Options List */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    px-3 py-2 cursor-pointer flex items-center justify-between
                    hover:bg-accent hover:text-accent-foreground
                    ${isSelected ? 'bg-primary/10 text-primary' : 'text-card-foreground'}
                    transition-colors
                  `}
                >
                  <span className="flex-1">{option.label}</span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-muted-foreground text-sm text-center">
              {searchTerm ? `No options found for "${searchTerm}"` : 'No options available'}
            </div>
          )}

          {/* Footer with selection count */}
          {selected.length > 0 && (
            <div className="p-2 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                {selected.length} of {options.length} options selected
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
