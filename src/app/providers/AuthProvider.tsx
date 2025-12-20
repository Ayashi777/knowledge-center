import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserRole } from '../../types';
import { subscribeToAuthChanges } from '../../utils/auth';

interface AuthContextType {
    user: User | null;
    role: UserRole;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: 'guest', isLoading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>('guest');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((u, r) => {
            setUser(u);
            setRole(r);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
