import React from 'react';
import { Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navigation: React.FC = () => {
    const { activeTab, setActiveTab } = useAppContext();

    return (
        <nav className="nav">
            <div className="nav-logo">DentalSched</div>
            <div className="nav-links">
                <a 
                    className={activeTab === 'dashboard' ? 'active' : ''} 
                    onClick={() => setActiveTab('dashboard')}
                >
                    Dashboard
                </a>
                <a 
                    className={activeTab === 'data' ? 'active' : ''} 
                    onClick={() => setActiveTab('data')}
                >
                    View Data
                </a>
                <a 
                    className={activeTab === 'visualizer' ? 'active' : ''} 
                    onClick={() => setActiveTab('visualizer')}
                >
                    Visualizer
                </a>
                <a 
                    className={activeTab === 'output' ? 'active' : ''} 
                    onClick={() => setActiveTab('output')}
                >
                    Output
                </a>
            </div>
            <div className="nav-actions">
                <div className="search-bar">
                    <Search size={16} />
                    <span style={{ marginLeft: '8px' }}>Search...</span>
                    <span className="badge">⌘K</span>
                </div>
                <div className="avatar">A</div>
            </div>
        </nav>
    );
};

export default Navigation;
