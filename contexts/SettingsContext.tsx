import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import {useData} from '@/contexts/DataContext';
import { Settings } from '@/types/Settings';
import LocalSettings from '@/services/LocalSettings';

interface SettingsContextType {
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>();
    const {dataProxy} = useData();
    
    const defaultSettings: Settings = {
        searchRadius: 70
    };

    // Logic to perform when user changes
    useEffect(() => {
        const localSettings = LocalSettings.getInstance();
        localSettings.getSettings().then((settings) => {
            if (settings) {
                setSettings(settings);
            } else {
                setSettings(defaultSettings);
                localSettings.saveSettings(defaultSettings);
            }
        });
    }, []);

    return (
        <SettingsContext.Provider value={{ settings: settings ?? defaultSettings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
