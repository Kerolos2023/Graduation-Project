"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AcademicContextType {
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;
  selectedSemesterId: string | null;
  setSelectedSemesterId: (id: string | null) => void;
  selectedYearId: string | null;
  setSelectedYearId: (id: string | null) => void;
  selectedTermId: string | null;
  setSelectedTermId: (id: string | null) => void;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  return (
    <AcademicContext.Provider
      value={{
        selectedProgramId,
        setSelectedProgramId,
        selectedSemesterId,
        setSelectedSemesterId,
        selectedYearId,
        setSelectedYearId,
        selectedTermId,
        setSelectedTermId,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademicContext = () => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error("useAcademicContext must be used within AcademicProvider");
  }
  return context;
};
