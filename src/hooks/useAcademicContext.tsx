"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface AcademicContextType {
  selectedProgramId: string | null;
  setSelectedProgramId: (id: string | null) => void;

  selectedSemesterId: string | null;
  setSelectedSemesterId: (id: string | null) => void;

  selectedSemesterName: string | null;
  setSelectedSemesterName: (name: string | null) => void;

  selectedYearId: string | null;
  setSelectedYearId: (id: string | null) => void;

  selectedTermId: string | null;
  setSelectedTermId: (id: string | null) => void;

  isAcademicReady: boolean;
}

const AcademicContext = createContext<AcademicContextType | undefined>(
  undefined
);

export const AcademicProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [selectedSemesterName, setSelectedSemesterName] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  // 🔥 READY FLAG (IMPORTANT)
  const isAcademicReady = !!selectedProgramId && !!selectedSemesterId;

  return (
    <AcademicContext.Provider
      value={{
        selectedProgramId,
        setSelectedProgramId,
        selectedSemesterId,
        setSelectedSemesterId,
        selectedSemesterName,
        setSelectedSemesterName,
        selectedYearId,
        setSelectedYearId,
        selectedTermId,
        setSelectedTermId,
        isAcademicReady,
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