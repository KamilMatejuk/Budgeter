"use client";

import { Source } from "@/types/backend";
import { createContext, useContext, useState, ReactNode } from "react";

type ImportContextType = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  selectedSource: Source | null;
  setSelectedSource: (source: Source | null) => void;
};

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export const SourceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);

  return (
    <ImportContext.Provider value={{ selectedFile, setSelectedFile, selectedSource, setSelectedSource }}>
      {children}
    </ImportContext.Provider>
  );
};

export const useSelectedSourceAndFile = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error("useSource must be used within a SourceProvider");
  }
  return context;
};
