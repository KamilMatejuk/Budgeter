import { get } from "@/app/api/fetch";
import SourceSetup from "@/components/source/SourceSetup";
import Error from "@/components/toast/Error";
import { Source } from "@/types/backend";

export interface PageProps {
  params: Promise<{ name: string }>;
}

export default async function EditSource({ params }: PageProps) {
  const { name } = await params;
  const { response: source, error } = await get<Source>(`/api/source/${name}`);
  return (
    <div className="w-full max-w-[960px] h-full mx-auto my-4">
      {error ? (
        <Error message="Could not download source info" />
      ) : (
        <SourceSetup source={source} />
      )}
    </div>
  );
}
