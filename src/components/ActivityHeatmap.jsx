// =======================================================================
// FILE: src/components/ActivityHeatmap.jsx
// PURPOSE: GitHub-style activity heatmap with year navigation
// SOC 2: Data visualization with privacy controls, accessible UI
// =======================================================================

import React, { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// ✅ UPDATED: Import from centralized Icons file
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

/**
 * ActivityHeatmap Component
 * Displays a GitHub-style contribution heatmap
 * 
 * @param {Array} activityData - Array of { date, level, count } objects
 * @param {string|Date} testerJoinDate - User's join date (for year range)
 * @param {string} title - Heatmap title (default: "Activity Overview")
 * @param {Function} onDateClick - Callback when a date cell is clicked
 * 
 * @example
 * <ActivityHeatmap 
 *   activityData={[{ date: '2025-01-01', level: 3, count: 5 }]}
 *   testerJoinDate="2023-06-15"
 *   onDateClick={(date, count) => console.log(date, count)}
 * />
 */
const ActivityHeatmap = ({ 
  activityData = [], 
  testerJoinDate,
  title = "Activity Overview",
  onDateClick = null
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { theme } = useTheme();

  // ✅ SOC 2: Validate and sanitize activity data
  const sanitizedActivityData = useMemo(() => {
    if (!Array.isArray(activityData)) {
      console.warn('ActivityHeatmap: activityData must be an array');
      return [];
    }
    
    return activityData.filter(item => {
      // Validate data structure
      if (!item || typeof item !== 'object') return false;
      if (!item.date) return false;
      
      // Validate date format
      const date = new Date(item.date);
      if (isNaN(date.getTime())) return false;
      
      return true;
    });
  }, [activityData]);

  /**
   * Calculate available years based on tester join date
   * ✅ SOC 2: Input validation for date ranges
   */
  const getAvailableYears = () => {
    let joinYear = new Date().getFullYear();
    
    if (testerJoinDate) {
      const parsedDate = new Date(testerJoinDate);
      if (!isNaN(parsedDate.getTime())) {
        joinYear = parsedDate.getFullYear();
      }
    }
    
    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Limit to reasonable range (prevent DOS from excessive years)
    const maxYears = 10;
    const startYear = Math.max(joinYear, currentYear - maxYears);
    
    for (let year = currentYear; year >= startYear; year--) {
      years.push(year);
    }
    
    return years;
  };

  const availableYears = useMemo(() => getAvailableYears(), [testerJoinDate]);

  /**
   * Generate calendar data for selected year
   * ✅ Performance: Memoized to prevent recalculation
   */
  const generateYearData = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const days = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      const activity = sanitizedActivityData.find(
        a => new Date(a.date).toISOString().split('T')[0] === dateStr
      );

      days.push({
        date: new Date(date),
        level: activity?.level || 0,
        count: activity?.count || 0
      });
    }

    return days;
  }, [selectedYear, sanitizedActivityData]);

  /**
   * Group days into weeks for grid layout
   */
  const groupIntoWeeks = (days) => {
    const weeks = [];
    let week = [];
    const firstDay = days[0]?.date;

    if (firstDay) {
      const startDay = firstDay.getDay();
      for (let i = 0; i < startDay; i++) {
        week.push(null);
      }
    }

    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    if (week.length > 0) {
      weeks.push(week);
    }

    return weeks;
  };

  const weeks = useMemo(() => groupIntoWeeks(generateYearData), [generateYearData]);

  /**
   * Get color class based on activity level
   * ✅ Theme-aware colors
   */
  const getColor = (level) => {
    const isDark = theme === 'dark';
    
    switch(level) {
      case 0:
        return isDark 
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600' 
          : 'bg-slate-100 border-slate-200 hover:border-slate-300';
      case 1:
        return isDark
          ? 'bg-green-900/80 border-green-800 hover:border-green-700'
          : 'bg-green-200 border-green-300 hover:border-green-400';
      case 2:
        return isDark
          ? 'bg-green-700 border-green-600 hover:border-green-500'
          : 'bg-green-400 border-green-500 hover:border-green-600';
      case 3:
        return isDark
          ? 'bg-green-600 border-green-500 hover:border-green-400'
          : 'bg-green-500 border-green-600 hover:border-green-700';
      case 4:
        return isDark
          ? 'bg-green-500 border-green-400 hover:border-green-300'
          : 'bg-green-600 border-green-700 hover:border-green-800';
      default:
        return isDark
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
          : 'bg-slate-100 border-slate-200 hover:border-slate-300';
    }
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Calculate stats for the year
  const totalContributions = generateYearData.reduce((sum, day) => sum + day.count, 0);
  const activeDaysCount = generateYearData.filter(day => day.level > 0).length;

  /**
   * Handle date cell click
   * ✅ SOC 2: Callback for audit logging
   */
  const handleDateClick = (day) => {
    if (day && onDateClick) {
      onDateClick(day.date, day.count, day.level);
    }
  };

  /**
   * Handle year navigation
   * ✅ Accessibility: Keyboard support
   */
  const handleYearChange = (direction) => {
    const currentIndex = availableYears.indexOf(selectedYear);
    if (direction === 'up' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full bg-card rounded-lg shadow-md border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-primary">{totalContributions}</span> contributions in {selectedYear}
            <span className="mx-2">•</span>
            <span className="font-medium text-green-600 dark:text-green-400">{activeDaysCount}</span> active days
          </p>
        </div>

        {/* Year Selector - ✅ Accessibility: ARIA labels and keyboard support */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleYearChange('up')}
            disabled={availableYears.indexOf(selectedYear) === 0}
            className="p-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Next year"
          >
            <ChevronUpIcon className="w-4 h-4" aria-hidden="true" />
          </button>
          
          <span className="text-sm font-medium text-card-foreground min-w-[4rem] text-center">
            {selectedYear}
          </span>
          
          <button
            onClick={() => handleYearChange('down')}
            disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
            className="p-2 rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Previous year"
          >
            <ChevronDownIcon className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Heatmap Grid - ✅ Accessibility: Semantic structure */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex mb-2">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-start gap-1">
              {monthLabels.map((month, idx) => {
                const weeksInMonth = weeks.filter(week => {
                  const firstDayOfWeek = week.find(d => d !== null);
                  return firstDayOfWeek && firstDayOfWeek.date.getMonth() === idx;
                }).length;
                
                return (
                  <div
                    key={month}
                    className="text-xs text-muted-foreground"
                    style={{ width: `${weeksInMonth * 14}px`, minWidth: '24px' }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
              {dayLabels.map((day, idx) => (
                <div key={idx} className="h-3 flex items-center" style={{ minHeight: '12px' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks Grid - ✅ Accessibility: Role and ARIA labels */}
            <div className="flex gap-1" role="grid" aria-label={`Activity calendar for ${selectedYear}`}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1" role="row">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      role="gridcell"
                      aria-label={
                        day 
                          ? `${day.date.toLocaleDateString()}: ${day.count} ${day.count === 1 ? 'contribution' : 'contributions'}`
                          : 'No data'
                      }
                      className={`
                        w-3 h-3 rounded-sm border transition-all
                        ${day ? getColor(day.level) : 'bg-transparent border-transparent'}
                        ${day && onDateClick ? 'cursor-pointer' : ''}
                      `}
                      onMouseEnter={() => day && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => handleDateClick(day)}
                      tabIndex={day ? 0 : -1}
                      onKeyDown={(e) => {
                        if (day && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleDateClick(day);
                        }
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Tooltip - ✅ Accessibility: ARIA live region */}
          {hoveredDay && (
            <div 
              className="mt-4 p-3 bg-accent rounded-lg border border-border text-sm"
              role="status"
              aria-live="polite"
            >
              <div className="font-medium text-accent-foreground">
                {hoveredDay.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-muted-foreground mt-1">
                <span className="font-semibold text-primary">{hoveredDay.count}</span>{' '}
                {hoveredDay.count === 1 ? 'contribution' : 'contributions'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend - ✅ Accessibility: Descriptive labels */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
        <span className="text-xs text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded-sm border ${getColor(level)}`}
            role="img"
            aria-label={`Activity level ${level}`}
          />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
