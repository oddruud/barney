import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserDetails } from '@/types/UserDetails';
import LocalUserData from '@/services/LocalUserData';
import {useData} from '@/contexts/DataContext';
interface UserContextType {
    user: UserDetails;
    setUser: (user: UserDetails) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDetails>();
    const {dataProxy} = useData();

    const defaultUser: UserDetails = { 
        id: "",
        email: "",
        userName: "",
        activeSince: "",
        fullName: "",
        bio: "",
        rating: 0,
        numberOfRatings: 0,
        profileImage: "",
        walksCompleted: 0,
        isVerified: false,
        latitude: 0,
        longitude: 0,
        lastCheckIn: ""
     };

    // Logic to perform when user changes
    useEffect(() => {
        if (user) {
            const localUserData = LocalUserData.getInstance();
            localUserData.saveUserData(user);

            const updateUser = async () => {
                await dataProxy.updateUser(user);
            }

            updateUser();
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user: user ?? defaultUser, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
