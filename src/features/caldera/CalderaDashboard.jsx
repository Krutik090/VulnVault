// src/features/integrations/CalderaDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TerminalIcon, 
  UsersIcon, 
  PlayIcon, 
  ShieldIcon, 
  RefreshCwIcon,
  ActivityIcon,
  CheckCircleIcon
} from '../../components/Icons';
import toast from 'react-hot-toast';
import { API_URL, DEFAULT_FETCH_OPTIONS, validateResponse } from '../../api/config';

const CalderaDashboard = () => {
  // Data State
  const [agents, setAgents] = useState([]);
  const [adversaries, setAdversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Operation State
  const [isLaunching, setIsLaunching] = useState(false);
  const [lastOperation, setLastOperation] = useState(null);

  // Form State
  const [selectedAdversary, setSelectedAdversary] = useState('');
  const [opName, setOpName] = useState('');
  const [targetGroup, setTargetGroup] = useState('red'); // Default per backend service

  // Initial Data Fetch
  useEffect(() => {
    fetchCalderaData();
  }, []);

  const fetchCalderaData = async () => {
    setLoading(true);
    try {
      // Fetch Agents and Adversaries in parallel
      const [agentsRes, advRes] = await Promise.all([
        fetch(`${API_URL}/integrations/caldera/agents`, DEFAULT_FETCH_OPTIONS),
        fetch(`${API_URL}/integrations/caldera/adversaries`, DEFAULT_FETCH_OPTIONS)
      ]);
      
      const agentsData = await validateResponse(agentsRes, 'Fetch Agents');
      const advData = await validateResponse(advRes, 'Fetch Adversaries');

      setAgents(agentsData.data || []);
      setAdversaries(advData.data || []);
      
      if(agentsData.data) toast.success("Synced with CALDERA Engine");
    } catch (err) {
      console.error("Caldera Sync Error:", err);
      toast.error("Failed to sync with CALDERA server. Ensure backend is connected.");
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = async () => {
    // Input Validation (SOC 2 Processing Integrity)
    if (!selectedAdversary) return toast.error("Please select an adversary profile");
    if (!opName.trim()) return toast.error("Operation name is required");
    if (!targetGroup.trim()) return toast.error("Target group is required");
    
    setIsLaunching(true);
    setLastOperation(null);

    try {
      const payload = {
        name: opName,
        adversary_id: selectedAdversary,
        group: targetGroup // Pass the group to the backend
      };

      const res = await fetch(`${API_URL}/integrations/caldera/operations`, {
        ...DEFAULT_FETCH_OPTIONS,
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const responseData = await validateResponse(res, 'Start Operation');
      
      // Success Handling
      setLastOperation(responseData.data); // Store result to show ID
      toast.success(`Simulation "${opName}" Started Successfully!`);
    } catch (err) {
      toast.error(`Launch Failed: ${err.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    // ✅ CHANGED: Increased max-w to [100rem] to use more screen real estate
    <div className="p-6 space-y-8 w-full max-w-[100rem] mx-auto">
      
      {/* --- Header Section --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TerminalIcon className="w-8 h-8 text-red-600" /> BASH Operation Center
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Breach & Attack Simulation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono px-3 py-1 rounded-full border ${loading ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
            Status: {loading ? 'Syncing...' : 'Connected'}
          </span>
          <button 
            onClick={fetchCalderaData} 
            disabled={loading}
            className="p-2 hover:bg-muted rounded-full transition-all border border-border shadow-sm"
            title="Refresh Data"
          >
            <RefreshCwIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* ✅ CHANGED: Grid layout now allows the left column to take 75% width on large screens (lg:col-span-3) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- Left Column: Active Agents Monitor (Takes 3/4 width) --- */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-blue-500" /> Active Agents 
              <span className="bg-blue-100 text-blue-700 text-sm px-2.5 py-0.5 rounded-full font-bold">{agents.length}</span>
            </h3>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-full min-h-[400px]">
            {agents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center text-muted-foreground">
                <ActivityIcon className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No active agents detected.</p>
                <p className="text-sm mt-2">Deploy a Sandcat agent on a target machine to see it here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-4 font-bold">PAW (ID)</th>
                      <th className="p-4 font-bold">Group</th>
                      <th className="p-4 font-bold">Host / Platform</th>
                      <th className="p-4 font-bold">PID</th>
                      <th className="p-4 font-bold">Last Beacon</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {agents.map(agent => (
                      <tr key={agent.paw} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-mono text-sm font-medium text-primary">
                          {agent.paw}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-muted text-xs font-mono border border-border font-bold">
                            {agent.group}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-sm">{agent.host}</div>
                          <div className="text-xs text-muted-foreground">{agent.platform}</div>
                        </td>
                        <td className="p-4 font-mono text-xs">{agent.pid}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(agent.last_seen).toLocaleTimeString()}
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${agent.trusted ? 'text-green-600' : 'text-red-500'}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${agent.trusted ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            {agent.trusted ? 'Trusted' : 'Untrusted'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* --- Right Column: Mission Control (Takes 1/4 width) --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-md shadow-black/5 space-y-6 sticky top-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-4">
              <PlayIcon className="w-6 h-6 text-red-600" /> Mission Control
            </h3>
            
            <div className="space-y-5">
              {/* Operation Name */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">Operation Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  placeholder="e.g. Ransomware_Sim_01"
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                />
              </div>

              {/* Target Group */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">Target Group</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm font-mono"
                  placeholder="red"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">Target agents in this group.</p>
              </div>

              {/* Adversary Profile */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">Adversary Profile</label>
                <select 
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  value={selectedAdversary}
                  onChange={(e) => setSelectedAdversary(e.target.value)}
                >
                  <option value="">Select Adversary...</option>
                  {adversaries.map(adv => (
                    <option key={adv.adversary_id} value={adv.adversary_id}>
                      {adv.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                {/* Launch Button */}
                <button 
                  onClick={startSimulation}
                  disabled={isLaunching || agents.length === 0}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white py-3.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-[0.98]"
                >
                  {isLaunching ? (
                    <>
                      <RefreshCwIcon className="w-4 h-4 animate-spin" /> Deploying...
                    </>
                  ) : (
                    <>
                      <ShieldIcon className="w-5 h-5" /> DEPLOY ADVERSARY
                    </>
                  )}
                </button>
              </div>

              {agents.length === 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium">
                    ⚠️ No active agents found.
                  </p>
                </div>
              )}
            </div>

            {/* --- Operation Result Feedback --- */}
            {lastOperation && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 mt-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-green-700 dark:text-green-400 text-sm">Operation Launched!</h4>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                      ID: <span className="font-mono select-all font-bold">{lastOperation.id}</span>
                    </p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-green-600/80 dark:text-green-400/80 mt-1">
                      Status: {lastOperation.state}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalderaDashboard;