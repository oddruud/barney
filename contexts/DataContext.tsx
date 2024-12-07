import React, { createContext, useContext, ReactNode } from 'react';
import { DataProxy } from '../data/DataProxyInterface';
import { DataProxySingleton } from '../data/DataProxy';
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
    const useDummyData = (Constants.expoConfig as CustomExpoConfig)?.useDummyData || false;
    const dataProxy = DataProxySingleton.getInstance(useDummyData);

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
