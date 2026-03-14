"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StudentContextType {
    studentId: string | null;
    setStudentId: (id: string | null) => void;
    isEditPopupOpen: boolean;
    setIsEditPopupOpen: (isOpen: boolean) => void;
    isAddPopupOpen: boolean;
    setIsAddPopupOpen: (isOpen: boolean) => void;
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
    const [studentId, setStudentId] = useState<string | null>(null);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);

    return (
        <StudentContext.Provider
            value={{
                studentId,
                setStudentId,
                isEditPopupOpen,
                setIsEditPopupOpen,
                isAddPopupOpen,
                setIsAddPopupOpen,
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

export const useStudentContext = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudentContext must be used within a StudentContext.Provider');
    }
    return context;
};
