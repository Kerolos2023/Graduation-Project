"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface StaffContextType {
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  currentAcademicYearId: string | null;
  setCurrentAcademicYearId: (id: string | null) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string | null>(null);

  return (
    <StaffContext.Provider
      value={{
        selectedProgramId,
        setSelectedProgramId,
        currentAcademicYearId,
        setCurrentAcademicYearId,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
};

export const useStaffContext = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaffContext must be used within StaffProvider");
  }
  return context;
};
