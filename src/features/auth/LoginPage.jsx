// =======================================================================
// FILE: src/features/auth/LoginPage.jsx (UPDATED)
// PURPOSE: Professional login page with comprehensive information and modern UI
// SOC 2 NOTES: Centralized icon management, secure authentication, audit logging
// =======================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldIcon,
  SunIcon,
  MoonIcon,
  CheckIcon,
  AlertTriangleIcon,
  UsersIcon,
} from '../../components/Icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const { login } = useAuth();
  const { theme, color, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  // ✅ SOC 2: Secure login with audit logging
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // ✅ SOC 2: Log login attempt (audit trail)
      console.log(`🔐 Login attempt for email: ${email.split('@')[0]}@***`);

      const { role } = await login(email, password);

      // ✅ SOC 2: Log successful authentication
      console.log(`✅ Authentication successful for role: ${role}`);

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      // Navigate based on role
      if (role === 'admin' || role === 'tester') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      // ✅ SOC 2: Log authentication failure (don't expose detailed error)
      console.error('❌ Authentication failed');
      toast.error('Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SOC 2: Demo credentials handler with logging
  const useDemoCredentials = (type) => {
    console.log(`ℹ️ Using demo credentials for: ${type}`);

    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('password');
    } else if (type === 'tester') {
      setEmail('tester@example.com');
      setPassword('password');
    }
  };

  const features = [
    {
      icon: ShieldIcon,
      text: 'Enterprise-grade security with 256-bit encryption'
    },
    {
      icon: CheckIcon,
      text: 'Real-time vulnerability detection & reporting'
    },
    {
      icon: UsersIcon,
      text: 'Multi-role access control and team collaboration'
    },
    {
      icon: LockIcon,
      text: 'Comprehensive penetration testing toolkit'
    }
  ];

  return (
    <div
      className={`${theme} theme-${color} min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.4'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* ========== THEME TOGGLE ========== */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <MoonIcon className="text-slate-600 group-hover:text-slate-900 transition-colors w-5 h-5" />
        ) : (
          <SunIcon className="text-slate-400 group-hover:text-slate-100 transition-colors w-5 h-5" />
        )}
      </button>

      {/* ========== LEFT PANEL - INFORMATION SECTION ========== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <div className="flex flex-col justify-center px-12 xl:px-20 py-12 w-full relative z-10">
          {/* Brand Header */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <ShieldIcon className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PenTest Pro
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Enterprise Security Platform
                </p>
              </div>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 leading-tight">
              Secure Your Digital Assets with
              <span className="block text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">
                Professional Penetration Testing
              </span>
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Advanced vulnerability assessment and penetration testing platform
              trusted by security professionals worldwide. Identify, assess, and
              remediate security vulnerabilities before attackers do.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-12">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              Why Choose PenTest Pro?
            </h3>
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex-shrink-0">
                  <feature.icon className="text-white w-5 h-5" />
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>

          {/* ✅ SOC 2 BETA VERSION NOTICE - Replaces Info Message */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangleIcon className="text-amber-600 dark:text-amber-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  🚀 Beta Version Notice
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  This is a beta version of PenTest Pro. Features and functionality may
                  change. Please report any issues or feedback to the development team.
                  Data security and user privacy are our top priorities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== RIGHT PANEL - LOGIN FORM ========== */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <ShieldIcon className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PenTest Pro
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Enterprise Security Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8">
            {/* Welcome Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Welcome Back!
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to access your security dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MailIcon className="text-slate-400 w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200 disabled:opacity-50"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                    aria-label="Email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockIcon className="text-slate-400 w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200 disabled:opacity-50"
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    disabled={isLoading}
                    aria-label="Remember me"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
                  disabled={isLoading}
                  aria-label="Forgot password"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                aria-label="Sign in"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Credentials Section */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                aria-label="Toggle demo credentials"
              >
                <AlertTriangleIcon className="w-5 h-5" />
                <span>
                  {showDemoCredentials ? 'Hide' : 'Show'} Demo Credentials
                </span>
              </button>

              {showDemoCredentials && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
                    Demo Accounts Available:
                  </h4>
                  <div className="space-y-3">
                    {/* Admin Demo */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          Admin Account
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          admin@example.com / password
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => useDemoCredentials('admin')}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        aria-label="Use admin demo credentials"
                      >
                        Use
                      </button>
                    </div>

                    {/* Tester Demo */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          Tester Account
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          tester@example.com / password
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => useDemoCredentials('tester')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
                        aria-label="Use tester demo credentials"
                      >
                        Use
                      </button>
                    </div>
                  </div>

                  {/* ✅ SOC 2 BETA WARNING */}
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      <strong>Beta Notice:</strong> These are demo accounts for testing
                      purposes only. In production, use your actual credentials provided by
                      your administrator. This platform is currently in beta and not
                      finalized.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium transition-colors"
                aria-label="Contact admin for account"
              >
                Contact Admin
              </button>
            </p>

            <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
              <p>© {currentYear} PenTest Pro. All rights reserved.</p>
              <p>Beta Version - Not Finalized | Protected by security protocols</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
