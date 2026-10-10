import React from 'react';
import PerformanceChart from './PerformanceChart';
import { useAppContext } from '../context/AppContext';
import GanttTimeline from './GanttTimeline';

const DashboardView: React.FC = () => {
    const { scheduleResult, rooms, dentists, requests, isScheduling, liveProgress } = useAppContext();

    // @ts-ignore
    const roomAssignments = rooms.map(room => {
        if (!scheduleResult) return { room, assignedReqs: [] as { req: typeof requests[0]; scheduled_time: string }[] };

        const activeAssignments = scheduleResult.status === 'success'
            ? scheduleResult.assignments
            : scheduleResult.partial_assignments || [];

        const assignmentsInRoom = activeAssignments.filter(a => a.room_id === room.id);

        const assignedReqs = assignmentsInRoom.map(a => {
            const req = requests.find(r => r.id === a.request_id)!;
            return { req, scheduled_time: a.scheduled_time };
        }).filter(item => item.req);

        // Sort chronologically by scheduled time
        assignedReqs.sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));

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
                        {isScheduling ? (
                            <span className="chip" style={{ background: 'var(--primary)', color: 'white' }}>Running...</span>
                        ) : !scheduleResult ? (
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
                        {isScheduling && liveProgress
                            ? `${(liveProgress.runtime_ms / 1000).toFixed(3)}s`
                            : scheduleResult
                                ? `${(scheduleResult.runtime_ms / 1000).toFixed(3)}s`
                                : '0.00s'}
                    </div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">States Explored</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>
                        {isScheduling && liveProgress
                            ? liveProgress.states_explored.toLocaleString()
                            : scheduleResult
                                ? scheduleResult.states_explored.toLocaleString()
                                : '0'}
                    </div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">Backtracks</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>
                        {isScheduling && liveProgress
                            ? liveProgress.backtracks.toLocaleString()
                            : scheduleResult
                                ? scheduleResult.backtracks.toLocaleString()
                                : '0'}
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
                        <div style={{ padding: '16px', overflowX: 'auto' }}>
                            {scheduleResult.status === 'cancelled' && (
                                <div style={{ padding: '16px', marginBottom: '16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: '13px', borderRadius: '8px' }}>
                                    <strong>✕ Run Stopped:</strong> {scheduleResult.error_reason} The partial schedule below shows the best state reached.
                                </div>
                            )}
                            {scheduleResult.status === 'failed' && (
                                <div style={{ padding: '16px', marginBottom: '16px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: '13px', borderRadius: '8px' }}>
                                    <strong>Displaying Partial Schedule:</strong> This shows the deepest valid state reached before the algorithm got stuck on Request <strong>{scheduleResult.deepest_req_id || 'Unknown'}</strong>.
                                </div>
                            )}
                            <GanttTimeline />
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
