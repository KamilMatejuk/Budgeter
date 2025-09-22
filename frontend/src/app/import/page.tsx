import { Source } from "@/types/backend";
import { get } from "../api/fetch";
import ErrorToast from "@/components/toast/ErrorToast";
import { SourceProvider } from "@/components/import/ImportContext";
import SourceSelector from "@/components/import/SourceSelector";
import SourceImporter from "@/components/import/SourceImporter";
import Run from "@/components/import/Run";

export default async function Import() {
  const { response: sources, error } = await get<Source[]>("/api/source");

  return (
    <div className="w-full max-w-[960px] h-full flex flex-col mx-auto my-4 gap-4">
      {error ? (
        <ErrorToast message="Could not download sources" />
      ) : (
        <>
          <SourceProvider>
            <SourceSelector sources={sources} />
            <SourceImporter />
            <Run />
          </SourceProvider>
        </>
      )}
    </div>
  );
}
