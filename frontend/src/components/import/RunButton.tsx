"use client";

import { useRouter } from "next/navigation";
import { useSelectedSourceAndFile } from "./ImportContext";
import { useState } from "react";
import ErrorToast from "../toast/ErrorToast";
import Papa from "papaparse";
import { Transaction } from "@/types/backend";
import { post } from "@/app/api/fetch";
import ButtonWithProgress from "../button/ButtonWithProgress";


// @ts-expect-error: Parameter 'obj' implicitly has an 'any' type.ts(7006)
export async function hashObject(obj): Promise<string> {
  const json = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

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
                const transaction: Transaction = {
                  hash: await hashObject(row),
                  card: row[selectedSource.field_name_card],
                  date: new Date(row[selectedSource.field_name_date]).toISOString(),
                  title: row[selectedSource.field_name_title],
                  organisation: row[selectedSource.field_name_organisation],
                  value: row[selectedSource.field_name_value_positive]
                    ? parseFloat(row[selectedSource.field_name_value_positive])
                    : -parseFloat(row[selectedSource.field_name_value_negative]),
                  tags: [],
                };

                if (!transaction.organisation) {
                  transaction.organisation = transaction.title;
                  transaction.title = "";
                }

                const { error } = await post("/api/transaction", transaction);
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
      <ButtonWithProgress current={counter} max={maxCounter} text="Import" onClick={handleImport} disabled={!selectedFile || !selectedSource} />
    </>
  );
}


// TODO
// * move accounts to products
// * load positive and negative values correctly
// * distinguish moving between accounts and normal transactions


// top bar - page title
// left sidebar - logo, current balance, menu (dashboards, import, settings, predictions, help)
// https://cdn.dribbble.com/userupload/4307413/file/still-328dbb0cf5ae384f442c56491df7505d.png
// settings - black title, grey descriptions, table for each type - each edit is a new screen
