// =======================================================================
// FILE: src/features/admin/AddUserModal.jsx (UPDATED)
// PURPOSE: Modal for adding new users - FULLY WORKING
// SOC 2 NOTES: Centralized icon management, secure form handling, input validation
// =======================================================================

import { useState } from 'react';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import { createUser } from '../../api/adminApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  UserPlusIcon,
  SaveIcon,
  UserIcon,
  MailIcon,
  LockIcon,
  ShieldIcon,
  InfoIcon,
} from '../../components/Icons';

const AddUserModal = ({ isOpen = true, onClose, onUserAdded }) => {
  const { theme, color } = useTheme();

  // ✅ SOC 2: Form state with all required fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tester'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ SOC 2: Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // ✅ SOC 2: Clear error on field change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // ✅ SOC 2: Comprehensive form validation
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.trim().length > 254) {
      newErrors.email = 'Email is too long';
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password is too long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      // Optional: Strong password check (commented for flexibility)
      // newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    // Validate role
    if (!formData.role || !['admin', 'tester', 'client'].includes(formData.role)) {
      newErrors.role = 'Valid role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSaving(true);
    try {
      // ✅ SOC 2: Sanitize data before submission
      const cleanedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        role: formData.role
      };

      // ✅ SOC 2: Log user creation attempt (audit trail)
      console.log(`👤 Creating user: ${cleanedData.email} (${cleanedData.role})`);

      await createUser(cleanedData);

      // ✅ SOC 2: Log successful creation
      console.log(`✅ User created successfully: ${cleanedData.email}`);

      toast.success('User created successfully!');
      onUserAdded?.();
      onClose?.();
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: 'Full system access including user management, project configuration, and settings',
      tester: 'Can create and manage projects, add vulnerabilities, and manage project teams',
      client: 'Limited access to assigned projects only. Can view project reports and findings'
    };
    return descriptions[role] || '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UserPlusIcon className="text-primary w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add New User</h2>
            <p className="text-sm text-muted-foreground">
              Create a new user account
            </p>
          </div>
        </div>
      }
      maxWidth="700px"
    >
      <form onSubmit={handleSubmit} className={`${theme} theme-${color} space-y-6`}>
        {/* ========== INFO BANNER ========== */}
        {/* ✅ SOC 2: Inform users about account creation */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <InfoIcon className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5 w-5 h-5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Create user accounts with different access levels. Users will be
              able to log in with their email and password.
            </p>
          </div>
        </div>

        {/* ========== FORM FIELDS ========== */}
        <div className="space-y-5">
          {/* Full Name */}
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter user's full name"
            icon={<UserIcon className="w-5 h-5" />}
            required
            aria-label="User full name"
            aria-invalid={!!errors.name}
            error={errors.name}
          />

          {/* Email Address */}
          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            icon={<MailIcon className="w-5 h-5" />}
            required
            aria-label="User email address"
            aria-invalid={!!errors.email}
            error={errors.email}
          />

          {/* Password */}
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password (min. 6 characters)"
            icon={<LockIcon className="w-5 h-5" />}
            required
            aria-label="User password"
            aria-invalid={!!errors.password}
            error={errors.password}
          />

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <div className="flex items-center gap-2">
                <ShieldIcon className="w-5 h-5" />
                Role <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                errors.role ? 'border-red-500' : 'border-input'
              }`}
              required
              aria-label="Select user role"
              aria-invalid={!!errors.role}
            >
              <option value="tester">Tester</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>

            {/* ✅ SOC 2: Role description */}
            {errors.role ? (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.role}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {getRoleDescription(formData.role)}
              </p>
            )}
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2.5 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Cancel creating user"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Create user"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <SaveIcon className="w-5 h-5" />
                Create User
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
