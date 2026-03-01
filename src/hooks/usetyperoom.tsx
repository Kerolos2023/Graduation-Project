"use client";

import { createContext, useContext, useState } from "react";

type RoomTypeContextType = {
  selectedRoomTypeId: string | null;
  setSelectedRoomTypeId: (id: string | null) => void;
};

const RoomTypeContext = createContext<RoomTypeContextType | undefined>(undefined);

export function RoomTypeProvider({ children }: { children: React.ReactNode }) {
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);

  return (
    <RoomTypeContext.Provider value={{ selectedRoomTypeId, setSelectedRoomTypeId }}>
      {children}
    </RoomTypeContext.Provider>
  );
}

export function useRoomType() {
  const context = useContext(RoomTypeContext);
  if (!context) {
    throw new Error("useRoomType must be used within RoomTypeProvider");
  }
  return context;
}