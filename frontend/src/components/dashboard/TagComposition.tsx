import { getTagComposition } from "@/app/api/getters";
import ErrorToast from "../toast/ErrorToast";
import TagCompositionCharts from "./TagCompositionCharts";


export default async function TagComposition() {
  const { response, error } = await getTagComposition();
  if (error)
    return <ErrorToast message={`Could not download tag composition: ${error.message}`} />;
  return (
    <TagCompositionCharts data={response} />
  );
}
