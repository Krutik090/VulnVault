import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ArrowLeftIcon,
  GlobeIcon,
  AlertTriangleIcon,
  CheckIcon,
  ServerIcon,
  ActivityIcon,
  EyeIcon,
  XIcon
} from '../../components/Icons';

// ✅ IMPORT THE JSON DATA
import ctemData from '../../data/ctemData.json';

const CTEMDashboardPage = () => {
  const { theme, color } = useTheme();
  const navigate = useNavigate();

  // State: Selected domain ID
  const [selectedDomainId, setSelectedDomainId] = useState("usha-com"); // Default to usha.com for demo
  
  // State: Active Tab for Bottom Section
  const [activeTab, setActiveTab] = useState('identity_exposures'); // Default to exposures

  // State: Image Preview Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Logic: Find the data object
  const currentData = useMemo(() => {
    return ctemData.find(domain => domain.id === selectedDomainId) || ctemData[0];
  }, [selectedDomainId]);

  if (!currentData) return <div className="p-10">No data available</div>;

  return (
    <div className={`${theme} theme-${color} min-h-screen space-y-6 pb-12`}>
      
      {/* ================= IMAGE PREVIEW MODAL ================= */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative bg-card border border-border p-2 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <img 
              src={previewImage} 
              alt="POC Evidence" 
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="p-4">
              <h3 className="text-lg font-bold text-foreground">Proof of Concept Evidence</h3>
              <p className="text-sm text-muted-foreground">Snapshot of successful authentication using compromised credentials.</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-xl shadow-sm">
        <div>
          <button 
            onClick={() => navigate('/active-projects')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ActivityIcon className="w-8 h-8 text-primary" />
            CTEM Dashboard
          </h1>
          <p className="text-muted-foreground">Continuous Threat Exposure & Reconnaissance</p>
        </div>

        <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-lg border border-border min-w-[250px]">
          <GlobeIcon className="w-5 h-5 text-muted-foreground ml-2" />
          <div className="flex flex-col w-full">
            <label htmlFor="domain-select" className="text-xs text-muted-foreground font-semibold">
              Select Scope
            </label>
            <select
              id="domain-select"
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer w-full"
            >
              {ctemData.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= METRICS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Security Score */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security Score</p>
              <h2 className={`text-4xl font-bold mt-2 ${currentData.riskScore > 80 ? 'text-green-600' : 'text-red-500'}`}>
                {currentData.riskScore}
                <span className="text-lg text-muted-foreground font-normal">/100</span>
              </h2>
              <p className="text-xs mt-2 text-muted-foreground">{currentData.riskLabel}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ActivityIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="w-full bg-muted h-2 mt-4 rounded-full overflow-hidden">
            <div 
              className={`h-full ${currentData.riskScore > 80 ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ width: `${currentData.riskScore}%` }} 
            />
          </div>
        </div>

        {/* Metric 2: Assets */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assets Discovered</p>
              <h2 className="text-4xl font-bold mt-2 text-foreground">{currentData.assetsDiscovered}</h2>
              <p className="text-xs mt-2 text-muted-foreground">Subdomains & IPs Mapped</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <ServerIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 3: Active Exposures */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Exposures</p>
              <h2 className="text-4xl font-bold mt-2 text-foreground">{currentData.activeExposures}</h2>
              <p className="text-xs mt-2 text-muted-foreground">Open vulnerabilities</p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
              <AlertTriangleIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Metric 4: Credential Leaks */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="truncate pr-2">
              <p className="text-sm font-medium text-muted-foreground">Credential Leaks</p>
              <h2 className="text-4xl font-bold mt-2 text-foreground truncate">
                {currentData.leakedCredentials?.length || 0}
              </h2>
              <p className="text-xs mt-2 text-muted-foreground">Verified compromised accounts</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30">
              <GlobeIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Risk Posture Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData.trendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC008C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EC008C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Area type="monotone" dataKey="risk" stroke="#EC008C" fillOpacity={1} fill="url(#colorRisk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-6">Vulnerabilities by Severity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.severityDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {currentData.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= DATA TABS ================= */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex gap-1 p-2">
            {['identity_exposures', 'top_risks', 'subdomains', 'technologies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-0">
          
          {/* === IDENTITY EXPOSURES (CREDENTIALS) === */}
          {activeTab === 'identity_exposures' && (
            <div className="overflow-x-auto">
              {currentData.leakedCredentials && currentData.leakedCredentials.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Target URL</th>
                      <th className="px-6 py-4 font-medium">Username / ID</th>
                      <th className="px-6 py-4 font-medium">Password Status</th>
                      <th className="px-6 py-4 font-medium">Source</th>
                      <th className="px-6 py-4 font-medium text-right">Evidence (POC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.leakedCredentials.map((creds, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-blue-500 hover:underline">
                          <a href={creds.url} target="_blank" rel="noreferrer">{creds.url}</a>
                        </td>
                        <td className="px-6 py-4 font-mono text-foreground">{creds.username}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-muted-foreground blur-[2px] hover:blur-0 transition-all cursor-pointer select-none">
                              {creds.password}
                            </span>
                            <span className="text-[10px] text-red-500 font-semibold mt-1">EXPOSED</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{creds.source}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setPreviewImage(creds.pocImage || 'https://via.placeholder.com/800x600?text=POC+Evidence+Placeholder')}
                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-muted hover:bg-primary/10 text-foreground hover:text-primary rounded-md border border-border transition-colors"
                          >
                            <EyeIcon className="w-3 h-3" />
                            View POC
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <CheckIcon className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                  <p>No compromised credentials detected for this scope.</p>
                </div>
              )}
            </div>
          )}

          {/* === TOP RISKS === */}
          {activeTab === 'top_risks' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Issue Name</th>
                    <th className="px-6 py-4 font-medium">Severity</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.topRisks?.map((risk) => (
                    <tr key={risk.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{risk.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${risk.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                          {risk.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{risk.status}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary hover:underline font-medium">Investigate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === TECHNOLOGIES === */}
          {activeTab === 'technologies' && (
             <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
               {currentData.technologies?.map((tech, idx) => (
                 <div key={idx} className="p-4 bg-muted/30 border border-border rounded-lg flex items-center gap-3">
                   <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded flex items-center justify-center font-bold">
                     {tech.name.charAt(0)}
                   </div>
                   <div>
                     <p className="font-bold text-foreground text-sm">{tech.name}</p>
                     <p className="text-xs text-muted-foreground">{tech.category} {tech.version && `v${tech.version}`}</p>
                   </div>
                 </div>
               ))}
             </div>
          )}

          {/* === SUBDOMAINS === */}
          {activeTab === 'subdomains' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 font-medium">Subdomain</th>
                    <th className="px-6 py-4 font-medium">IP Address</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.subdomains?.map((sub, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{sub.sub}</td>
                      <td className="px-6 py-4 font-mono text-muted-foreground">{sub.ip}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          {sub.status}
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
    </div>
  );
};

export default CTEMDashboardPage;