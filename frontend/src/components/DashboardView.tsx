import React from 'react';
import PerformanceChart from './PerformanceChart';

const DashboardView: React.FC = () => {
    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="section-heading">Schedule Overview</h1>
                <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>Evaluate the output of the backtracking assignment algorithm.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <div className="card p-16">
                    <div className="overline-text">Status</div>
                    <div className="mt-8"><span className="chip chip-success">Complete Assignment</span></div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">Runtime</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>0.14s</div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">States Explored</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>3,042</div>
                </div>
                <div className="card p-16">
                    <div className="overline-text">Backtracks</div>
                    <div className="display-font mt-4" style={{ fontSize: '28px' }}>89</div>
                </div>
            </div>

            {/* Schedule View Grid */}
            <div className="card">
                <div className="card-header">
                    <h3 className="subhead" style={{ fontSize: '20px' }}>Operatory Assignments</h3>
                    <div className="flex gap-8">
                        <span className="chip">3 Dentists</span>
                        <span className="chip">8 Operatories</span>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="list">
                        <div className="list-item">
                            <div style={{ width: '140px' }}>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>Operatory 1</div>
                                <div className="caption-text mt-4" style={{ color: 'var(--text-secondary)' }}>General</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                <div className="appointment-block" style={{ flex: 2 }}>09:00 - Smith (Cleaning)</div>
                                <div className="appointment-block" style={{ flex: 3 }}>10:00 - Jones (Filling)</div>
                                <div className="appointment-block" style={{ flex: 1 }}>12:00 - Doe (X-Ray)</div>
                            </div>
                        </div>
                        <div className="list-item">
                            <div style={{ width: '140px' }}>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>Operatory 2</div>
                                <div className="caption-text mt-4" style={{ color: 'var(--text-secondary)' }}>Endodontic</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}></div>
                                <div className="appointment-block appointment-warning" style={{ flex: 4 }}>09:30 - Doe (Root Canal)</div>
                                <div className="appointment-block" style={{ flex: 2 }}>14:00 - Smith (Crown)</div>
                            </div>
                        </div>
                        <div className="list-item">
                            <div style={{ width: '140px' }}>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>Operatory 3</div>
                                <div className="caption-text mt-4" style={{ color: 'var(--text-secondary)' }}>Imaging</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                                <div className="appointment-block" style={{ flex: 1 }}>09:00 - Jones (X-Ray)</div>
                                <div style={{ flex: 2 }}></div>
                                <div className="appointment-block" style={{ flex: 1 }}>11:00 - Smith (X-Ray)</div>
                                <div style={{ flex: 2 }}></div>
                            </div>
                        </div>
                        <div className="list-item">
                            <div style={{ width: '140px' }}>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>Operatory 4</div>
                                <div className="caption-text mt-4" style={{ color: 'var(--text-secondary)' }}>General</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                <span className="caption-text" style={{ color: 'var(--neutral)', fontStyle: 'italic' }}>No appointments assigned</span>
                            </div>
                        </div>
                    </div>
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
