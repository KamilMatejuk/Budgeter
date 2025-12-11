import { patch, post } from "@/app/api/fetch";
import { Item } from "@/components/table/Table";

export async function submit<FormatSchemaType, T extends Item>(
  url: string,
  values: FormatSchemaType,
  id?: string,
  callback?: () => void
) {
  const method = id ? patch : post;
  const { error } = await method(url, { _id: id, ...values } as unknown as T);
  if (!error) return callback?.();
  alert(`Error: ${error.message}`);
}
