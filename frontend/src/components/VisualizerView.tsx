import React, { useState } from 'react';
import { Play, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TreeNode {
    message: string;
    status: string;
    children: TreeNode[];
}

const VisualizerView: React.FC = () => {
    const { scheduleResult } = useAppContext();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const logs = scheduleResult?.logs || [];
    const maxSteps = logs.length > 0 ? logs.length - 1 : 0;

    const handleNext = () => {
        if (currentStepIndex < maxSteps) setCurrentStepIndex(currentStepIndex + 1);
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
    };

    const handleSkipToEnd = () => {
        setCurrentStepIndex(maxSteps);
    };

    // Build the active tree up to currentStepIndex
    const buildActiveTree = () => {
        const root: TreeNode[] = [];
        let currentLevel = root;
        const stack: TreeNode[][] = [];

        for (let i = 0; i <= currentStepIndex; i++) {
            const log = logs[i];
            if (!log) continue;

            if (log.type === 'STATE') {
                const newNode: TreeNode = { message: log.message, status: 'pending', children: [] };
                currentLevel.push(newNode);
                stack.push(currentLevel);
                currentLevel = newNode.children;
            } else {
                currentLevel.push({ message: log.message, status: log.type, children: [] });
                // If this call exhausted all options, it will return to parent
                if (log.message.startsWith('No valid assignments')) {
                    if (stack.length > 0) {
                        currentLevel = stack.pop()!;
                    }
                }
            }
        }
        return root;
    };

    const renderTree = (nodes: TreeNode[], depth = 0) => {
        return nodes.map((node, i) => (
            <div key={i} style={{ marginLeft: depth > 0 ? '20px' : '0', borderLeft: depth > 0 ? '1px solid var(--border)' : 'none', paddingLeft: depth > 0 ? '12px' : '0', marginBottom: '6px' }}>
                <div style={{
                    color: node.status === 'ERROR' ? '#f87171' :
                           node.status === 'SUCCESS' ? '#34d399' :
                           node.status === 'BACKTRACK' ? '#fbbf24' : '#e4e4e7',
                    fontSize: '13px',
                    fontFamily: 'monospace'
                }}>
                    {node.status === 'pending' ? '▼ ' : '├─ '}{node.message}
                </div>
                {node.children.length > 0 && renderTree(node.children, depth + 1)}
            </div>
        ));
    };

    return (
        <div className="content flex flex-col gap-24" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="mb-8">
                <h1 className="section-heading">Algorithm Visualizer</h1>
                <p className="body-text mt-4" style={{ color: 'var(--text-secondary)' }}>Step-by-step playback of the backtracking search iterations.</p>
            </div>

            {/* Controls */}
            <div className="card p-16 flex items-center justify-between">
                <div className="flex items-center gap-16">
                    <button className="btn btn-secondary" onClick={handlePrev} disabled={currentStepIndex === 0}>
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button className="btn btn-secondary" onClick={handleNext} disabled={currentStepIndex === maxSteps}>
                        Next <ChevronRight size={16} />
                    </button>
                    <button className="btn btn-secondary" onClick={handleSkipToEnd} disabled={currentStepIndex === maxSteps}>
                        Skip to End <SkipForward size={16} />
                    </button>
                </div>
                <div className="code-font" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Iteration: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentStepIndex}</span> / {maxSteps}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Visual Grid -> Now Search Tree */}
                <div className="card">
                    <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>Active Search Tree</h3></div>
                    <div className="card-body p-0" style={{ maxHeight: '600px', overflowY: 'auto', background: '#18181b', padding: '16px' }}>
                        {logs.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Run the scheduling algorithm to visualize the search tree.
                            </div>
                        ) : (
                            renderTree(buildActiveTree())
                        )}
                    </div>
                </div>

                {/* Log Output */}
                <div className="card">
                    <div className="card-header"><h3 className="subhead" style={{ fontSize: '18px' }}>Search Log</h3></div>
                    <div className="card-body p-0">
                        <div className="code-font flex-col-reverse" style={{ display: 'flex', flexDirection: 'column-reverse', fontSize: '13px', lineHeight: 1.8, padding: '16px', height: '600px', overflowY: 'auto', color: '#a1a1aa', background: '#18181b' }}>
                            {logs.length === 0 ? (
                                <div>Awaiting execution...</div>
                            ) : (
                                // Show logs in reverse so the latest is at the bottom of a reversed flex container (keeps scroll pinned to bottom)
                                [...logs.slice(0, currentStepIndex + 1)].reverse().map((log, idx) => {
                                    let color = '#e4e4e7';
                                    if (log.type === 'ERROR') color = '#f87171';
                                    else if (log.type === 'SUCCESS') color = '#34d399';
                                    else if (log.type === 'BACKTRACK') color = '#fbbf24';

                                    return (
                                        <div key={idx} style={{ color, marginTop: log.type === 'STATE' ? '8px' : '0' }}>
                                            {log.type === 'STATE' ? `[STATE ${log.iteration}] ` : '> '}
                                            {log.message}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisualizerView;
