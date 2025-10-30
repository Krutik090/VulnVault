// =======================================================================
// FILE: src/components/ActivityHeatmap.jsx (SPACING FIXED)
// PURPOSE: GitHub-style heatmap with proper compact spacing
// =======================================================================

import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const ActivityHeatmap = ({ activityData = [], testerJoinDate }) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate available years based on tester join date
  const getAvailableYears = () => {
    const joinYear = testerJoinDate ? new Date(testerJoinDate).getFullYear() : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear; year >= joinYear; year--) {
      years.push(year);
    }
    
    return years;
  };

  const availableYears = useMemo(() => getAvailableYears(), [testerJoinDate]);

  // Generate data for selected year
  const generateYearData = () => {
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const days = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = new Date(date).toISOString().split('T')[0];
      const activity = activityData.find(a => 
        new Date(a.date).toISOString().split('T')[0] === dateStr
      );

      days.push({
        date: new Date(date),
        level: activity?.level || 0,
        count: activity?.count || 0
      });
    }

    return days;
  };

  // Group days into weeks
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

  const yearData = generateYearData();
  const weeks = groupIntoWeeks(yearData);

  const getColor = (level) => {
    if (level === 0) return 'bg-slate-700 dark:bg-slate-600 border border-slate-600 dark:border-slate-500';
    if (level === 1) return 'bg-green-300 dark:bg-green-900 border border-green-400';
    if (level === 2) return 'bg-green-400 dark:bg-green-700 border border-green-500';
    if (level === 3) return 'bg-green-500 dark:bg-green-600 border border-green-600';
    if (level === 4) return 'bg-green-600 dark:bg-green-500 border border-green-700';
    return 'bg-slate-700 dark:bg-slate-600 border border-slate-600 dark:border-slate-500';
  };

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Calculate stats for the year
  const totalContributions = yearData.reduce((sum, day) => sum + day.count, 0);
  const activeDaysCount = yearData.filter(day => day.level > 0).length;

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        {/* Main heatmap section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-base font-semibold">{totalContributions} contributions in {selectedYear}</h3>
            <p className="text-xs text-muted-foreground">{activeDaysCount} active days</p>
          </div>

          {/* Heatmap */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-block bg-card border rounded-lg p-3">
              {/* Month labels */}
              <div className="flex mb-2 pl-8 text-xs">
                {monthLabels.map((month, index) => (
                  <div 
                    key={index} 
                    className="text-xs text-muted-foreground font-medium text-center" 
                    style={{ width: '48px' }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {/* Day labels */}
                <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground font-medium">
                  {dayLabels.map((day, index) => (
                    <div key={index} className="h-3 flex items-center">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Weeks grid */}
                <div className="flex gap-0.5">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-0.5">
                      {week.map((day, dayIndex) => (
                        <div
                          key={dayIndex}
                          className={`
                            w-3 h-3 rounded-sm cursor-pointer transition-all
                            ${day ? getColor(day.level) : 'bg-transparent'}
                            ${day && 'hover:ring-2 hover:ring-offset-1 hover:ring-primary hover:scale-125'}
                          `}
                          onMouseEnter={() => day && setHoveredDay(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          title={day ? `${day.date.toDateString()}: ${day.count} vulnerabilities` : ''}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <span className="text-xs">Less</span>
                <div className="flex gap-0.5">
                  <div className="w-3 h-3 rounded-sm bg-slate-700 dark:bg-slate-600 border border-slate-600" />
                  <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-900 border border-green-400" />
                  <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700 border border-green-500" />
                  <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600 border border-green-600" />
                  <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500 border border-green-700" />
                </div>
                <span className="text-xs">More</span>
              </div>
            </div>
          </div>

          {/* Hover tooltip */}
          {hoveredDay && (
            <div className="mt-2 p-2 bg-card border rounded text-xs font-medium">
              <p>{hoveredDay.date.toDateString()}</p>
              <p className="text-muted-foreground text-xs">
                {hoveredDay.count} {hoveredDay.count === 1 ? 'vulnerability' : 'vulnerabilities'}
              </p>
            </div>
          )}
        </div>

        {/* Year selector sidebar - COMPACT */}
        <div className="w-20 flex flex-col gap-1">
          {/* Navigation buttons */}
          <button
            onClick={() => selectedYear < availableYears[0] && setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= availableYears[0]}
            className="w-full p-2 rounded border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next year"
          >
            <ChevronUp className="w-4 h-4 mx-auto" />
          </button>
          
          {/* Year list - SCROLLABLE */}
          <div className="bg-card border rounded p-1 space-y-0.5 max-h-56 overflow-y-auto">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`
                  w-full px-2 py-1 rounded text-xs font-medium text-center transition-colors
                  ${selectedYear === year
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-muted text-foreground'
                  }
                `}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Down button */}
          <button
            onClick={() => selectedYear > availableYears[availableYears.length - 1] && setSelectedYear(selectedYear - 1)}
            disabled={selectedYear <= availableYears[availableYears.length - 1]}
            className="w-full p-2 rounded border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous year"
          >
            <ChevronDown className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
