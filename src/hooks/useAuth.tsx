'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    email: string | null;
    setEmail: (email: string | null) => void;
    userName: string | null;
    setUserName: (userName: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [email, setEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{ email, setEmail, userName, setUserName }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
