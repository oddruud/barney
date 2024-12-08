import React, { createContext, useContext, ReactNode } from 'react';
import { DataProxy } from '../services/DataProxyInterface';
import { DataProxySingleton } from '../services/DataProxy';
import Constants from 'expo-constants';

// Define the context type
interface DataContextType {
    dataProxy: DataProxy;
}

// Extend the ExpoConfig type to include the environment property
interface CustomExpoConfig {
    useDummyData?: boolean;
}

// Create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create the provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const useMockData = (Constants.expoConfig as CustomExpoConfig)?.useDummyData || false;
    const dataProxy = DataProxySingleton.getInstance(useMockData);

    return (
        <DataContext.Provider value={{ dataProxy }}>
            {children}
        </DataContext.Provider>
    );
};

// Custom hook to use the DataContext
export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
