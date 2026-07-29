"use client";

import { createContext, useContext, type PropsWithChildren } from "react";

// Hardcoded to backend mode — no more dummy/mock toggle
interface DataModeContextType {
  mode: "backend";
  setMode: (mode: string) => void;
  isDummy: false;
  isBackend: true;
}

const DataModeContext = createContext<DataModeContextType>({
  mode: "backend",
  setMode: () => {},
  isDummy: false,
  isBackend: true,
});

export function useDataMode() {
  return useContext(DataModeContext);
}

export function DataModeProvider({ children }: PropsWithChildren) {
  const value: DataModeContextType = {
    mode: "backend",
    setMode: () => {},
    isDummy: false,
    isBackend: true,
  };

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  );
}
