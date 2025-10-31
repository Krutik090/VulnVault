// =======================================================================
// FILE: AddEditClientModal.jsx (COMPLETE - ALL ISSUES FIXED)
// PURPOSE: Modal with password display that handles all response formats
// =======================================================================

import { useState, useEffect } from 'react';
import { addClient, updateClient } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

const AddEditClientModal = ({ isOpen, onClose, client, isEditMode, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  // State for showing temporary password after creation
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    website: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode && client) {
      setFormData({
        clientName: client.clientName || '',
        contactPerson: client.contactPerson || '',
        contactEmail: client.contactEmail || '',
        contactPhone: client.contactPhone || '',
        address: client.address || '',
        website: client.website || ''
      });
    } else {
      setFormData({
        clientName: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        website: ''
      });
    }
    setErrors({});
  }, [client, isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      toast.success('Password copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy password');
    }
  };

  // ✅ FIXED: Extract user data from various possible response formats
  const extractUserData = (response) => {
    // Try different possible response structures
    const possibilities = [
      response?.user,                    // { user: { ... } }
      response?.data?.user,              // { data: { user: { ... } } }
      response?.client?.user,            // { client: { user: { ... } } }
      response?.result?.user,            // { result: { user: { ... } } }
    ];

    for (const userData of possibilities) {
      if (userData?.temporaryPassword && userData?.email) {
        return userData;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        await updateClient(client._id, formData);
        toast.success('Client updated successfully!');
        onSuccess();
        onClose();
      } else {
        // Create new client
        const response = await addClient(formData);

        // ✅ DEBUG LOG (remove after testing)
        console.log('🔍 Client Creation Response:', response);

        // ✅ FIXED: Use flexible extraction
        const userData = extractUserData(response);

        if (userData?.temporaryPassword) {
          console.log('✅ Password found! Showing dialog...');
          setTemporaryPassword(userData.temporaryPassword);
          setClientEmail(userData.email);
          setShowPasswordDialog(true);
          toast.success('Client created successfully!');
        } else {
          console.log('ℹ️ No temporary password in response');
          toast.success('Client created successfully!');
          onSuccess();
          onClose();
        }
      }
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    setTemporaryPassword('');
    setClientEmail('');
    setPasswordVisible(false);
    setCopied(false);
    onSuccess();
    onClose();
  };

  // Password Display Dialog Component
  const PasswordDialog = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-background border-2 border-primary rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
          <h3 className="text-xl font-bold text-primary-foreground">
            🎉 Client Created Successfully!
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Success Message */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">
              A new client account has been created. Please save the temporary password below.
            </p>
          </div>

          {/* Email Display */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Login Email
            </label>
            <div className="bg-accent/50 border border-border rounded-lg px-4 py-3">
              <p className="text-foreground font-medium">{clientEmail}</p>
            </div>
          </div>

          {/* Password Display */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Temporary Password
            </label>
            <div className="relative">
              <div className="bg-accent/50 border-2 border-primary rounded-lg px-4 py-3 pr-24 flex items-center">
                <p className="text-foreground font-mono font-bold text-lg flex-1 select-all">
                  {passwordVisible ? temporaryPassword : '••••••••••••'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title={passwordVisible ? 'Hide password' : 'Show password'}
                >
                  {passwordVisible ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title="Copy password"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Important: Save This Password!
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• This password will NOT be shown again</li>
                  <li>• Client must change this password on first login</li>
                  <li>• Copy and securely share with the client</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-accent/30 border-t border-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyPassword}
            className="px-5 py-2.5 bg-accent hover:bg-accent/80 text-foreground rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Password</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePasswordDialogClose}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            I've Saved It
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={isEditMode ? 'Edit Client' : 'Add New Client'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className={`${theme} space-y-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Client Name */}
            <div className="md:col-span-2">
              <FormInput
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Enter client name"
                required
                error={errors.clientName}
              />
            </div>

            {/* Contact Person */}
            <FormInput
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Enter contact person name"
              required
              error={errors.contactPerson}
            />

            {/* Contact Email */}
            <FormInput
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="contact@example.com"
              required
              error={errors.contactEmail}
            />

            {/* Contact Phone */}
            <FormInput
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />

            {/* Website */}
            <FormInput
              label="Website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                placeholder="Enter full address..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 border border-input text-foreground bg-background hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Client' : 'Create Client'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Display Dialog */}
      {showPasswordDialog && <PasswordDialog />}
    </>
  );
};

export default AddEditClientModal;