import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { GlobalEventsEmitter } from '@/controllers/GlobalEventsEmitter';

enum GlobalEventEnum {
    VIDEO_LOADED = "VIDEO_LOADED",
    USER_SIGNED_IN = "USER_SIGNED_IN",
    USER_SIGNED_OUT = "USER_SIGNED_OUT",
}

// Create a context
const GlobalEventsContext = createContext<GlobalEventsEmitter | undefined>(undefined);

// Create a provider component
export const GlobalEventsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const globalEventsInstance = GlobalEventsEmitter.getInstance();

    return (
        <GlobalEventsContext.Provider value={globalEventsInstance}>
            {children}
        </GlobalEventsContext.Provider>
    );
};

// Custom hook to use the GlobalEvents context
export const useGlobalEventsEmitter = (): GlobalEventsEmitter => {
    const context = useContext(GlobalEventsContext);
    if (!context) {
        throw new Error('useGlobalEvents must be used within a GlobalEventsProvider');
    }
    return context;
};

export { GlobalEventEnum };