import React, { useState, useEffect, useMemo } from 'react';
import { CloseIcon, DatabaseIcon, ShieldCheckIcon } from '../../components/Icons';

const NessusFindingsModal = ({ isOpen, onClose, onImport, findings, isImporting }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterSeverity, setFilterSeverity] = useState('All');

  // Initialize selection when findings load
  useEffect(() => {
    if (isOpen && findings.length > 0) {
      // Select all by default
      const allIds = findings.map(f => f.external_id);
      setSelectedIds(new Set(allIds));
    }
  }, [isOpen, findings]);

  const filteredFindings = useMemo(() => {
    if (filterSeverity === 'All') return findings;
    return findings.filter(f => f.severity === filterSeverity);
  }, [findings, filterSeverity]);

  const handleToggle = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredFindings.map(f => f.external_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleImportClick = () => {
    // Filter the original array to get full objects of selected IDs
    const selectedFindings = findings.filter(f => selectedIds.has(f.external_id));
    onImport(selectedFindings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-card w-full max-w-4xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col border border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Import Nessus Findings</h2>
              <p className="text-sm text-muted-foreground">Select findings to import into your project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Stats */}
        <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={selectedIds.size === filteredFindings.length && filteredFindings.length > 0}
                onChange={handleSelectAll}
              />
              Select All
            </label>
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
          </div>
          
          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="text-sm border border-border rounded-md px-2 py-1 bg-background"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Info">Info</option>
          </select>
        </div>

        {/* List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 sticky top-0 text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="px-6 py-3 w-10"></th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Host (IP)</th>
                <th className="px-6 py-3">Port</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFindings.map((vuln) => (
                <tr key={vuln.external_id} className={`hover:bg-muted/30 transition-colors ${selectedIds.has(vuln.external_id) ? 'bg-primary/5' : ''}`}>
                  <td className="px-6 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(vuln.external_id)}
                      onChange={() => handleToggle(vuln.external_id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-3 font-medium truncate max-w-xs" title={vuln.title}>
                    {vuln.title}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      vuln.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      vuln.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                      vuln.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {vuln.severity}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{vuln.details.ip_address}</td>
                  <td className="px-6 py-3 text-muted-foreground font-mono">{vuln.details.port}</td>
                </tr>
              ))}
              {filteredFindings.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">
                    No findings match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-xl">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleImportClick}
            disabled={isImporting || selectedIds.size === 0}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isImporting ? 'Importing...' : `Import ${selectedIds.size} Findings`}
            {!isImporting && <DatabaseIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NessusFindingsModal;