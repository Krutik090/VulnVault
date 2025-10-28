// =======================================================================
// FILE: src/features/clients/AddEditClientModal.jsx (NEW)
// PURPOSE: Modal for adding and editing clients
// =======================================================================

import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { addClient } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

// Icons
const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AddEditClientModal = ({ isOpen, onClose, onSave, client = null }) => {
  const { theme, color } = useTheme();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    location: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData({
        clientName: client.clientName || '',
        email: client.email || '',
        location: client.location || '',
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    } else if (formData.clientName.length < 2) {
      newErrors.clientName = 'Client name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setSaving(true);
    try {
      if (client) {
        await updateClient(client._id, formData);
        toast.success('Client updated successfully!');
      } else {
        await addClient(formData);
        toast.success('Client added successfully!');
      }
      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.message || 'Failed to save client');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Edit Client' : 'Add New Client'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-5">
          
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Client Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingIcon className="text-muted-foreground" />
              </div>
              <input
                type="text"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Enter client or organization name"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.clientName ? 'border-red-500' : 'border-input'
                }`}
                disabled={saving}
              />
            </div>
            {errors.clientName && (
              <p className="mt-2 text-sm text-red-600">{errors.clientName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="text-muted-foreground" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="client@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.email ? 'border-red-500' : 'border-input'
                }`}
                disabled={saving}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Location <span className="text-muted-foreground text-xs">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LocationIcon className="text-muted-foreground" />
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                disabled={saving}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Enter the client's primary location or headquarters
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 border border-input rounded-lg hover:bg-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon />
                {client ? 'Update Client' : 'Add Client'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditClientModal;
