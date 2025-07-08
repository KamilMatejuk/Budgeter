import { Source } from "@/types/backend";
import { get } from "../api/fetch";
import Error from "@/components/toast/Error";
import { SourceProvider } from "@/components/import/ImportContext";
import SourceSelector from "@/components/import/SourceSelector";
import SourceImporter from "@/components/import/SourceImporter";

export default async function Import() {
  const { response: sources, error } = await get<Source[]>("/api/source");

  return (
    <div className="w-full max-w-[960px] h-full flex flex-col mx-auto my-4 gap-4">
      {error ? (
        <Error message="Could not download sources" />
      ) : (
        <>
          <h2 className="text-2xl font-bold text-center mb-4">Import</h2>
          <SourceProvider>
            <SourceSelector sources={sources} />
            <SourceImporter />
          </SourceProvider>
        </>
      )}
    </div>
  );
}
