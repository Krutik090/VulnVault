// =======================================================================
// FILE: src/features/projects/ProjectDetailsPage.jsx (UPDATED)
// PURPOSE: The main container page for all project details.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProjectById, getProjectConfig, getProjectTimesheet, getProjectVulnerabilities, getProjectNotes, addProjectNote } from '../../api/projectDetailsApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import ProjectConfigModal from './ProjectConfigModal';
import DataTable from '../../components/DataTable';
import AddVulnerabilityModal from './AddVulnerabilityModal';

// Icons
const BackIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>;
const ReportIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
const DownloadIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const AddIcon = () => <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path></svg>;

// Sub-components for better organization
const ProjectSummary = ({ project, timesheet, config }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800">{config?.reportDetails?.clientName || project?.clientId?.clientName}</h3>
            <p className="text-sm text-gray-500">Version: {config?.reportDetails?.version || 'N/A'}</p>
            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Start Date:</strong> {new Date(timesheet?.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> {new Date(timesheet?.endDate).toLocaleDateString()}</p>
            </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800">{project?.project_name}</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-600 max-h-32 overflow-y-auto">
                {timesheet?.userTimeDetails.map(user => (
                    <li key={user.userName}><strong>{user.userName}:</strong> {user.hours}h {user.mins}m</li>
                ))}
            </ul>
        </div>
    </div>
);

const ProjectConfiguration = ({ config, onEdit }) => {
    if (!config || Object.keys(config).length === 0) {
        return (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                <p>No configuration set for this project.</p>
                <button onClick={onEdit} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md">Add Configuration</button>
            </div>
        );
    }
    
    const DetailItem = ({ label, value, isList = false }) => (
        <div>
            <dt className="text-sm font-bold text-gray-600">{label}</dt>
            {isList && Array.isArray(value) ? (
                <dd className="mt-1 text-sm text-gray-900">
                    <ul className="list-disc list-inside">
                        {value.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </dd>
            ) : (
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{value || 'N/A'}</dd>
            )}
        </div>
    );

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Configuration</h3>
                <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-100" title="Edit Configuration"><EditIcon /></button>
            </div>
            <div className="p-6 space-y-6">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-semibold text-gray-700 px-2">Report Details</legend>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                        <DetailItem label="Document Name" value={config.reportDetails?.reportDocName} />
                        <DetailItem label="Client Name" value={config.reportDetails?.clientName} />
                        <DetailItem label="Version" value={config.reportDetails?.version} />
                        <DetailItem label="Exhibit" value={config.reportDetails?.exhibit} />
                    </dl>
                </fieldset>
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-semibold text-gray-700 px-2">Scope</legend>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                        <DetailItem label="Testing Type" value={config.scope?.testingType} />
                        <DetailItem label="Domains/Office" value={config.scope?.domains} isList />
                        <div className="md:col-span-2"><DetailItem label="Application Description" value={config.scope?.appDescription} /></div>
                        <div className="md:col-span-2"><DetailItem label="Functionality Not Tested" value={config.scope?.functionalityNotTested} /></div>
                    </dl>
                </fieldset>
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-md font-semibold text-gray-700 px-2">Methodology</legend>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
                        <DetailItem label="Communication Methods" value={config.methodology?.communicationMethods} />
                        <DetailItem label="User Role Tested" value={config.methodology?.userRoleTested} />
                        <DetailItem label="Limitations" value={config.methodology?.limitations} />
                        <DetailItem label="Session Management" value={config.methodology?.sessionManagement} />
                        <div className="flex space-x-8">
                            <DetailItem label="Business Risk Included" value={config.methodology?.businessRisk ? 'Yes' : 'No'} />
                            <DetailItem label="CVSS Included" value={config.methodology?.cvssIncluded ? 'Yes' : 'No'} />
                        </div>
                    </dl>
                </fieldset>
                <DetailItem label="General Notes" value={config.notes} />
            </div>
        </div>
    );
};

const ProjectNotes = ({ projectId, initialNotes, userName, onNoteAdded }) => {
    const [newNote, setNewNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        setIsSubmitting(true);
        try {
            const response = await addProjectNote(projectId, { text: newNote, addedBy: userName });
            onNoteAdded(response.data);
            setNewNote('');
            toast.success("Note added!");
        } catch (error) {
            toast.error("Failed to add note.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
            <ul className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                {initialNotes.length > 0 ? initialNotes.map(note => (
                    <li key={note._id} className="text-sm">
                        <p className="text-gray-700">{note.text}</p>
                        <p className="text-xs text-gray-400 mt-1">by {note.addedBy} on {new Date(note.dateAdded).toLocaleString()}</p>
                    </li>
                )) : <p className="text-gray-500">No notes available.</p>}
            </ul>
            <form onSubmit={handleSubmit}>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows="3" placeholder="Add a new note..." className="w-full p-2 border rounded-md"></textarea>
                <button type="submit" disabled={isSubmitting} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit Note'}
                </button>
            </form>
        </div>
    );
};

const ProjectVulnerabilities = ({ vulnerabilities, onAdd, project }) => {
    const columns = useMemo(() => [
        { accessorKey: 'vulnerability_name', header: 'Vulnerability Name' },
        { accessorKey: 'total_count', header: 'Instances' },
        { accessorKey: 'severity', header: 'Severity', /* ... */ },
        { id: 'actions', header: 'Actions', cell: ({ row }) => (
            <Link 
                to={`/vulnerabilities/${encodeURIComponent(row.original.vulnerability_name)}?projectName=${encodeURIComponent(project.project_name)}`}
                className="p-2 rounded-full text-blue-500 hover:bg-blue-100"
                title="View Instances"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </Link>
        )},
    ], [project]);

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Vulnerabilities</h3>
                <button onClick={onAdd} className="flex items-center px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-md" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                    <AddIcon /> Add Vulnerability
                </button>
            </div>
            <DataTable data={vulnerabilities} columns={columns} />
        </div>
    );
};

const ProjectDetailsPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [config, setConfig] = useState(null);
    const [timesheet, setTimesheet] = useState(null);
    const [vulnerabilities, setVulnerabilities] = useState([]);
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isVulnModalOpen, setIsVulnModalOpen] = useState(false);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [projRes, confRes, timeRes, vulnRes, notesRes] = await Promise.all([
                getProjectById(projectId),
                getProjectConfig(projectId),
                getProjectTimesheet(projectId),
                getProjectVulnerabilities(projectId),
                getProjectNotes(projectId),
            ]);
            setProject(projRes.data);
            if (confRes.success) setConfig(confRes.data);
            if (timeRes.success) setTimesheet(timeRes.data);
            if (vulnRes.success) setVulnerabilities(vulnRes.data);
            if (notesRes.success) setNotes(notesRes.data);
        } catch (error) {
            toast.error("Could not load project data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, [projectId]);

    const handleConfigSaved = () => {
        setIsConfigModalOpen(false);
        getProjectConfig(projectId).then(res => {
            if(res.success) setConfig(res.data);
        });
    };
    
    const handleVulnSaved = () => {
        setIsVulnModalOpen(false);
        // Refetch just the vulnerabilities to update the table
        getProjectVulnerabilities(projectId).then(res => {
            if (res.success) setVulnerabilities(res.data);
        });
    };

    if (isLoading) return <Spinner fullPage />;
    if (!project) return <div className="text-center p-8">Project not found.</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center">
                        <button onClick={() => navigate(-1)} className="p-2 mr-4 rounded-full hover:bg-gray-200"><BackIcon /></button>
                        <h1 className="text-3xl font-bold text-gray-800">Project Details</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => toast.info("Report generation coming soon!")} className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-md"><ReportIcon /> Generate Report</button>
                        <button onClick={() => toast.info("Download will be available after generation.")} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md"><DownloadIcon /> Download</button>
                    </div>
                </div>

                <ProjectSummary project={project} timesheet={timesheet} config={config} />
                
                <ProjectConfiguration config={config} onEdit={() => setIsConfigModalOpen(true)} />

                <ProjectNotes projectId={projectId} initialNotes={notes} userName={user.name} onNoteAdded={setNotes} />

                <ProjectVulnerabilities vulnerabilities={vulnerabilities} onAdd={() => setIsVulnModalOpen(true)} project={project} />
            </div>
            <ProjectConfigModal 
                project={project}
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                onSave={handleConfigSaved}
            />
            <AddVulnerabilityModal
                isOpen={isVulnModalOpen}
                onClose={() => setIsVulnModalOpen(false)}
                onSave={handleVulnSaved}
                project={project}
            />
        </>
    );
};

export default ProjectDetailsPage;