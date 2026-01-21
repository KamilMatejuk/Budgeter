import { customRevalidateTag, patch, post } from "@/app/api/fetch";
import { Item } from "@/components/table/Table";
import { BackupRequest } from "@/types/backend";

export async function submit<FormatSchemaType, T extends Item>(
  url: string,
  values: FormatSchemaType,
  id?: string,
  callback?: () => void
) {
  const method = id ? patch : post;
  const { error } = await method(url, { _id: id, ...values } as unknown as T);
  if (error == null) return callback?.();
  alert(`Error: ${error}`);
}

export async function backupStateBeforeUpdate(title: string) {
  const { error: backupError } = await post(`/api/backup`, { name: title, auto: true } as BackupRequest);
  if (backupError != null) {
    alert(`Error: ${backupError}`);
    return false;
  }
  await customRevalidateTag('backup');
  return true;
}
