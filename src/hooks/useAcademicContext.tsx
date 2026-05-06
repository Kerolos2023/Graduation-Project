"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

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
  
  academicVersion: number;
  incrementAcademicVersion: () => void;
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
  const [academicVersion, setAcademicVersion] = useState(0);

  const isAcademicReady = !!selectedProgramId && !!selectedSemesterId;

  const incrementAcademicVersion = useCallback(() => {
    setAcademicVersion(v => v + 1);
  }, []);

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
        academicVersion,
        incrementAcademicVersion,
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