// =======================================================================
// FILE: src/features/dashboard/DashboardPage.jsx (UPDATED)
// PURPOSE: The main dashboard page for viewing and filtering projects.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getActiveProjects } from '../../api/projectApi';
import { getAllClients } from '../../api/clientApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import DataTable from '../../components/DataTable';
import SearchableDropdown from '../../components/SearchableDropdown';
import ProjectConfigModal from '../projects/ProjectConfigModal';
import AddEditProjectModal from '../projects/AddEditProjectModal';
import DeleteProjectModal from '../projects/DeleteProjectModal';

// Icons
const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const ConfigIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;

// Reusable component for the colored risk counts
const RiskCell = ({ counts }) => (
    <div className="flex items-center space-x-1 font-mono text-xs">
        <span className="text-red-700 font-bold">C:{counts.critical}</span>
        <span className="text-red-500 font-bold">H:{counts.high}</span>
        <span className="text-yellow-500 font-bold">M:{counts.medium}</span>
        <span className="text-green-500 font-bold">L:{counts.low}</span>
        <span className="text-blue-500 font-bold">I:{counts.info}</span>
    </div>
);

const DashboardPage = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [clientFilter, setClientFilter] = useState('all');
    const [projectToConfig, setProjectToConfig] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [projectsRes, clientsRes] = await Promise.all([
                getActiveProjects(),
                getAllClients()
            ]);
            setProjects(projectsRes.data);
            setClients(clientsRes.data);
        } catch (error) {
            toast.error("Could not load dashboard data.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleProjectSaved = () => {
        setIsProjectModalOpen(false);
        setProjectToEdit(null);
        loadData();
    };

    const filteredProjects = useMemo(() => {
        if (clientFilter === 'all') return projects;
        return projects.filter(p => p.clientId === clientFilter);
    }, [projects, clientFilter]);

    const clientOptions = useMemo(() => [
        { value: 'all', label: 'All Clients' },
        ...clients.map(client => ({ value: client._id, label: client.clientName }))
    ], [clients]);

    const columns = useMemo(() => [
        { 
            accessorKey: 'clientName', 
            header: 'Client',
            cell: info => (
                <Link to={`/clients/${info.row.original.clientId}/projects`} className="text-blue-600 hover:underline font-semibold">
                    {info.getValue()}
                </Link>
            )
        },
        { 
            accessorKey: 'project_name', 
            header: 'Project Name',
            cell: info => (
                <Link to={`/projects/${info.row.original._id}/vulnerabilities`} className="hover:text-blue-600">
                    {info.getValue()}
                </Link>
            )
        },
        { accessorKey: 'projectType', header: 'Type', cell: info => Array.isArray(info.getValue()) ? info.getValue().join(', ') : info.getValue() },
        { accessorKey: 'vulnerabilityCounts', header: 'Risk', cell: info => <RiskCell counts={info.getValue()} /> },
        { accessorKey: 'assets', header: 'Pentester', cell: info => info.getValue().map(a => a.name).join(', ') },
        { id: 'actions', header: 'Actions', cell: ({ row }) => (
            <div className="flex items-center space-x-2">
                <button onClick={() => { setProjectToEdit(row.original); setIsProjectModalOpen(true); }} className="p-2 rounded-full text-blue-500 hover:bg-blue-100" title="Edit Project"><EditIcon /></button>
                <button onClick={() => setProjectToConfig(row.original)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100" title="Configure Project"><ConfigIcon /></button>
                <button onClick={() => setProjectToDelete(row.original)} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Delete Project"><TrashIcon /></button>
            </div>
        )},
    ], []);

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">General Dashboard</h1>
                        <p className="text-gray-500 mt-1">Overview of all current projects.</p>
                    </div>
                    <SearchableDropdown 
                        options={clientOptions}
                        value={clientFilter}
                        onChange={setClientFilter}
                        placeholder="Filter by client..."
                    />
                </div>
                {isLoading ? <Spinner /> : <DataTable data={filteredProjects} columns={columns} />}
            </div>
            <ProjectConfigModal project={projectToConfig} onClose={() => setProjectToConfig(null)} />
            <AddEditProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} onSave={handleProjectSaved} projectToEdit={projectToEdit} />
            <DeleteProjectModal project={projectToDelete} onClose={() => setProjectToDelete(null)} onProjectDeleted={loadData} />
        </>
    );
};

export default DashboardPage;