import React, { createContext, useState, useContext, ReactNode } from 'react';
import Constants from 'expo-constants';
import { Text } from 'react-native';


// Define an enum for the environment types
export enum Environment {
    Development = 'development',
    Staging = 'staging',
    Production = 'production'
}

interface EnvironmentContextType {
    environment: Environment;
    setEnvironment: (env: Environment) => void;
    version: string;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

// Extend the ExpoConfig type to include the environment property
interface CustomExpoConfig {
    environment?: string;
    useDummyData?: boolean;
}

export const EnvironmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const appEnvironment = (Constants.expoConfig as CustomExpoConfig)?.environment as Environment || Environment.Production;
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    const useDummyData = (Constants.expoConfig as CustomExpoConfig)?.useDummyData || false;
    
    const [environment, setEnvironment] = useState<Environment>(appEnvironment);

    return (
        <EnvironmentContext.Provider value={{ environment, setEnvironment, version: appVersion }}>
            {children}
            {environment === Environment.Development && false && (
                <Text style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 255, 0, 0.5)',
                    color: 'black',
                    padding: 5,
                    zIndex: 1000,
                    textAlign: 'center'
                }}>
                    Development - Version {appVersion} - Mock Data: {useDummyData ? 'Yes' : 'No'}
                </Text>
            )}
        </EnvironmentContext.Provider>
    );
};

export const useEnvironment = (): EnvironmentContextType => {
    const context = useContext(EnvironmentContext);
    if (!context) {
        throw new Error('useEnvironment must be used within an EnvironmentProvider');
    }
    return context;
};
