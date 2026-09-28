import React from 'react';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import DataView from './components/DataView';
import VisualizerView from './components/VisualizerView';
import { useAppContext } from './context/AppContext';
import './index.css';

function AppContent() {
    const { activeTab } = useAppContext();

    return (
        <>
            <Navigation />
            <main className="container">
                <Sidebar />
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'data' && <DataView />}
                {activeTab === 'visualizer' && <VisualizerView />}
            </main>
        </>
    );
}

export default AppContent;
