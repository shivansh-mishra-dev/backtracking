import React from 'react';
import PerformanceChart from './PerformanceChart';
import { useAppContext } from '../context/AppContext';

const DashboardView: React.FC = () => {
    const { scheduleResult, rooms, dentists, requests } = useAppContext();

    // Group assignments by room
    const roomAssignments = rooms.map(room => {
        if (!scheduleResult) return { room, assignedReqs: [] };
        
        const reqIdsInRoom = scheduleResult.assignments
            .filter(a => a.room_id === room.id)
            .map(a => a.request_id);
            
        const assignedReqs = requests.filter(req => reqIdsInRoom.includes(req.id));
        
        // Sort chronologically (basic string sort for HH:MM works)
        assignedReqs.sort((a, b) => a.requested_time.localeCompare(b.requested_time));
        
        return { room, assignedReqs };
    });

    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="section-heading">Schedule Overview</h1>
                <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>Evaluate the output of the backtracking assignment algorithm.</p>
            </div>

            {scheduleResult?.status === 'failed' && (
                <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '16px', borderRadius: '8px' }}>
                    <strong>Scheduling Failed:</strong> {scheduleResult.error_reason || 'The algorithm exhausted all possibilities without finding a valid assignment.'}
                </div>
            )}

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <div className="card p-16">
                    <div className="overline-text">Status</div>
                    <div className="mt-8">
                        {!scheduleResult ? (
                            <span className="chip" style={{ background: 'var(--background)' }}>Pending</span>
                        ) : scheduleResult.status === 'success' ? (
                            <span className="chip chip-success">Complete Assignment</span>
                        ) : (
                            <span className="chip chip-error">Failed</span>
                        )}
                    </div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">Runtime</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>
                        {scheduleResult ? `${(scheduleResult.runtime_ms / 1000).toFixed(3)}s` : '0.00s'}
                    </div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">States Explored</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>
                        {scheduleResult ? scheduleResult.states_explored.toLocaleString() : '0'}
                    </div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">Backtracks</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>
                        {scheduleResult ? scheduleResult.backtracks.toLocaleString() : '0'}
                    </div>
                </div>
            </div>

            {/* Schedule View Grid */}
            <div className="card">
                <div className="card-header">
                    <h3 className="subhead" style={{ fontSize: '20px' }}>Operatory Assignments</h3>
                    <div className="flex gap-8">
                        <span className="chip">{dentists.length} Dentists</span>
                        <span className="chip">{rooms.length} Operatories</span>
                    </div>
                </div>
                <div className="card-body p-0">
                    {!scheduleResult ? (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Run the scheduling engine to view assignments.
                        </div>
                    ) : (
                        <div className="list">
                            {roomAssignments.map(({ room, assignedReqs }) => (
                                <div className="list-item" key={room.id}>
                                    <div style={{ width: '140px' }}>
                                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{room.id}</div>
                                        <div className="caption-text mt-4" style={{ color: 'var(--text-secondary)' }}>{room.room_type}</div>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                        {assignedReqs.length === 0 ? (
                                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <span className="caption-text" style={{ color: 'var(--neutral)', fontStyle: 'italic' }}>No appointments assigned</span>
                                            </div>
                                        ) : (
                                            assignedReqs.map(req => {
                                                const dentist = dentists.find(d => d.id === req.dentist_id);
                                                const label = `${req.requested_time} - ${dentist?.name || req.dentist_id} (${req.procedure})`;
                                                return (
                                                    <div key={req.id} className="appointment-block" style={{ flex: Math.max(1, req.duration_min / 30) }}>
                                                        {label}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Performance Chart */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h3 className="subhead" style={{ fontSize: '20px' }}>Runtime Comparison</h3>
                    <span className="caption-text" style={{ color: 'var(--text-secondary)' }}>Log Scale (ms)</span>
                </div>
                <div className="card-body" style={{ height: '400px', padding: '24px' }}>
                    <PerformanceChart />
                </div>
            </div>

        </div>
    );
};

export default DashboardView;
