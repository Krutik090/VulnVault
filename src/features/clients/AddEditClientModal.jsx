// =======================================================================
// FILE: src/components/AddEditClientModal.jsx (COMPLETE)
// PURPOSE: Modal for adding/editing clients
// =======================================================================

import { useState, useEffect } from 'react';
import { addClient, updateClient } from '../../api/clientApi';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../../components/Modal';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';

const AddEditClientModal = ({ isOpen, onClose, client, isEditMode, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
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
    // Clear error for this field
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
      } else {
        await addClient(formData);
        toast.success('Client created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default AddEditClientModal;
