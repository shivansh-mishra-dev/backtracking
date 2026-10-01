// React import not needed with new JSX transform
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import DataView from './components/DataView';
import VisualizerView from './components/VisualizerView';
import OutputView from './components/OutputView';
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
                {activeTab === 'output' && <OutputView />}
            </main>
        </>
    );
}

export default AppContent;
