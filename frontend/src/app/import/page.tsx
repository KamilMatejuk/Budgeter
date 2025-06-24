import { Source } from "@/types/backend";
import { get } from "../api/fetch";
import Error from "@/components/toast/Error";
import { SourceProvider } from "@/components/import/SourceSelectorContext";
import SourceSelector from "@/components/import/SourceSelector";

export default async function Import() {
  const { response: sources, error } = await get<Source[]>("/api/source");

  return (
    <div className="w-full max-w-[960px] h-full mx-auto my-4">
      {error ? (
        <Error message="Could not download sources" />
      ) : (
        <>
          <h2 className="text-2xl font-bold text-center mb-4">Import</h2>
          <SourceProvider>
            <SourceSelector sources={sources} />
          </SourceProvider>
        </>
      )}
    </div>
  );
}
