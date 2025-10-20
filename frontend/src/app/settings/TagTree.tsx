import { get } from "../api/fetch";
import { TagWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import TagSubtree from "./TagSubtree";


export default async function TagTree() {
  const { response, error } = await get<TagWithId[]>("/api/tag", ["tag"]);

  return (
    error
      ? <ErrorToast message={`Could not download tags: ${error.message}`} />
      : <TagSubtree allTags={response} />
  );
}
