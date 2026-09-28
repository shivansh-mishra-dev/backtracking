import React, { createContext, useContext, useState, ReactNode } from 'react';

type Tab = 'dashboard' | 'data' | 'visualizer';

interface AppContextType {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    return (
        <AppContext.Provider value={{ activeTab, setActiveTab }}>
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
