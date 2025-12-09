import { Item } from "../table/Table";
import { patch, post } from "@/app/api/fetch";


// to be used in specific update modals e.g. submit<FormSchemaType, CardWithId>(url, values, item?._id)
export async function submit<FST, T extends Item>(url: string, values: FST, id?: string) {
    const method = id ? patch : post;
    const { error } = await method(url, { _id: id, ...values } as unknown as T);
    if (!error) return true;
    alert(`Error: ${error.message}`);
    return false;
}
