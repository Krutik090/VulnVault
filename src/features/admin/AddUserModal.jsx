// =======================================================================
// FILE: src/features/admin/AddUserModal.jsx (FIXED FOCUS LOSS ISSUE)
// PURPOSE: Modal for adding new users with enhanced layout and fixed input focus
// =======================================================================
import { useState, useCallback } from 'react';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput'; // ✅ Import existing FormInput
import { createUser } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const UserPlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckboxIcon = ({ checked }) => (
  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
    checked 
      ? 'bg-primary border-primary text-primary-foreground' 
      : 'border-input bg-background'
  }`}>
    {checked && (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )}
  </div>
);

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tester'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const { theme, color } = useTheme();

  const roleOptions = [
    { 
      value: 'tester', 
      label: 'Tester', 
      description: 'Can perform penetration tests and create reports',
      icon: ShieldIcon,
      color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    },
    { 
      value: 'admin', 
      label: 'Admin', 
      description: 'Full system access and user management',
      icon: UserIcon,
      color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    },
    { 
      value: 'pmo', 
      label: 'PMO', 
      description: 'Project management and oversight',
      icon: InfoIcon,
      color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    },
    { 
      value: 'client', 
      label: 'Client', 
      description: 'View-only access to assigned projects',
      icon: UserIcon,
      color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIXED: Memoized handlers to prevent re-creation
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    setErrors(prev => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setIsSaving(true);
    try {
      await createUser(formData);
      toast.success("User created successfully!");
      onUserAdded();
      
      // Reset form
      setFormData({ name: '', email: '', password: '', role: 'tester' });
      setErrors({});
      setActiveTab('basic');
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', password: '', role: 'tester' });
    setErrors({});
    setActiveTab('basic');
    onClose();
  };

  const getRoleBadgeColor = (role) => {
    const selectedRole = roleOptions.find(r => r.value === role);
    return selectedRole ? selectedRole.color : 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: UserIcon },
    { id: 'role', label: 'Role & Permissions', icon: ShieldIcon },
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl" showCloseButton={false}>
      <div className={`${theme} theme-${color} flex flex-col max-h-[90vh]`}>
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <UserPlusIcon className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Create New User
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new user account to the system
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50"
            disabled={isSaving}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-500 bg-white dark:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ✅ FIXED: Using imported FormInput component */}
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                    error={errors.name}
                    description="User's full name as it should appear in the system"
                  />

                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    required
                    error={errors.email}
                    description="This will be used for login and notifications"
                  />
                </div>

                {/* Password Field */}
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a secure password"
                  required
                  error={errors.password}
                  description="Password must be at least 8 characters with uppercase, lowercase, and numbers"
                />
              </div>
            )}

            {activeTab === 'role' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <ShieldIcon className="text-blue-600" />
                    Select User Role
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleOptions.map((role) => (
                      <div
                        key={role.value}
                        className={`relative rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                          formData.role === role.value
                            ? role.color + ' border-current shadow-lg'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${formData.role === role.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              <role.icon className={formData.role === role.value ? 'text-current' : 'text-gray-500'} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="role"
                                  value={role.value}
                                  checked={formData.role === role.value}
                                  onChange={handleChange}
                                  className="text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <h4 className={`font-semibold ${formData.role === role.value ? 'text-current' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {role.label}
                                </h4>
                              </div>
                              <p className={`text-sm mt-1 ${formData.role === role.value ? 'text-current opacity-90' : 'text-gray-600 dark:text-gray-400'}`}>
                                {role.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Summary */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Selected Role Summary
                  </h4>
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getRoleBadgeColor(formData.role)}`}>
                    {roleOptions.find(r => r.value === formData.role)?.icon && (
                      <span className="mr-2">
                        {roleOptions.find(r => r.value === formData.role).icon({ className: "w-4 h-4" })}
                      </span>
                    )}
                    {roleOptions.find(r => r.value === formData.role)?.label} - {roleOptions.find(r => r.value === formData.role)?.description}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Enhanced Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <SaveIcon />
                Create User
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddUserModal;
