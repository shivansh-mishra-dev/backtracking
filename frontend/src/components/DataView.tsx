import React from 'react';
import { useAppContext } from '../context/AppContext';

const DataView: React.FC = () => {
    const { dentists, rooms, requests } = useAppContext();

    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="mb-8">
                <h1 className="section-heading">Dataset Explorer</h1>
                <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>View the constraints and requests loaded for the current benchmark case.</p>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>doctors.csv</h3></div>
                <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Dentist ID</th><th>Name</th><th>Start Time</th><th>End Time</th></tr></thead>
                        <tbody>
                            {dentists.length === 0 ? (
                                <tr><td colSpan={4} className="text-center" style={{ padding: '24px', color: 'var(--text-secondary)' }}>No data loaded. Please select a dataset.</td></tr>
                            ) : (
                                dentists.map(d => (
                                    <tr key={d.id}><td>{d.id}</td><td>{d.name}</td><td>{d.start_time}</td><td>{d.end_time}</td></tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>rooms.csv</h3></div>
                <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Operatory ID</th><th>Type</th></tr></thead>
                        <tbody>
                            {rooms.length === 0 ? (
                                <tr><td colSpan={2} className="text-center" style={{ padding: '24px', color: 'var(--text-secondary)' }}>No data loaded.</td></tr>
                            ) : (
                                rooms.map(r => (
                                    <tr key={r.id}><td>{r.id}</td><td>{r.room_type}</td></tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>requests.csv</h3></div>
                <div className="card-body p-0" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead><tr><th>Req ID</th><th>Patient</th><th>Dentist</th><th>Procedure</th><th>Requested Time</th><th>Duration (min)</th></tr></thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr><td colSpan={6} className="text-center" style={{ padding: '24px', color: 'var(--text-secondary)' }}>No data loaded.</td></tr>
                            ) : (
                                requests.map(req => (
                                    <tr key={req.id}>
                                        <td>{req.id}</td>
                                        <td>{req.patient}</td>
                                        <td>{req.dentist_id}</td>
                                        <td>{req.procedure}</td>
                                        <td>{req.requested_time}</td>
                                        <td>{req.duration_min}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataView;
