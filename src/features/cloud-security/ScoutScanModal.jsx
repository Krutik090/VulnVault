// src/components/scout/ScoutScanModal.jsx
import { useState } from 'react';
import { 
  CloudIcon, 
  ServerIcon, 
  KeyIcon, 
  GlobeIcon,
  ShieldCheckIcon,
  DropletIcon // ✅ Imported New Icon
} from '../../components/Icons';

// Provider configurations
const PROVIDERS = [
  { id: 'aws', name: 'AWS', icon: <CloudIcon /> },
  { id: 'azure', name: 'Azure', icon: <ServerIcon /> },
  { id: 'gcp', name: 'GCP', icon: <GlobeIcon /> },
  { id: 'do', name: 'DigitalOcean', icon: <DropletIcon /> }, // ✅ Added DO
];

const ScoutScanModal = ({ isOpen, onClose, onScan }) => {
  const [selectedProvider, setSelectedProvider] = useState('aws');
  
  // Form State
  const [formData, setFormData] = useState({
    // AWS
    profile: '',
    regions: '',
    // Azure
    authType: 'cli',
    subscriptions: '',
    tenant: '',
    // GCP
    projectId: '',
    serviceAccount: '',
    // DigitalOcean (NEW)
    doToken: '',
    doAccessKey: '',
    doAccessSecret: '',
    // Common
    maxWorkers: 10,
    maxRate: '' // Added for API rate limiting
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const payload = {
      provider: selectedProvider,
      maxWorkers: formData.maxWorkers,
    };

    if (formData.maxRate) payload.maxRate = formData.maxRate;

    // AWS Logic
    if (selectedProvider === 'aws') {
      payload.profile = formData.profile || 'default';
      if (formData.regions) payload.regions = formData.regions;
    }
    // Azure Logic
    else if (selectedProvider === 'azure') {
      payload.authType = formData.authType;
      if (formData.subscriptions) payload.subscriptions = formData.subscriptions;
      if (formData.tenant) payload.tenant = formData.tenant;
    }
    // GCP Logic
    else if (selectedProvider === 'gcp') {
      if (formData.projectId) payload.projectId = formData.projectId;
      if (formData.serviceAccount) payload.serviceAccount = formData.serviceAccount;
      if (formData.authType === 'user') payload.userAccount = true;
    }
    // ✅ DigitalOcean Logic
    else if (selectedProvider === 'do') {
      if (!formData.doToken) {
        alert('DigitalOcean Token is required');
        return;
      }
      payload.token = formData.doToken;
      if (formData.doAccessKey) payload.accessKey = formData.doAccessKey;
      if (formData.doAccessSecret) payload.accessSecret = formData.doAccessSecret;
    }

    onScan(payload);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
              New Cloud Security Scan
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Configure your Scout Suite parameters</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-1/3 bg-muted/10 border-r border-border p-4 space-y-2 overflow-y-auto">
            <p className="text-xs font-bold text-muted-foreground uppercase mb-3 px-2">Cloud Provider</p>
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedProvider === p.id 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <div className={selectedProvider === p.id ? 'text-white' : 'text-muted-foreground'}>
                  {p.icon}
                </div>
                {p.name}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="w-2/3 p-6 overflow-y-auto bg-card">
            
            {/* AWS Configuration */}
            {selectedProvider === 'aws' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold border-b border-border pb-2">AWS Settings</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CLI Profile</label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input name="profile" value={formData.profile} onChange={handleChange} placeholder="default" className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Regions (Optional)</label>
                  <input name="regions" value={formData.regions} onChange={handleChange} placeholder="us-east-1, eu-west-1" className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" />
                </div>
              </div>
            )}

            {/* Azure Configuration */}
            {selectedProvider === 'azure' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Azure Settings</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Authentication Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setFormData({ ...formData, authType: 'cli' })} className={`px-3 py-2 rounded-md text-sm border ${formData.authType === 'cli' ? 'bg-primary/10 border-primary text-primary' : 'border-input'}`}>Azure CLI</button>
                    <button type="button" onClick={() => setFormData({ ...formData, authType: 'msi' })} className={`px-3 py-2 rounded-md text-sm border ${formData.authType === 'msi' ? 'bg-primary/10 border-primary text-primary' : 'border-input'}`}>Managed Identity</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subscription IDs</label>
                  <input name="subscriptions" value={formData.subscriptions} onChange={handleChange} placeholder="sub-id-1, sub-id-2" className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tenant ID</label>
                  <input name="tenant" value={formData.tenant} onChange={handleChange} placeholder="Optional" className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" />
                </div>
              </div>
            )}

            {/* GCP Configuration */}
            {selectedProvider === 'gcp' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold border-b border-border pb-2">GCP Settings</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project ID</label>
                  <input name="projectId" value={formData.projectId} onChange={handleChange} placeholder="my-gcp-project-id" className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Service Account Key Path</label>
                  <input name="serviceAccount" value={formData.serviceAccount} onChange={handleChange} placeholder="/path/to/key.json" className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" />
                </div>
              </div>
            )}

            {/* ✅ DigitalOcean Configuration */}
            {selectedProvider === 'do' && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-semibold border-b border-border pb-2">DigitalOcean Settings</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex gap-1">DO Token <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <KeyIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password"
                      name="doToken" 
                      value={formData.doToken} 
                      onChange={handleChange} 
                      placeholder="dop_v1_..." 
                      className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-primary" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Personal Access Token (Read/Write)</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Spaces Access Key (Optional)</label>
                  <input 
                    name="doAccessKey" 
                    value={formData.doAccessKey} 
                    onChange={handleChange} 
                    placeholder="DO Spaces Access Key" 
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Spaces Secret Key (Optional)</label>
                  <input 
                    type="password"
                    name="doAccessSecret" 
                    value={formData.doAccessSecret} 
                    onChange={handleChange} 
                    placeholder="DO Spaces Secret Key" 
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm" 
                  />
                </div>
              </div>
            )}

            {/* Common Options */}
            <div className="mt-8 pt-4 border-t border-border space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground uppercase">Performance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-foreground">Max Workers</label>
                  <input
                    type="number"
                    name="maxWorkers"
                    value={formData.maxWorkers}
                    onChange={handleChange}
                    min="1"
                    max="50"
                    className="w-full px-2 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-foreground">Max API Rate (Req/s)</label>
                  <input
                    type="number"
                    name="maxRate"
                    value={formData.maxRate}
                    onChange={handleChange}
                    placeholder="Default"
                    className="w-full px-2 py-2 bg-background border border-input rounded-md text-sm"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-muted/30 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <ShieldCheckIcon className="w-4 h-4" />
            Start Scan
          </button>
        </div>

      </div>
    </div>
  );
};

export default ScoutScanModal;