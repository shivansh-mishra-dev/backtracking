import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type Tab = 'dashboard' | 'data' | 'visualizer' | 'output';

export interface Dentist { id: string; name: string; start_time: string; end_time: string; }
export interface Room { id: string; room_type: string; }
export interface Request { id: string; patient: string; dentist_id: string; procedure: string; requested_time: string; duration_min: number; }

export interface ScheduleResult {
    status: string;
    error_reason?: string;
    algorithm: string;
    runtime_ms: number;
    states_explored: number;
    backtracks: number;
    assignments: { request_id: string; room_id: string }[];
    logs: { iteration: number; type: string; message: string }[];
}

interface AppContextType {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    
    // Dataset state
    dentists: Dentist[];
    setDentists: (d: Dentist[]) => void;
    rooms: Room[];
    setRooms: (r: Room[]) => void;
    requests: Request[];
    setRequests: (r: Request[]) => void;
    
    // Engine result state
    scheduleResult: ScheduleResult | null;
    setScheduleResult: (r: ScheduleResult | null) => void;
    
    // Performance history state
    runHistory: { dataset: string; algorithm: string; runtime_ms: number }[];
    addRunHistory: (dataset: string, algorithm: string, runtime_ms: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    
    const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(null);
    const [runHistory, setRunHistory] = useState<{ dataset: string; algorithm: string; runtime_ms: number }[]>([]);

    const addRunHistory = (dataset: string, algorithm: string, runtime_ms: number) => {
        setRunHistory(prev => {
            const newHistory = [...prev];
            // Remove existing entry for same dataset + algorithm to replace it
            const existingIdx = newHistory.findIndex(h => h.dataset === dataset && h.algorithm === algorithm);
            if (existingIdx >= 0) newHistory.splice(existingIdx, 1);
            
            newHistory.push({ dataset, algorithm, runtime_ms });
            return newHistory;
        });
    };

    return (
        <AppContext.Provider value={{ 
            activeTab, setActiveTab,
            dentists, setDentists,
            rooms, setRooms,
            requests, setRequests,
            scheduleResult, setScheduleResult,
            runHistory, addRunHistory
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
