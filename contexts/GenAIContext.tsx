import React, { createContext, useContext, ReactNode } from 'react';
import { GenAIService } from '../services/GenAIService';
import Constants from 'expo-constants';

// Define the context type
interface GenAIContextType {
    genAIService: GenAIService;
}
// Extend the ExpoConfig type to include the environment property
interface CustomExpoConfig {
    genAIserver?: string;
}

// Create the context
const GenAIContext = createContext<GenAIContextType | undefined>(undefined);

// Create the provider component
export const GenAIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const genAIService = GenAIService.getInstance();
    const genAIServerUrl = "http://roboruud.nl:8181"; //(Constants.expoConfig as CustomExpoConfig)?.genAIserver || 'http://localhost:8080';
    
    if (genAIServerUrl) {
        GenAIService.setServerUrl(genAIServerUrl);
    }

    return (
        <GenAIContext.Provider value={{ genAIService }}>
            {children}
        </GenAIContext.Provider>
    );
};

// Custom hook to use the GenAIContext
export const useGenAI = (): GenAIContextType => {
    const context = useContext(GenAIContext);
    if (!context) {
        throw new Error('useGenAI must be used within a GenAIProvider');
    }
    return context;
};
