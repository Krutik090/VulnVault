import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { triggerCloudScan, getCloudFindings } from '../../api/scoutSuiteApi';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import SearchableDropdown from '../../components/SearchableDropdown';
import ScoutScanModal from './ScoutScanModal';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  CloudIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ServerIcon,
  FilterIcon,
  PlusIcon // ✅ Added PlusIcon
} from '../../components/Icons';

const CloudSecurityPage = () => {
  const [findings, setFindings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Modal State
  
  // Filters
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');

  const { user } = useAuth();
  const { theme, color } = useTheme();

  const fetchFindings = async () => {
    /* ... (keep existing fetch logic) ... */
    setIsLoading(true);
    try {
      const response = await getCloudFindings({
        provider: selectedProvider,
        severity: selectedSeverity
      });
      setFindings(response.data || []);
    } catch (error) {
      toast.error('Failed to load cloud security findings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFindings();
  }, [selectedProvider, selectedSeverity]);

  // ✅ New Handler: Accepts the configuration object from the Modal
  const handleScanRequest = async (scanConfig) => {
    setIsScanning(true);
    const toastId = toast.loading(`Initiating Scout Suite scan for ${scanConfig.provider.toUpperCase()}...`);

    try {
      // Pass the entire configuration to the API
      await triggerCloudScan(scanConfig); 
      
      toast.success('Scan started successfully!', { id: toastId });
      // In a real app, you might poll for status. Here we just wait a bit or refresh.
      setTimeout(fetchFindings, 5000); 
    } catch (error) {
      toast.error(error.message || 'Scan failed', { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  /* ... (Stats and Columns logic remains the same) ... */
  const stats = useMemo(() => {
     /* keep existing stats logic */
     return {
      total: findings.length,
      danger: findings.filter(f => f.severity === 'danger').length,
      warning: findings.filter(f => f.severity === 'warning').length,
      resources: new Set(findings.map(f => f.resourceId)).size
    };
  }, [findings]);

  const columns = useMemo(() => [
      /* keep existing columns */
       { accessorKey: 'provider', header: 'Provider', cell: ({getValue}) => getValue() },
       { accessorKey: 'service', header: 'Service', cell: ({getValue}) => getValue() },
       { accessorKey: 'description', header: 'Finding', cell: ({row}) => row.original.description },
       { accessorKey: 'severity', header: 'Severity', cell: ({getValue}) => getValue() },
       { accessorKey: 'region', header: 'Region', cell: ({getValue}) => getValue() },
  ], []);

  return (
    <div className={`${theme} theme-${color} space-y-6 animate-in fade-in duration-500`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CloudIcon className="w-8 h-8 text-primary" />
            Cloud Security Posture
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor AWS, Azure, and GCP environments using Scout Suite
          </p>
        </div>
        
        {/* ✅ Single Action Button that opens the Config Modal */}
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isScanning}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-bold flex items-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScanning ? <Spinner size="sm" /> : <PlusIcon className="w-5 h-5" />}
            New Scan
          </button>
        )}
      </div>

      {/* Stats Cards (Keep existing) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Findings" value={stats.total} icon={<ShieldCheckIcon />} />
        <StatCard label="Critical Risks" value={stats.danger} color="text-red-600" icon={<AlertTriangleIcon />} />
        <StatCard label="Warnings" value={stats.warning} color="text-orange-600" icon={<AlertTriangleIcon />} />
        <StatCard label="Affected Resources" value={stats.resources} icon={<ServerIcon />} />
      </div>

      {/* Filters (Keep existing) */}
      <div className="flex flex-wrap gap-4 p-4 bg-card border border-border rounded-lg">
          {/* ... existing filter dropdowns ... */}
           <div className="w-full sm:w-64">
            <SearchableDropdown
                label="Provider"
                options={[{value: 'aws', label: 'AWS'}, {value: 'azure', label: 'Azure'}, {value: 'gcp', label: 'GCP'}]}
                value={selectedProvider}
                onChange={setSelectedProvider}
                placeholder="All Providers"
            />
        </div>
         <div className="w-full sm:w-64">
            <SearchableDropdown
                label="Severity"
                options={[{value: 'danger', label: 'Danger'}, {value: 'warning', label: 'Warning'}]}
                value={selectedSeverity}
                onChange={setSelectedSeverity}
                placeholder="All Severities"
            />
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm">
        {isLoading ? (
            <div className="p-12 flex justify-center"><Spinner message="Loading findings..." /></div>
        ) : (
            <DataTable 
                data={findings} 
                columns={columns} 
                title="Cloud Security Findings"
                enableExport={true} 
            />
        )}
      </div>

      {/* ✅ Render the Modal */}
      <ScoutScanModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onScan={handleScanRequest}
      />
    </div>
  );
};

// StatCard (Keep existing)
const StatCard = ({ label, value, color = 'text-foreground', icon }) => (
  <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
    <div className="p-3 bg-muted rounded-full opacity-80">{icon}</div>
  </div>
);

export default CloudSecurityPage;