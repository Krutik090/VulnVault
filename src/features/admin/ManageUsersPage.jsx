// =======================================================================
// FILE: src/features/admin/ManageUsersPage.jsx (UPDATED)
// PURPOSE: The main page for viewing and managing all users.
// =======================================================================
import { useState, useEffect, useMemo } from 'react';
import { getAllUsers } from '../../api/adminApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';
import AddUserModal from './AddUserModal';
import ResetPasswordModal from './ResetPasswordModal';
import DeleteUserModal from './DeleteUserModal';
import DataTable from '../../components/DataTable';

// Icons for actions
const AddIcon = () => <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>;
const ResetPasswordIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0113.856-5.856M20 14a8 8 0 01-13.856 5.856" /></svg>;
const TrashIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>;
const InfoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;


const ManageUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await getAllUsers();
            setUsers(response.data);
        } catch (error) {
            toast.error("Could not fetch users.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const columns = useMemo(() => [
        {
            accessorKey: 'name',
            header: 'Username',
            cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: info => <span className="text-gray-500">{info.getValue()}</span>
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: info => <span className="capitalize text-gray-500">{info.getValue()}</span>
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-full text-yellow-500 hover:bg-yellow-100" title="View Details"><InfoIcon /></button>
                    <button onClick={() => setUserToEdit(row.original)} className="p-2 rounded-full text-blue-500 hover:bg-blue-100" title="Reset Password"><ResetPasswordIcon /></button>
                    <button onClick={() => setUserToDelete(row.original)} className="p-2 rounded-full text-red-500 hover:bg-red-100" title="Delete User"><TrashIcon /></button>
                </div>
            )
        }
    ], []);

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
                        <p className="text-gray-500 mt-1">Add, remove, or edit users in the system.</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 text-white font-semibold rounded-lg shadow-md" style={{ background: 'linear-gradient(to right, #6366F1, #8B5CF6)' }}>
                        <AddIcon /> Add User
                    </button>
                </div>
                {isLoading ? <Spinner /> : <DataTable data={users} columns={columns} />}
            </div>

            <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onUserAdded={() => { setIsAddModalOpen(false); fetchUsers(); }} />
            <ResetPasswordModal user={userToEdit} onClose={() => setUserToEdit(null)} />
            <DeleteUserModal user={userToDelete} onClose={() => setUserToDelete(null)} onUserDeleted={fetchUsers} />
        </>
    );
};

export default ManageUsersPage;