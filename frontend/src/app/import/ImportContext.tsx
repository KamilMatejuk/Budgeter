"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ImportContextType = {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  selectedOwner: string;
  setSelectedOwner: (owner: string) => void;
};

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export const SourceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");

  return (
    <ImportContext.Provider value={{
      selectedFile, setSelectedFile,
      selectedSource, setSelectedSource,
      selectedOwner, setSelectedOwner
    }}>
      {children}
    </ImportContext.Provider>
  );
};

export const useImportContext = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error("useImportContext must be used within a SourceProvider");
  }
  return context;
};
