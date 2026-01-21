import ErrorToast from "@/components/toast/ErrorToast";
import TagSubtree from "./TagSubtree";
import { getTags } from "../api/getters";
import { MdAdd } from "react-icons/md";
import NewTagSubtree from "./NewTagSubtree";


export default async function TagTree() {
  const { response, error } = await getTags();

  return error != null
    ? <ErrorToast message={`Could not download tags: ${error}`} />
    : (
      <div className="flex flex-wrap items-start gap-16">
        {response.filter((tag) => tag.parent === null).map((tag) => (
          <div key={tag._id} className="mb-4 shrink-0">
            <TagSubtree parent={tag} allTags={response} first />
          </div>
        ))}
        <div className="mb-4 shrink-0"><NewTagSubtree /></div>
      </div>
    );
}
