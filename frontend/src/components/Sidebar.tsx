import React from 'react';
import { Check } from 'lucide-react';

const Sidebar: React.FC = () => {
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
                        <select className="select">
                            <option>Case 1 — Small Realistic</option>
                            <option>Case 2 — Medium Synthetic</option>
                            <option>Case 3 — Large Synthetic</option>
                            <option>Case 4 — Huge Synthetic</option>
                            <option>Case 5 — Extreme Synthetic</option>
                            <option>Custom Upload...</option>
                        </select>
                    </div>

                    <div className="form-group mb-24 p-16" style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <label style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Required Data Files</label>
                        
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-8">
                                <Check size={16} className="text-secondary" style={{ color: 'var(--text-secondary)' }} />
                                <span className="small-text font-medium">doctors.csv</span>
                            </div>
                            <span className="chip chip-success" style={{ padding: '2px 8px', fontSize: '11px' }}>Loaded</span>
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-8">
                                <Check size={16} style={{ color: 'var(--text-secondary)' }} />
                                <span className="small-text font-medium">rooms.csv</span>
                            </div>
                            <span className="chip chip-success" style={{ padding: '2px 8px', fontSize: '11px' }}>Loaded</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <Check size={16} style={{ color: 'var(--text-secondary)' }} />
                                <span className="small-text font-medium">requests.csv</span>
                            </div>
                            <span className="chip chip-success" style={{ padding: '2px 8px', fontSize: '11px' }}>Loaded</span>
                        </div>
                    </div>

                    <div className="form-group mb-32">
                        <label>Search Algorithm</label>
                        <select className="select">
                            <option>Backtracking + Forward Checking</option>
                            <option>Standard Backtracking</option>
                            <option>Brute-Force Search</option>
                        </select>
                    </div>
                    
                    <button className="btn btn-primary btn-full">Generate Schedule</button>
                </div>
                <div className="card-footer text-center" style={{ display: 'flex', justifyContent: 'center' }}>
                    <span className="caption-text" style={{ color: 'var(--text-secondary)' }}>Using Local SQLite Database</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
