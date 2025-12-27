import ErrorToast from "@/components/toast/ErrorToast";
import TagSubtree from "./TagSubtree";
import { getTags } from "../api/getters";


export default async function TagTree() {
  const { response, error } = await getTags();

  return error
    ? <ErrorToast message={`Could not download tags: ${error.message}`} />
    : <TagSubtree allTags={response} />;
}
