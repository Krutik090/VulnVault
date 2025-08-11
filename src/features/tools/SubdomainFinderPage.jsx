// =======================================================================
// FILE: src/features/tools/SubdomainFinderPage.jsx (UPDATED)
// PURPOSE: The main page for the Subdomain Finder tool with theme support.
// =======================================================================
import { useState, useMemo } from 'react';
import { findSubdomains } from '../../api/toolsApi';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { useTheme } from '../../contexts/ThemeContext';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const ServerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SubdomainFinderPage = () => {
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { theme, color } = useTheme();

  const validateDomain = (domain) => {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      toast.error("Please enter a domain name.");
      return;
    }

    const cleanDomain = domain.trim().toLowerCase();
    
    if (!validateDomain(cleanDomain)) {
      toast.error("Please enter a valid domain name (e.g., example.com).");
      return;
    }

    setIsLoading(true);
    setResults([]);
    setHasSearched(true);
    
    try {
      const response = await findSubdomains(cleanDomain);
      setResults(response.data || []);
      
      if (!response.data || response.data.length === 0) {
        toast.success("Scan completed. No subdomains found for this domain.");
      } else {
        toast.success(`Found ${response.data.length} subdomain${response.data.length > 1 ? 's' : ''}.`);
      }
    } catch (error) {
      console.error('Subdomain finder error:', error);
      toast.error(error.message || 'Failed to find subdomains. Please try again.');
      setHasSearched(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDomain('');
    setResults([]);
    setHasSearched(false);
  };

  const columns = useMemo(() => [
    { 
      accessorKey: 'subdomain', 
      header: 'Subdomain',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <GlobeIcon className="w-4 h-4 text-primary" />
          <a
            href={`http://${getValue()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium hover:underline"
          >
            {getValue()}
          </a>
          <LinkIcon className="w-3 h-3 text-muted-foreground" />
        </div>
      )
    },
    { 
      accessorKey: 'ip', 
      header: 'IP Address',
      cell: ({ getValue }) => (
        <div className="flex items-center gap-2">
          <ServerIcon className="text-muted-foreground" />
          <span className="font-mono text-sm">{getValue() || 'N/A'}</span>
        </div>
      )
    },
  ], []);

  return (
    <div className={`${theme} theme-${color} min-h-screen bg-background`}>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShieldIcon className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Subdomain Finder</h1>
              <p className="text-muted-foreground mt-1">
                Discover subdomains of a target domain using passive DNS reconnaissance
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-card-foreground mb-2">
                Target Domain
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
                  placeholder="example.com"
                  disabled={isLoading}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Enter a domain name without protocol (e.g., example.com, not https://example.com)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading || !domain.trim()}
                className="flex-1 bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <SearchIcon />
                    Find Subdomains
                  </>
                )}
              </button>

              {(hasSearched || results.length > 0) && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="px-6 py-3 border border-input text-muted-foreground bg-background hover:bg-accent hover:text-accent-foreground rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <RefreshIcon />
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  Scanning {domain}...
                </h3>
                <p className="text-muted-foreground">
                  This may take a few moments. Please wait while we discover subdomains.
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">No Subdomains Found</h3>
                <p className="text-muted-foreground mb-6">
                  No subdomains were discovered for <span className="font-mono bg-muted px-2 py-1 rounded">{domain}</span>. 
                  This could mean the domain has no public subdomains or they are not indexed in our databases.
                </p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
                >
                  <RefreshIcon />
                  Try Another Domain
                </button>
              </div>
            ) : (
              <DataTable 
                data={results} 
                columns={columns} 
                title={`Subdomains for ${domain}`}
              />
            )}
          </div>
        )}

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Subdomains</p>
                  <p className="text-2xl font-bold text-primary">{results.length}</p>
                </div>
                <GlobeIcon className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">With IP Address</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {results.filter(r => r.ip).length}
                  </p>
                </div>
                <ServerIcon className="w-8 h-8 text-emerald-500" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scan Status</p>
                  <p className="text-sm font-semibold text-emerald-600">Completed</p>
                </div>
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-8 p-6 bg-muted/30 border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
            <ShieldIcon />
            About Subdomain Enumeration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-card-foreground mb-2">What is Subdomain Enumeration?</h4>
              <p>
                Subdomain enumeration is the process of discovering subdomains for a given domain. 
                It's a crucial step in reconnaissance during penetration testing to map the attack surface.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Passive vs Active Enumeration</h4>
              <p>
                This tool uses passive enumeration techniques, querying public databases and DNS records 
                without directly interacting with the target infrastructure.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Use Cases</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Security assessment and penetration testing</li>
                <li>Asset discovery and inventory management</li>
                <li>Monitoring for shadow IT and unauthorized services</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-card-foreground mb-2">Ethical Usage</h4>
              <p>
                Only use this tool on domains you own or have explicit permission to test. 
                Unauthorized scanning may violate terms of service or local laws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubdomainFinderPage;
