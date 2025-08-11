// =======================================================================
// FILE: src/components/Spinner.jsx (UPDATED)
// PURPOSE: A reusable, theme-aware loading spinner component.
// =======================================================================
import { useTheme } from '../contexts/ThemeContext';

const Spinner = ({ 
  fullPage = false, 
  size = 'md', 
  message = null,
  overlay = true 
}) => {
  const { theme, color } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const wrapperClasses = fullPage 
    ? `fixed inset-0 flex flex-col items-center justify-center z-50 ${
        overlay ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'
      }` 
    : 'flex flex-col items-center justify-center p-4';

  return (
    <div className={`${theme} theme-${color} ${wrapperClasses}`}>
      {/* Spinner */}
      <div className="relative">
        {/* Main spinner */}
        <div 
          className={`
            ${sizeClasses[size]} 
            border-muted-foreground/20 
            border-t-primary 
            rounded-full 
            animate-spin
          `}
        />
        
        {/* Inner glow effect */}
        <div 
          className={`
            absolute inset-0
            ${sizeClasses[size]} 
            border-transparent 
            border-t-primary/30 
            rounded-full 
            animate-spin
            blur-sm
          `}
        />
      </div>

      {/* Loading message */}
      {message && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            {message}
          </p>
        </div>
      )}

      {/* Pulsing dots for additional visual interest */}
      {fullPage && !message && (
        <div className="mt-6 flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-75" />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
        </div>
      )}
    </div>
  );
};

// Loading skeleton component for more advanced loading states
export const LoadingSkeleton = ({ lines = 3, className = "" }) => {
  const { theme, color } = useTheme();
  
  return (
    <div className={`${theme} theme-${color} animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            h-4 bg-muted rounded 
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
            ${index !== 0 ? 'mt-2' : ''}
          `}
        />
      ))}
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton = () => {
  const { theme, color } = useTheme();
  
  return (
    <div className={`${theme} theme-${color} bg-card rounded-lg border border-border p-6 animate-pulse`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-muted rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  );
};

// Table loading skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  const { theme, color } = useTheme();
  
  return (
    <div className={`${theme} theme-${color} bg-card rounded-lg border border-border overflow-hidden`}>
      {/* Header */}
      <div className="bg-muted/50 p-4 border-b border-border">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-4 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4 border-b border-border last:border-b-0">
          <div className="grid gap-4 animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Button loading state
export const ButtonSpinner = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-2'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        border-current 
        border-t-transparent 
        rounded-full 
        animate-spin
      `}
    />
  );
};

export default Spinner;
