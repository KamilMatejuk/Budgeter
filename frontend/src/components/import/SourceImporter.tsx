"use client";

import { useState, useRef, useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { IoMdClose } from "react-icons/io";
import { useSelectedSourceAndFile } from "./ImportContext";

export default function SourceImporter() {
  const { selectedFile, setSelectedFile } = useSelectedSourceAndFile();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
    }
  }, [setSelectedFile]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    [setSelectedFile]
  );

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (
    e: React.DragEvent<HTMLDivElement>,
    dragging: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  };

  return (
    <div className="bg-second-bg p-4 rounded-xl flex flex-col items-center gap-4 w-full">
      <h2 className="text-lg font-semibold">Select CSV File</h2>
      <div
        className={twMerge(
          " w-full px-4 py-2 rounded-xl text-center",
          isDragging ? "" : "bg-first-bg"
        )}
        onDrop={handleDrop}
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
      >
        {selectedFile ? (
          <div className="flex items-center justify-center gap-2">
            {selectedFile.name}
            <IoMdClose
              size={12}
              className="cursor-pointer"
              onClick={() => setSelectedFile(null)}
            />
          </div>
        ) : (
          <>
            Drag & drop your file here
            <br />
            or{" "}
            <span
              className="text-blue-500 underline cursor-pointer"
              onClick={openFileDialog}
            >
              click to browse
            </span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
