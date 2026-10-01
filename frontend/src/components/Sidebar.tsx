import React, { useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

const Sidebar: React.FC = () => {
    const { dentists, rooms, requests, setDentists, setRooms, setRequests, setScheduleResult, addRunHistory } = useAppContext();
    const [loading, setLoading] = React.useState(false);
    const [algorithm, setAlgorithm] = React.useState('Backtracking + Forward Checking');
    const [dataset, setDataset] = React.useState('');

    // File refs for custom upload
    const doctorsRef = React.useRef<HTMLInputElement>(null);
    const roomsRef = React.useRef<HTMLInputElement>(null);
    const requestsRef = React.useRef<HTMLInputElement>(null);

    // Load initial data on mount (default to Case 1)
    useEffect(() => {
        handleLoadDataset('Case 1 — Small Realistic');
    }, []);

    const handleLoadDataset = async (caseName: string) => {
        setDataset(caseName);
        if (caseName === 'Custom Upload...') return;
        
        try {
            const res = await axios.post(`http://127.0.0.1:8000/load_dataset?case=${encodeURIComponent(caseName)}`);
            setDentists(res.data.dentists);
            setRooms(res.data.rooms);
            setRequests(res.data.requests);
            // Reset results on new dataset
            setScheduleResult(null); 
        } catch (err) {
            console.error(err);
            alert("Error loading dataset from backend.");
        }
    };

    const handleCustomUpload = async () => {
        const doctorsFile = doctorsRef.current?.files?.[0];
        const roomsFile = roomsRef.current?.files?.[0];
        const requestsFile = requestsRef.current?.files?.[0];

        if (!doctorsFile || !roomsFile || !requestsFile) {
            alert("Please select all 3 CSV files.");
            return;
        }

        const formData = new FormData();
        formData.append('doctors_file', doctorsFile);
        formData.append('rooms_file', roomsFile);
        formData.append('requests_file', requestsFile);

        setLoading(true);
        try {
            const res = await axios.post('http://127.0.0.1:8000/upload_custom', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDentists(res.data.dentists);
            setRooms(res.data.rooms);
            setRequests(res.data.requests);
            setScheduleResult(null);
            alert("Custom files uploaded successfully!");
        } catch (err) {
            console.error(err);
            alert("Error uploading files.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`http://127.0.0.1:8000/schedule?algorithm=${encodeURIComponent(algorithm)}`);
            setScheduleResult(res.data);
            addRunHistory(dataset, algorithm, res.data.runtime_ms);
        } catch (err) {
            console.error(err);
            alert("Error running scheduler. Ensure the backend is running and data is loaded.");
        } finally {
            setLoading(false);
        }
    };

    const FileStatus = ({ label, count }: { label: string, count: number }) => (
        <div className="flex items-center justify-between mb-8 last:mb-0">
            <div className="flex items-center gap-8">
                {count > 0 ? (
                    <Check size={16} className="text-secondary" style={{ color: 'var(--success)' }} />
                ) : (
                    <AlertCircle size={16} style={{ color: 'var(--neutral)' }} />
                )}
                <span className="small-text font-medium">{label}</span>
            </div>
            {count > 0 ? (
                <span className="chip chip-success" style={{ padding: '2px 8px', fontSize: '11px' }}>{count} Loaded</span>
            ) : (
                <span className="chip" style={{ padding: '2px 8px', fontSize: '11px' }}>Missing</span>
            )}
        </div>
    );

    return (
        <aside style={{ position: 'sticky', top: '88px', alignSelf: 'start' }}>
            <div className="card">
                <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <h3 className="subhead" style={{ fontSize: '20px' }}>Scheduling Engine</h3>
                    <p className="body-text" style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Configure constraints &amp; dataset</p>
                </div>
                <div className="card-body">
                    <div className="form-group mb-16">
                        <label>Dataset</label>
                        <select 
                            className="select" 
                            value={dataset} 
                            onChange={(e) => handleLoadDataset(e.target.value)}
                        >
                            <option>Case 1 — Small Realistic</option>
                            <option>Case 2 — Medium Synthetic</option>
                            <option>Case 3 — Large Synthetic</option>
                            <option>Case 4 — Huge Synthetic</option>
                            <option>Case 5 — Extreme Synthetic</option>
                            <option>Custom Upload...</option>
                        </select>
                    </div>

                    {dataset === 'Custom Upload...' && (
                        <div className="form-group mb-16 p-16" style={{ background: 'var(--background)', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                            <label className="caption-text mb-8">Upload doctors.csv</label>
                            <input type="file" accept=".csv" ref={doctorsRef} className="mb-16" style={{ fontSize: '12px', width: '100%' }} />
                            
                            <label className="caption-text mb-8">Upload rooms.csv</label>
                            <input type="file" accept=".csv" ref={roomsRef} className="mb-16" style={{ fontSize: '12px', width: '100%' }} />
                            
                            <label className="caption-text mb-8">Upload requests.csv</label>
                            <input type="file" accept=".csv" ref={requestsRef} className="mb-16" style={{ fontSize: '12px', width: '100%' }} />
                            
                            <button className="btn btn-secondary btn-full" onClick={handleCustomUpload} disabled={loading}>
                                Process Upload
                            </button>
                        </div>
                    )}

                    <div className="form-group mb-24 p-16" style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <label style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Required Data Files</label>
                        
                        <FileStatus label="doctors.csv" count={dentists.length} />
                        <FileStatus label="rooms.csv" count={rooms.length} />
                        <FileStatus label="requests.csv" count={requests.length} />
                    </div>

                    <div className="form-group mb-32">
                        <label>Search Algorithm</label>
                        <select 
                            className="select" 
                            value={algorithm} 
                            onChange={e => setAlgorithm(e.target.value)}
                        >
                            <option>Backtracking + Forward Checking</option>
                            <option>Standard Backtracking</option>
                            <option>Brute-Force Search</option>
                        </select>
                    </div>
                    
                    <button 
                        className="btn btn-primary btn-full"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? 'Running...' : 'Generate Schedule'}
                    </button>
                </div>
                <div className="card-footer text-center" style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="caption-text" style={{ color: 'var(--text-secondary)' }}>Using Local SQLite Database</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
