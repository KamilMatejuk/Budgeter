import ErrorToast from "../toast/ErrorToast";
import { getMonthTagComparison } from "@/app/api/getters";
import TagComparisonChart from "./TagComparisonChart";


export default async function TagComparison() {
  const { response, error } = await getMonthTagComparison(); // same data as month comparison
  if (error)
    return <ErrorToast message={`Could not download tag comparison: ${error.message}`} />;
  return (
    <TagComparisonChart data={response} />
  );
}
