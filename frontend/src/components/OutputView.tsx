import React from 'react';
import { useAppContext } from '../context/AppContext';

const OutputView: React.FC = () => {
    const { scheduleResult, requests, dentists, rooms } = useAppContext();

    if (!scheduleResult || scheduleResult.status === 'failed') {
        return (
            <div className="content">
                <div className="mb-8">
                    <h1 className="section-heading">Final Schedule Output</h1>
                </div>
                <div className="card p-24 text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No successful schedule to display. Please generate a valid schedule first.
                    </p>
                </div>
            </div>
        );
    }

    const assignments = scheduleResult.assignments;
    
    // Enrich assignments with patient, dentist, room, procedure details
    const rows = assignments.map(assignment => {
        const req = requests.find(r => r.id === assignment.request_id);
        const room = rooms.find(r => r.id === assignment.room_id);
        const dentist = req ? dentists.find(d => d.id === req.dentist_id) : null;
        
        return {
            request_id: assignment.request_id,
            patient: req?.patient || 'Unknown',
            dentist: dentist?.name || 'Unknown',
            procedure: req?.procedure || 'Unknown',
            room: room?.room_type ? `${room.id} (${room.room_type})` : assignment.room_id,
            start: req?.requested_time || '',
            duration: req?.duration_min || 0
        };
    });

    const handleExportCSV = () => {
        const headers = ['Request ID', 'Patient', 'Dentist', 'Procedure', 'Room', 'Start Time', 'Duration (min)'];
        const csvRows = [
            headers.join(','),
            ...rows.map(row => 
                [row.request_id, `"${row.patient}"`, `"${row.dentist}"`, `"${row.procedure}"`, `"${row.room}"`, row.start, row.duration].join(',')
            )
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'schedule_output.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="section-heading">Final Schedule Output</h1>
                    <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>View and export the generated schedule assignments.</p>
                </div>
                <button className="btn btn-primary" onClick={handleExportCSV}>Export CSV</button>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Req ID</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Patient</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Dentist</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Procedure</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Room</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Time</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px 16px' }} className="code-font">{row.request_id}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.patient}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.dentist}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.procedure}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.room}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.start}</td>
                                    <td style={{ padding: '12px 16px' }}>{row.duration} min</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OutputView;
