import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserDetails } from '@/types/UserDetails';

interface UserContextType {
    user: UserDetails;
    setUser: (user: UserDetails) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDetails>();
    const defaultUser: UserDetails = { 
        id: 0,
        userName: "Dummy User",
        activeSince: "2024-01-01",
        fullName: "Dummy User",
        bio: "Dummy User",
        rating: 4.5,
        numberOfRatings: 10,
        profileImage: "",
        walksCompleted: 0
     };

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
