import { useState, useEffect } from 'react';
import { getMyProjects, logTime } from '../../api/trackerApi';
import toast from 'react-hot-toast';
import Spinner from '../../components/Spinner';

const TimeTrackerPage = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [selectedProject, setSelectedProject] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getMyProjects();
                if (response.success && response.data.projects) {
                    setProjects(response.data.projects.map(p => p.projectId));
                }
            } catch (error) {
                toast.error("Could not fetch your projects.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProject || (!hours && !minutes)) {
            toast.error("Please select a project and enter time spent.");
            return;
        }
        setIsSubmitting(true);
        try {
            await logTime({
                projectName: selectedProject,
                hours: Number(hours) || 0,
                mins: Number(minutes) || 0,
                note,
            });
            toast.success("Time logged successfully!");
            // Reset form
            setSelectedProject('');
            setHours('');
            setMinutes('');
            setNote('');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-800">Time Tracker</h1>
                <p className="text-gray-500 mt-1">Log your work hours for a project.</p>
            </div>
            {isLoading ? <div className="p-6 h-64 flex items-center justify-center"><Spinner /></div> : (
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="project" className="block text-sm font-bold text-gray-700 mb-1">Select Project</label>
                            <select 
                                id="project" 
                                value={selectedProject} 
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                required
                            >
                                <option value="" disabled>-- Choose a project --</option>
                                {projects.map(p => (
                                    <option key={p._id} value={p.project_name}>{p.project_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="hours" className="block text-sm font-bold text-gray-700 mb-1">Hours</label>
                                <input 
                                    type="number" 
                                    id="hours"
                                    value={hours}
                                    onChange={(e) => setHours(e.target.value)}
                                    min="0" max="8"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="e.g., 2"
                                />
                            </div>
                             <div>
                                <label htmlFor="minutes" className="block text-sm font-bold text-gray-700 mb-1">Minutes</label>
                                <input 
                                    type="number" 
                                    id="minutes"
                                    value={minutes}
                                    onChange={(e) => setMinutes(e.target.value)}
                                    min="0" max="59"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                    placeholder="e.g., 30"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="note" className="block text-sm font-bold text-gray-700 mb-1">Justification (Note)</label>
                            <textarea 
                                id="note" 
                                rows="4" 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                placeholder="Enter a note to justify your work..."
                                required
                            ></textarea>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 text-right rounded-b-lg">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-white font-semibold rounded-lg shadow-md disabled:opacity-60 transition" style={{ background: 'linear-gradient(to right, #EC008C, #FC6767)' }}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default TimeTrackerPage;