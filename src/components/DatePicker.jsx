// =======================================================================
// FILE: src/components/DatePicker.jsx (ENHANCED STYLING)
// PURPOSE: Professional date picker with modern styling
// =======================================================================
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import 'react-day-picker/dist/style.css';

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
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, color } = useTheme();

  const handleSelect = (date) => {
    onChange?.(date);
    if (mode === "single") {
      setIsOpen(false);
    }
  };

  const formatDisplayValue = () => {
    if (!value) return '';
    
    if (mode === "single" && value instanceof Date) {
      return format(value, 'dd/MM/yyyy');
    }
    
    if (mode === "range" && value?.from) {
      if (value.to) {
        return `${format(value.from, 'dd/MM/yyyy')} - ${format(value.to, 'dd/MM/yyyy')}`;
      }
      return `${format(value.from, 'dd/MM/yyyy')} - ...`;
    }
    
    if (mode === "multiple" && Array.isArray(value) && value.length > 0) {
      return `${value.length} dates selected`;
    }
    
    return '';
  };

  const getDisabledDays = () => {
    const disabled = [...disabledDays];
    
    if (minDate) {
      disabled.push({ before: minDate });
    }
    
    if (maxDate) {
      disabled.push({ after: maxDate });
    }
    
    return disabled;
  };

  const displayValue = formatDisplayValue();

  return (
    <div className={`${theme} theme-${color} relative ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Enhanced Input Display */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 text-left border rounded-lg transition-all duration-200 flex items-center justify-between ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60 text-gray-400' 
              : error 
                ? 'border-red-300 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-red-500 focus:border-red-500 hover:border-red-400' 
                : isOpen
                  ? 'border-blue-500 bg-white dark:bg-gray-800 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:border-blue-500'
          }`}
        >
          <span className={`text-sm ${displayValue ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            {displayValue || placeholder}
          </span>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Enhanced Calendar Dropdown */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[320px]">
              {/* Custom Styled DayPicker */}
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
                  }
                  
                  .modern-calendar .rdp-nav_button:hover {
                    background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
                    color: ${theme === 'dark' ? '#f3f4f6' : '#1f2937'};
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
                  }
                  
                  .modern-calendar .rdp-button:hover:not(.rdp-button_disabled) {
                    background: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
                    transform: scale(1.05);
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
                  disabled={getDisabledDays()}
                  showWeekNumber={showWeekNumber}
                  weekStartsOn={weekStartsOn}
                  showOutsideDays
                  fixedWeeks
                  components={{
                    IconLeft: ({ ...props }) => (
                      <svg {...props} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    ),
                    IconRight: ({ ...props }) => (
                      <svg {...props} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    ),
                  }}
                />
              </div>
              
              {/* Enhanced Footer */}
              {showToday && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    type="button"
                    onClick={() => {
                      const today = new Date();
                      handleSelect(mode === "single" ? today : mode === "range" ? { from: today, to: today } : [today]);
                    }}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Select Today
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Enhanced Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </p>
      )}

      {/* Helper Text for Range Selection */}
      {displayValue && mode === "range" && value?.from && !value?.to && (
        <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Please select an end date
        </p>
      )}
    </div>
  );
};

export default DatePicker;
