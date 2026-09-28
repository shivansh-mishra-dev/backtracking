import React from 'react';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

const VisualizerView: React.FC = () => {
    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="mb-8">
                <h1 className="section-heading">Algorithm Visualizer</h1>
                <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>Step-by-step playback of the backtracking search iterations.</p>
            </div>

            {/* Controls */}
            <div className="card p-16 flex items-center justify-between">
                <div className="flex items-center gap-16">
                    <button className="btn btn-secondary">
                        <Play size={16} fill="currentColor" />
                        <span style={{ marginLeft: '8px' }}>Play</span>
                    </button>
                    <button className="btn btn-secondary">
                        <ChevronLeft size={16} />
                        Prev
                    </button>
                    <button className="btn btn-secondary">
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
                <div className="code-font" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Iteration: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>3039</span> / 3042
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Visual Grid */}
                <div className="card">
                    <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>Current Assignment State</h3></div>
                    <div className="card-body p-0">
                        <div className="list">
                            <div className="list-item">
                                <div style={{ width: '100px', fontWeight: 500, fontSize: '14px' }}>Operatory 1</div>
                                <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                    <div className="appointment-block" style={{ flex: 2 }}>Req_1 (09:00)</div>
                                    <div className="appointment-block" style={{ flex: 3, opacity: 0.5, border: '1px dashed var(--primary)', background: 'transparent' }}>Evaluating...</div>
                                </div>
                            </div>
                            <div className="list-item">
                                <div style={{ width: '100px', fontWeight: 500, fontSize: '14px' }}>Operatory 2</div>
                                <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                    <div style={{ flex: 1 }}></div>
                                    <div className="appointment-block appointment-warning" style={{ flex: 1, outline: '2px solid var(--error)' }}>Req_42 (14:00) - Conflict</div>
                                </div>
                            </div>
                            <div className="list-item">
                                <div style={{ width: '100px', fontWeight: 500, fontSize: '14px' }}>Operatory 3</div>
                                <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
                                    <div style={{ flex: 1 }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Log Output */}
                <div className="card">
                    <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>Search Log</h3></div>
                    <div className="card-body p-0">
                        <div className="code-font" style={{ fontSize: '13px', lineHeight: 1.8, padding: '16px', height: '320px', overflowY: 'auto', color: '#a1a1aa', background: '#18181b' }}>
                            <div>[STATE 3038] Assigned Req_41 to Op_1</div>
                            <div style={{ color: '#e4e4e7', marginTop: '8px' }}>[STATE 3039] Attempting to place Req_42...</div>
                            <div>&gt; Try Op_1 @ 14:00 -&gt; <span style={{ color: '#f87171' }}>Conflict (Room Overlap)</span></div>
                            <div>&gt; Try Op_2 @ 14:00 -&gt; <span style={{ color: '#f87171' }}>Conflict (Wrong Type)</span></div>
                            <div className="mt-8 flex items-center gap-8" style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                                <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#fbbf24', borderRadius: '50%', boxShadow: '0 0 8px #fbbf24' }}></span>
                                EVALUATING: Op_3 @ 14:00
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualizerView;
