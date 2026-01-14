"use client";

import { useImportContext } from "./ImportContext";
import { Dispatch, SetStateAction, useState } from "react";
import ErrorToast from "../../components/toast/ErrorToast";
import Papa from "papaparse";
import { post } from "@/app/api/fetch";
import ButtonWithProgress from "../../components/button/ButtonWithProgress";
import { backupStateBeforeUpdate } from "@/components/modal/update/utils";
import { TransactionWithId } from "@/types/backend";
import InfoToast from "@/components/toast/InfoToast";
import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import ButtonWithLink from "@/components/button/ButtonWithLink";
import { Source } from "@/types/enum";

async function importFile(
  file: File,
  source: Source,
  owner: string,
  setCounter: Dispatch<SetStateAction<number>>,
  setMaxCounter: Dispatch<SetStateAction<number>>,
  setImported: Dispatch<SetStateAction<number>>
) {
  await new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          setMaxCounter(rows.length);
          for (const [index, row] of rows.entries()) {
            setCounter(index + 1);
            const url = `/api/source/${source}/` + (source === Source.REVOLUT ? encodeURIComponent(owner) : "");
            const { response, error } = await post<TransactionWithId>(url, row);
            if (error) {
              reject(new Error(error.message)); // reject the whole Promise
              return;
            }
            if (response.tags?.length == 0) setImported((prev) => prev + 1);
          }
          resolve(null);
        } catch (e) {
          reject(e);
        }
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}


export default function RunButton() {
  const { selectedFile, selectedSource, selectedOwner } = useImportContext();
  const [state, setState] = useState<'start' | 'importing' | 'finish' | 'failed'>('start');
  const [error, setError] = useState<Error | string | null>(null);
  const [counter, setCounter] = useState(0);
  const [maxCounter, setMaxCounter] = useState(0);
  const [imported, setImported] = useState<number>(0);

  const setFailed = (message: string) => { setError(message); setState('failed') }

  async function handleReset() {
    setError(null);
    setState('start');
    setCounter(0);
    setMaxCounter(0);
    setImported(0);
  }

  async function handleImport() {
    if (!selectedFile || !selectedSource) return;
    if (selectedSource === Source.REVOLUT && !selectedOwner) return;
    setState('importing');
    try {
      const backupName = `Before import of "${selectedFile.name.toLowerCase()}"`;
      if (!await backupStateBeforeUpdate(backupName)) throw new Error("Backup failed. Import aborted.");
      await importFile(selectedFile, selectedSource as Source, selectedOwner, setCounter, setMaxCounter, setImported);
      setState('finish');
    } catch (err) {
      setFailed((err as Error).message);
    }
  }

  return (
    <>
      {state === 'failed' && error && (
        <>
          <ErrorToast message={`Row ${counter + 1}: ${error instanceof Error ? error.message : error}`} />
          <ButtonWithLoader
            text="Retry"
            onClick={handleReset}
            action="negative"
            className="w-full mt-2"
          />
        </>
      )}
      {(state === 'start' || state === 'importing') && (
        <ButtonWithProgress
          current={counter}
          max={maxCounter}
          text="Import"
          onClick={handleImport}
          disabled={!selectedFile || !selectedSource || (selectedSource === Source.REVOLUT && !selectedOwner) || error !== null}
          action="positive"
        />
      )}
      {state === 'finish' && (
        <>
          <InfoToast message={`Import completed. ${imported} new transactions imported.`} />
          <ButtonWithLink
            text="See new transactions"
            href="/transactions/new"
            action="neutral"
            className="w-full mt-2"
          />
        </>
      )}
    </>
  );
}
