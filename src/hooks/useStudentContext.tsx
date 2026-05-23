"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type ActiveTab =
  | "personal"
  | "parent"
  | "contact"
  | "military"
  | "qualification"
  | "change-program"
  | "graduation-project"
  ;

interface StudentContextType {
  studentId: string | null;
  setStudentId: (id: string | null) => void;

  isEditPopupOpen: boolean;
  setIsEditPopupOpen: (isOpen: boolean) => void;

  isAddPopupOpen: boolean;
  setIsAddPopupOpen: (isOpen: boolean) => void;

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const StudentContext = createContext<StudentContextType | undefined>(
  undefined
);

export const StudentProvider = ({ children }: { children: ReactNode }) => {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);

  // default = personal
  const [activeTab, setActiveTab] = useState<ActiveTab>("personal");

  return (
    <StudentContext.Provider
      value={{
        studentId,
        setStudentId,
        isEditPopupOpen,
        setIsEditPopupOpen,
        isAddPopupOpen,
        setIsAddPopupOpen,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudentContext must be used within a StudentProvider");
  }
  return context;
};