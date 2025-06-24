"use client";

import { Source } from "@/types/backend";
import { createContext, useContext, useState, ReactNode } from "react";

type SourceContextType = {
  selectedSource: Source | null;
  setSelectedSource: (source: Source | null) => void;
};

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export const SourceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  return (
    <SourceContext.Provider value={{ selectedSource, setSelectedSource }}>
      {children}
    </SourceContext.Provider>
  );
};

export const useSelectedSource = () => {
  const context = useContext(SourceContext);
  if (!context) {
    throw new Error("useSource must be used within a SourceProvider");
  }
  return context;
};
