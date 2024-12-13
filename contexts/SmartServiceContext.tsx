import React, { createContext, useContext, ReactNode } from 'react';
import { SmartService } from '../services/SmartService';

// Define the context type
interface SmartServiceContextType {
    smartService: SmartService;
}

// Create the context
const SmartServiceContext = createContext<SmartServiceContextType | undefined>(undefined);

// Create the provider component
export const SmartServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const smartService = SmartService.getInstance();

    return (
        <SmartServiceContext.Provider value={{ smartService }}>
            {children}
        </SmartServiceContext.Provider>
    );
};

// Custom hook to use the SmartServiceContext
export const useSmartService = (): SmartServiceContextType => {
    const context = useContext(SmartServiceContext);
    if (!context) {
        throw new Error('useSmartService must be used within a SmartServiceProvider');
    }
    return context;
};
