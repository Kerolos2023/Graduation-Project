import { createContext, useContext } from 'react';

export interface StudentContextType {
    studentId: string | null;
    setStudentId: (id: string | null) => void;
    isEditPopupOpen: boolean;
    setIsEditPopupOpen: (isOpen: boolean) => void;
}

export const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const useStudentContext = () => {
    const context = useContext(StudentContext);
    if (!context) {
        throw new Error('useStudentContext must be used within a StudentContext.Provider');
    }
    return context;
};
