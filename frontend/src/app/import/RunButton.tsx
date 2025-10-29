"use client";

import { useRouter } from "next/navigation";
import { useSelectedSourceAndFile } from "./ImportContext";
import { useState } from "react";
import ErrorToast from "../../components/toast/ErrorToast";
import Papa from "papaparse";
import { post } from "@/app/api/fetch";
import ButtonWithProgress from "../../components/button/ButtonWithProgress";


export default function RunButton() {
  const router = useRouter();
  const { selectedFile, selectedSource } = useSelectedSourceAndFile();
  const [error, setError] = useState<Error | string | null>(null);
  const [counter, setCounter] = useState(0);
  const [maxCounter, setMaxCounter] = useState(0);

  async function handleImport() {
    if (!selectedFile || !selectedSource) {
      setError("Select a file and a source before importing.");
      return;
    }
    try {
      await new Promise((resolve, reject) => {
        Papa.parse(selectedFile, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const rows = results.data as Record<string, string>[];
              setMaxCounter(rows.length);
              for (const [index, row] of rows.entries()) {
                setCounter(index + 1);
                const { error } = await post(`/api/source/${selectedSource}`, row);
                if (error) {
                  reject(new Error(error.message)); // reject the whole Promise
                  return;
                }
              }
              resolve(null);
            } catch (e) {
              reject(e);
            }
          },
          error: (err) => reject(new Error(err.message)),
        });
      });
      // Redirect if successful
      router.push("/");
    } catch (err) {
      setError((err as Error).message);
    }
  }


  return error ? (
    <ErrorToast message={error instanceof Error ? error.message : error} />
  ) : (
    <>
      <ButtonWithProgress
        current={counter}
        max={maxCounter}
        text="Import"
        onClick={handleImport}
        disabled={!selectedFile || !selectedSource}
        action="positive"
      />
    </>
  );
}
