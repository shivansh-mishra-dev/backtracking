import React from 'react';
import { useAppContext } from '../context/AppContext';

const OutputView: React.FC = () => {
    const { scheduleResult, requests, dentists, rooms } = useAppContext();

    if (!scheduleResult) {
        return (
            <div className="content">
                <div className="mb-8">
                    <h1 className="section-heading">Final Schedule Output</h1>
                </div>
                <div className="card p-24 text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No schedule to display. Please run the scheduling engine first.
                    </p>
                </div>
            </div>
        );
    }

    const activeAssignments = scheduleResult.status === 'success' 
        ? scheduleResult.assignments 
        : scheduleResult.partial_assignments || [];
    
    // Enrich assignments with patient, dentist, room, procedure details
    const rows = activeAssignments.map(assignment => {
        const req = requests.find(r => r.id === assignment.request_id);
        const room = rooms.find(r => r.id === assignment.room_id);
        const dentist = req ? dentists.find(d => d.id === req.dentist_id) : null;
        
        return {
            request_id: assignment.request_id,
            patient: req?.patient || 'Unknown',
            dentist: dentist?.name || 'Unknown',
            procedure: req?.procedure || 'Unknown',
            room: room?.room_type ? `${room.id} (${room.room_type})` : assignment.room_id,
            requested_time: req?.requested_time || '',
            scheduled_time: assignment.scheduled_time || '',
            duration: req?.duration_min || 0
        };
    });

    const handleExportCSV = () => {
        const headers = ['Request ID', 'Patient', 'Dentist', 'Procedure', 'Room', 'Requested Time', 'Scheduled Time', 'Duration (min)'];
        const csvRows = [
            headers.join(','),
            ...rows.map(row => 
                [row.request_id, `"${row.patient}"`, `"${row.dentist}"`, `"${row.procedure}"`, `"${row.room}"`, row.requested_time, row.scheduled_time, row.duration].join(',')
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

            {scheduleResult.status === 'failed' && (
                <div style={{ padding: '16px', marginBottom: '24px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', borderRadius: '8px' }}>
                    <strong>Warning:</strong> The algorithm failed to find a complete schedule. This table displays the <strong>partial</strong> schedule (the deepest valid state reached before getting stuck).
                </div>
            )}

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
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Requested</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Scheduled</th>
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
                                    <td style={{ padding: '12px 16px' }}>{row.requested_time}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: row.scheduled_time !== row.requested_time ? 600 : 400, color: row.scheduled_time !== row.requested_time ? 'var(--primary)' : undefined }}>{row.scheduled_time}</td>
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
