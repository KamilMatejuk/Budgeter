'use client';

import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { z } from "zod";
import Button from "@/components/button/Button";
import { IoReload, IoTrashOutline } from "react-icons/io5";
import { pushFiltersToUrl } from "./utils";
import { customRevalidateTag } from "../api/fetch";
import { TagsFiltersProps } from "../search/Filters";
import { DEFAULT_JOIN, Join } from "@/types/enum";
import TagsIncludeExcludeInputWithError from "@/components/form/fields/TagsIncludeExcludeInputWithError";

export interface FiltersProps extends TagsFiltersProps {
  dates?: {
    start: Date;
    end: Date;
  }[];
}

const FormSchema = z.object({
  tagsIn: z.array(z.string()),
  tagsInJoin: z.nativeEnum(Join).optional(),
  tagsOut: z.array(z.string()),
  tagsOutJoin: z.nativeEnum(Join).optional(),

});
type FormSchemaType = z.infer<typeof FormSchema>;

function loadQueryWindow(query?: string) {
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
  window.location.reload();
}

export default function Filters({
  tagsIn = [],
  tagsInJoin = DEFAULT_JOIN,
  tagsOut = [],
  tagsOutJoin = DEFAULT_JOIN,
}: FiltersProps) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { tagsIn, tagsInJoin, tagsOut, tagsOutJoin },
    onSubmit: async (values) => {
      const params = pushFiltersToUrl(values)
      await customRevalidateTag("compare");
      loadQueryWindow(params.toString());
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <div className="flex gap-1 mb-4">
      <TagsIncludeExcludeInputWithError formik={formik} />
      {/* submit */}
      <div className="flex flex-col">
        <label className="w-full">Load</label>
        <Button type="submit" action="positive" className="w-10 h-10 p-2" onClick={() => formik.handleSubmit()}>
          <IoReload size={24} />
        </Button>
      </div>
      {/* clear */}
      <div className="flex flex-col">
        <label className="w-full">Clear</label>
        <Button action="neutral" className="w-10 h-10 p-2" onClick={() => loadQueryWindow()}>
          <IoTrashOutline size={24} />
        </Button>
      </div>
    </div >
  );
}
