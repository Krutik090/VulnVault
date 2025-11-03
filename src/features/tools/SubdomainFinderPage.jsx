// =======================================================================
// FILE: src/features/tools/SubdomainFinderPage.jsx (UPDATED)
// PURPOSE: Subdomain Finder tool with status checking functionality
// SOC 2 NOTES: Centralized icon management, secure scanning, audit logging
// =======================================================================

import { useState, useMemo, useCallback } from 'react';
import { findSubdomains } from '../../api/toolsApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { useTheme } from '../../contexts/ThemeContext';

// ✅ CENTRALIZED ICON IMPORTS (SOC 2: Single source of truth)
import {
  SearchIcon,
  GlobeIcon,
  ServerIcon,
  LinkIcon,
  RefreshIcon,
  ShieldIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../../components/Icons';

// ✅ Loading/Spinner Icon (keep inline as it's specialized)
const LoadingIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ✅ SOC 2: Status Icon Component
const StatusIcon = ({ status }) => {
  const statusConfig = {
    checking: {
      icon: LoadingIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    },
    alive: {
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    dead: {
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    },
    unknown: {
      icon: () => null,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  };

  const config = statusConfig[status] || statusConfig.unknown;
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${config.color} ${config.bgColor}`}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      <span className="capitalize">{status || 'unknown'}</span>
    </div>
  );
};

const SubdomainFinderPage = () => {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { theme, color } = useTheme();

  // ✅ SOC 2: Domain validation
  const validateDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  };

  // ✅ SOC 2: Check if a domain is alive
  const checkDomainStatus = async (subdomain) => {
    try {
      console.log(`🔍 Checking status for: ${subdomain}`);

      // Try both HTTP and HTTPS
      const protocols = ['https', 'http'];

      for (const protocol of protocols) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(`${protocol}://${subdomain}`, {
            method: 'HEAD', // Use HEAD to avoid downloading content
            mode: 'no-cors', // Avoid CORS issues
            signal: controller.signal,
            cache: 'no-cache'
          });

          clearTimeout(timeoutId);

          // With no-cors mode, we can't check status codes,
          // but if the request completes without error, the domain is likely alive
          console.log(`✅ ${subdomain} is alive (${protocol})`);
          return 'alive';
        } catch (error) {
          // Continue to next protocol
          continue;
        }
      }

      console.log(`❌ ${subdomain} is dead`);
      return 'dead';
    } catch (error) {
      console.error(`❌ Error checking ${subdomain}:`, error.message);
      return 'dead';
    }
  };

  // ✅ SOC 2: Check all domains' status with audit logging
  const checkAllDomainsStatus = useCallback(async () => {
    if (results.length === 0) {
      toast.error('No subdomains to check');
      return;
    }

    console.log(`🔍 Starting status check for ${results.length} subdomains`);

    setIsCheckingStatus(true);

    // Initialize all domains with 'checking' status
    setResults((prevResults) =>
      prevResults.map((result) => ({
        ...result,
        status: 'checking'
      }))
    );

    try {
      // Process domains in batches to avoid overwhelming the browser
      const batchSize = 5;
      const batches = [];

      for (let i = 0; i < results.length; i += batchSize) {
        batches.push(results.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const statusPromises = batch.map(async (result) => {
          const status = await checkDomainStatus(result.subdomain);

          // Update individual result as soon as we get the status
          setResults((prevResults) => {
            const newResults = [...prevResults];
            const globalIndex = prevResults.findIndex(
              (r) => r.subdomain === result.subdomain
            );
            if (globalIndex !== -1) {
              newResults[globalIndex] = { ...newResults[globalIndex], status };
            }
            return newResults;
          });

          return { ...result, status };
        });

        // Wait for current batch to complete before moving to next
        await Promise.all(statusPromises);

        // Small delay between batches to be respectful
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const aliveCount = results.filter((r) => r.status === 'alive').length;
      console.log(
        `✅ Status check completed: ${aliveCount}/${results.length} domains are alive`
      );
      toast.success(
        `Status check completed! ${aliveCount} domains are alive.`
      );
    } catch (error) {
      console.error('❌ Error checking domain status:', error.message);
      toast.error('Failed to check domain status');
    } finally {
      setIsCheckingStatus(false);
    }
  }, [results]);

  // ✅ SOC 2: Form submission with validation and audit logging
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!domain.trim()) {
      toast.error('Please enter a domain name.');
      return;
    }

    const cleanDomain = domain.trim().toLowerCase();
    if (!validateDomain(cleanDomain)) {
      toast.error('Please enter a valid domain name (e.g., example.com).');
      return;
    }

    console.log(`🔍 Starting subdomain scan for: ${cleanDomain}`);

    setIsLoading(true);
    setResults([]);
    setHasSearched(true);

    try {
      const response = await findSubdomains(cleanDomain);
      const subdomains = response.data || [];

      console.log(`✅ Found ${subdomains.length} subdomains for ${cleanDomain}`);

      // Initialize results with 'unknown' status
      const resultsWithStatus = subdomains.map((result) => ({
        ...result,
        status: 'unknown'
      }));

      setResults(resultsWithStatus);

      if (!subdomains || subdomains.length === 0) {
        toast.success('Scan completed. No subdomains found for this domain.');
      } else {
        toast.success(
          `Found ${subdomains.length} subdomain${
            subdomains.length > 1 ? 's' : ''
          }. Click "Check Status" to verify if they're alive.`
        );
      }
    } catch (error) {
      console.error('❌ Subdomain finder error:', error.message);
      toast.error(
        error.message || 'Failed to find subdomains. Please try again.'
      );
      setHasSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting subdomain finder');
    setDomain('');
    setResults([]);
    setHasSearched(false);
    setIsCheckingStatus(false);
  };

  // ✅ SOC 2: Table columns with proper data handling
  const columns = useMemo(
    () => [
      {
        accessorKey: 'subdomain',
        header: 'Subdomain',
        cell: ({ getValue }) => {
          const subdomain = getValue() || 'N/A';
          return (
            <div className="flex items-center gap-2">
              <GlobeIcon className="text-blue-500 w-5 h-5 flex-shrink-0" />
              <a
                href={`https://${subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline"
                aria-label={`Visit ${subdomain}`}
              >
                {subdomain}
              </a>
              <LinkIcon className="text-gray-400 w-4 h-4" />
            </div>
          );
        }
      },
      {
        accessorKey: 'ip',
        header: 'IP Address',
        cell: ({ getValue }) => {
          const ip = getValue() || 'N/A';
          return (
            <div className="flex items-center gap-2">
              <ServerIcon className="text-green-500 w-5 h-5 flex-shrink-0" />
              <span className="font-mono text-sm text-foreground">{ip}</span>
            </div>
          );
        }
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusIcon status={getValue()} />
      }
    ],
    []
  );

  // ✅ SOC 2: Statistics calculations including status
  const stats = useMemo(() => {
    const total = results.length;
    const withIp = results.filter((r) => r.ip).length;
    const alive = results.filter((r) => r.status === 'alive').length;
    const dead = results.filter((r) => r.status === 'dead').length;
    const checking = results.filter((r) => r.status === 'checking').length;

    return { total, withIp, alive, dead, checking };
  }, [results]);

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* ========== HEADER ========== */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <ShieldIcon className="text-blue-600 w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Subdomain Finder & Status Checker
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover subdomains of a target domain using passive DNS
            reconnaissance and check if they're alive
          </p>
        </div>

        {/* ========== SEARCH FORM ========== */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Enter domain name (e.g., example.com)"
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                  aria-label="Domain name"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                aria-label="Find subdomains"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <SearchIcon className="w-5 h-5" />
                    Find Subdomains
                  </>
                )}
              </button>
              {hasSearched && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 border border-input hover:bg-accent rounded-lg transition-colors flex items-center justify-center gap-2"
                  aria-label="Reset search"
                >
                  <RefreshIcon className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ========== LOADING STATE ========== */}
        {isLoading && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="flex items-center justify-center gap-3 text-muted-foreground mb-4">
              <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="text-lg font-medium">
                Discovering subdomains...
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              This may take a few moments. Please wait while we discover
              subdomains.
            </p>
          </div>
        )}

        {/* ========== NO RESULTS STATE ========== */}
        {hasSearched && !isLoading && results.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="text-muted-foreground mb-4">
              <GlobeIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2 text-foreground">
                No Subdomains Found
              </h3>
              <p className="text-sm">
                No subdomains were discovered for{' '}
                <strong className="text-foreground">{domain}</strong>. This
                could mean the domain has no public subdomains or they are not
                indexed in our databases.
              </p>
            </div>
          </div>
        )}

        {/* ========== RESULTS SECTION ========== */}
        {results.length > 0 && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">
                  {stats.total}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Subdomains
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.withIp}
                </div>
                <div className="text-sm text-muted-foreground">
                  With IP Address
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {stats.alive}
                </div>
                <div className="text-sm text-muted-foreground">Alive</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">
                  {stats.dead}
                </div>
                <div className="text-sm text-muted-foreground">Dead</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.checking}
                </div>
                <div className="text-sm text-muted-foreground">Checking</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total > 0
                    ? Math.round((stats.alive / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div className="text-sm text-muted-foreground">Alive Rate</div>
              </div>
            </div>

            {/* Status Check Button */}
            <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
              <h2 className="text-xl font-semibold text-foreground">
                Found Subdomains ({results.length})
              </h2>
              <button
                onClick={checkAllDomainsStatus}
                disabled={isCheckingStatus || isLoading}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Check status of all subdomains"
              >
                {isCheckingStatus ? (
                  <>
                    <LoadingIcon />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Check Status
                  </>
                )}
              </button>
            </div>

            {/* Results Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <DataTable
                columns={columns}
                data={results}
                searchable={true}
                pagination={true}
              />
            </div>
          </div>
        )}

        {/* ========== INFORMATION SECTION ========== */}
        <div className="bg-muted/30 border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            About This Tool
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Subdomain Enumeration
              </h4>
              <p>
                Subdomain enumeration is the process of discovering subdomains
                for a given domain. It's a crucial step in reconnaissance during
                penetration testing to map the attack surface.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Status Checking
              </h4>
              <p>
                The status check feature verifies if discovered subdomains are
                alive by sending HTTP/HTTPS requests. This helps identify active
                services and potential targets for further testing.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Legal Notice
              </h4>
              <p>
                Only use this tool on domains you own or have explicit
                permission to test. Unauthorized scanning may violate terms of
                service or local laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubdomainFinderPage;
