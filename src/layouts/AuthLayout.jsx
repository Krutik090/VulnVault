import { Outlet } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const AuthLayout = () => {
  const { theme, color } = useTheme();

  return (
    <div className={`${theme} theme-${color} min-h-screen flex items-center justify-center`}>
      {/* Added a subtle gradient background for a more professional feel */}
      <div className="min-h-screen w-full bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
