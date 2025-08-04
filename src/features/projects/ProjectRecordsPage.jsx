
// =======================================================================
// FILE: src/features/projects/ProjectRecordsPage.jsx (UPDATED)
// PURPOSE: The main page for viewing and managing all projects.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { getAllProjects } from '../../api/projectApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import ProjectConfigModal from './ProjectConfigModal';
import AddEditProjectModal from './AddEditProjectModal';
import DeleteProjectModal from './DeleteProjectModal';

// Icons
const AddIcon = () => <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"></path></svg>;
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const ConfigIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;

const statusMap = {
    '-2': { text: 'Recursive', color: 'bg-purple-100 text-purple-800' },
    '-1': { text: 'Completed', color: 'bg-green-100 text-green-800' },
    '0': { text: 'Not Started', color: 'bg-gray-100 text-gray-800' },
    '1': { text: 'Active', color: 'bg-blue-100 text-blue-800' },
    '2': { text: 'Retest', color: 'bg-yellow-100 text-yellow-800' },
};

const ProjectRecordsPage = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [projectToConfig, setProjectToConfig] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const response = await getAllProjects();
            const normalizedData = response.data.map(p => ({
                ...p,
                projectType: Array.isArray(p.projectType) ? p.projectType : [p.projectType],
                assets: Array.isArray(p.assets) ? p.assets : [],
            }));
            setProjects(normalizedData);
        } catch (error) {
            toast.error("Could not fetch projects.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleProjectSaved = () => {
        setIsProjectModalOpen(false);
        setProjectToEdit(null);
        fetchProjects();
    };

    const filteredProjects = useMemo(() => {
        if (statusFilter === 'all') {
            return projects;
        }
        return projects.filter(p => p.status.toString() === statusFilter);
    }, [projects, statusFilter]);

    const columns = useMemo(() => [
        { accessorKey: 'project_name', header: 'Project Name' },
        { accessorKey: 'projectType', header: 'Project Type', cell: info => info.getValue().join(', ') },
        { accessorKey: 'projectStart', header: 'Start Date', cell: info => new Date(info.getValue()).toLocaleDateString() },
        { accessorKey: 'projectEnd', header: 'End Date', cell: info => new Date(info.getValue()).toLocaleDateString() },
        { accessorKey: 'status', header: 'Status', cell: info => {
            const status = statusMap[info.getValue()];
            return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status?.color || 'bg-gray-100 text-gray-800'}`}>{status?.text || 'Unknown'}</span>;
        }},
        { accessorKey: 'assets', header: 'Pentester', cell: info => info.getValue().map(asset => asset.name).join(', ') },
        { id: 'actions', header: 'Actions', cell: ({ row }) => (
            <div className="flex items-center space-x-2">
                <button onClick={() => { setProjectToEdit(row.original); setIsProjectModalOpen(true); }} className="p-2 rounded-full text-blue-500 hover:bg-blue-100" title="Edit Project"><EditIcon /></button>
                <button onClick={() => setProjectToConfig(row.original)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" title="Configure Project"><ConfigIcon /></button>
                <button onClick={() => setProjectToDelete(row.original)} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Delete Project"><TrashIcon /></button>
            </div>
        )}
    ], []);

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Project Records</h1>
                        <p className="text-gray-500 mt-1">View, create, and manage all projects.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="p-2 border rounded-md">
                            <option value="all">All</option>
                            {Object.entries(statusMap).map(([key, { text }]) => (
                                <option key={key} value={key}>{text}</option>
                            ))}
                        </select>
                        <button onClick={() => { setProjectToEdit(null); setIsProjectModalOpen(true); }} className="flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md" style={{ background: 'linear-gradient(to right, #EC008C, #FC6767)' }}>
                            <AddIcon /> Add New Project
                        </button>
                    </div>
                </div>
                {isLoading ? <Spinner /> : <DataTable data={filteredProjects} columns={columns} />}
            </div>
            <ProjectConfigModal project={projectToConfig} onClose={() => setProjectToConfig(null)} />
            <AddEditProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleProjectSaved} projectToEdit={projectToEdit} />
            <DeleteProjectModal project={projectToDelete} onClose={() => setProjectToDelete(null)} onProjectDeleted={fetchProjects} />
        </>
    );
};

export default ProjectRecordsPage;
