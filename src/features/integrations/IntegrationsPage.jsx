// =======================================================================
// FILE: src/features/integrations/IntegrationsPage.jsx
// PURPOSE: Advanced Integrations UI with Nessus Sync Workflow
// SOC 2: Audit logging, RBAC, and Secure Data Handling
// =======================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LinkIcon,
  ShieldCheckIcon,
  DatabaseIcon,
  UsersIcon,
  ProjectsIcon,
  SearchIcon,
  LayoutGridIcon,
  ListIcon,
} from '../../components/Icons';
import toast from 'react-hot-toast';

// ✅ Correct Imports
import { API_URL, DEFAULT_FETCH_OPTIONS, validateResponse } from '../../api/config';
import { getAllClients, getClientProjects } from '../../api/clientApi';

const IntegrationsPage = () => {
  const { user } = useAuth();
  
  // 1. UI State Definitions
  const [viewMode, setViewMode] = useState('grid');
  
  // ✅ PERSISTENCE: Initialize state from localStorage
  const [isNessusConnected, setIsNessusConnected] = useState(() => {
    return localStorage.getItem('nessusConnected') === 'true';
  });
  
  const [loading, setLoading] = useState(false);

  // 2. Data State Definitions
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [nessusScans, setNessusScans] = useState([]);

  // 3. Selection State Definitions
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedScan, setSelectedScan] = useState('');

  // --- Effects ---

  // Log access for SOC 2
  useEffect(() => {
    console.log('✅ Audit: Integrations UI Accessed', {
      userId: user?._id,
      timestamp: new Date().toISOString()
    });
  }, [user?._id]);

  // ✅ PERSISTENCE: Auto-fetch scans if already connected on mount
  useEffect(() => {
    if (isNessusConnected) {
      fetchNessusScans();
    }
  }, []); // Run once on mount

  // Fetch Clients on Load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getAllClients();
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Client fetch error:", err);
        toast.error("Failed to load clients");
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  // Fetch Projects when Client Changes
  useEffect(() => {
    if (selectedClient) {
      const fetchProjects = async () => {
        try {
          const data = await getClientProjects(selectedClient);
          setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Project fetch error:", err);
          toast.error("Failed to load projects");
          setProjects([]);
        }
      };
      fetchProjects();
    } else {
      setProjects([]);
      setSelectedProject('');
    }
  }, [selectedClient]);

  // --- Handlers ---

  const fetchNessusScans = async () => {
    try {
      const response = await fetch(`${API_URL}/integrations/nessus/scans`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'GET'
      });
      
      const data = await validateResponse(response, 'Fetch Scans');
      const scanList = Array.isArray(data) ? data : (data.data || []);
      setNessusScans(scanList);
    } catch (error) {
      console.error(error);
      // Don't toast on auto-fetch to avoid spamming user on reload
      // toast.error("Connected, but failed to load scan list.");
      setNessusScans([]);
    }
  };

  const handleNessusConnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/integrations/nessus/connect`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'GET'
      });

      const data = await validateResponse(response, 'Nessus Connect');

      if (data.status === 'ok') {
        setIsNessusConnected(true);
        // ✅ Save to localStorage
        localStorage.setItem('nessusConnected', 'true');
        toast.success('Successfully linked to Nessus instance');
        fetchNessusScans();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Nessus Connection Failed');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle Disconnect
  const handleDisconnect = () => {
    setIsNessusConnected(false);
    localStorage.removeItem('nessusConnected');
    setNessusScans([]);
    setSelectedScan('');
    toast.success('Disconnected from Nessus');
  };

  const handleSync = () => {
    if (!selectedProject || !selectedScan) {
      toast.error('Please select a project and a scan to sync');
      return;
    }
    toast.loading(`Syncing Scan ID: ${selectedScan} to Project ID: ${selectedProject}...`);
  };

  // --- Render Components ---

  const NessusModule = ({ isListMode = false }) => (
    <div className={`bg-card border border-border rounded-xl shadow-sm transition-all overflow-hidden ${isListMode ? 'w-full' : 'p-6 border-l-4 border-l-primary'}`}>
      <div className={`flex flex-col ${isListMode ? '' : 'space-y-6'}`}>
        {/* Header Section */}
        <div className={`flex items-center justify-between p-6 ${isListMode ? 'bg-muted/30 border-b border-border' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-card rounded-lg shadow-sm">
              <ShieldCheckIcon className={`w-8 h-8 ${isNessusConnected ? 'text-green-500' : 'text-primary'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">Tenable Nessus</h3>
                {isNessusConnected && (
                   <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                     Connected
                   </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Professional Vulnerability Scanner</p>
            </div>
          </div>
          
          {/* ✅ UPDATED BUTTON: Connect vs Disconnect */}
          <button
            onClick={isNessusConnected ? handleDisconnect : handleNessusConnect}
            disabled={loading}
            className={`px-6 py-2 rounded-lg font-medium transition-all shadow-sm ${
              isNessusConnected 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50'
            }`}
          >
            {loading 
              ? 'Processing...' 
              : (isNessusConnected ? 'Disconnect' : 'Connect Nessus')
            }
          </button>
        </div>

        {/* Workflow Section */}
        {isNessusConnected && (
          <div className={`p-6 ${isListMode ? 'animate-slideDown' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* 1. Select Client */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <UsersIcon className="w-3 h-3" /> 1. Select Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose Client...</option>
                  {(clients || []).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Select Project */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <ProjectsIcon className="w-3 h-3" /> 2. Select Project
                </label>
                <select
                  value={selectedProject}
                  disabled={!selectedClient}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm disabled:opacity-50"
                >
                  <option value="">Choose Project...</option>
                  {(projects || []).map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Select Scan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
                  <SearchIcon className="w-3 h-3" /> 3. Select Scan
                </label>
                <select
                  value={selectedScan}
                  onChange={(e) => setSelectedScan(e.target.value)}
                  className="w-full p-2.5 bg-background border border-border rounded-lg text-sm"
                >
                  <option value="">Choose Scan...</option>
                  {(nessusScans || []).map(s => (
                    <option key={s.id || s.uuid} value={s.id || s.uuid}>
                      {s.name || `Scan #${s.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sync Action */}
              <div className="flex items-end">
                <button
                  onClick={handleSync}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <DatabaseIcon className="w-4 h-4" /> Sync Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-[100rem] mx-auto space-y-8">
      {/* Header & Mode Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage and automate external vulnerability scanning data.</p>
        </div>

        <div className="flex bg-muted p-1 rounded-xl border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            <LayoutGridIcon className="w-4 h-4" /> Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
          >
            <ListIcon className="w-4 h-4" /> List View
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-8' : 'flex flex-col gap-6'}>
        <NessusModule isListMode={viewMode === 'list'} />

        {/* Placeholders for future integrations */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
            <div className="bg-card border border-border rounded-xl p-6 border-l-4 border-l-muted">
              <div className="flex items-center gap-3 mb-3">
                <LinkIcon className="w-6 h-6 text-muted-foreground" />
                <h4 className="font-bold">Slack Webhooks</h4>
              </div>
              <p className="text-sm text-muted-foreground">Notification automation (Coming Soon)</p>
            </div>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="w-full bg-card border border-border rounded-xl p-4 opacity-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LinkIcon className="w-6 h-6 text-muted-foreground ml-2" />
              <span className="font-bold">Slack Webhooks</span>
            </div>
            <span className="text-xs font-mono uppercase bg-muted px-2 py-1 rounded">Development</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsPage;