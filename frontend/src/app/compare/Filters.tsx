'use client';

import { requiredText } from "@/components/form/TextInputWithError";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { z } from "zod";
import Button from "@/components/button/Button";
import { IoReload, IoTrashOutline } from "react-icons/io5";
import { pushFiltersToUrl } from "./utils";
import { customRevalidateTag } from "../api/fetch";
import UsedTagInputWithError from "@/components/form/fields/UsedTagInputWithError";

export interface FiltersProps {
  tagIn?: string;
  tagOut?: string;
  dates?: {
    start: Date;
    end: Date;
  }[];
}

const FormSchema = z.object({
  tagIn: requiredText,
  tagOut: z.string().optional()
});
type FormSchemaType = z.infer<typeof FormSchema>;

function loadQueryWindow(query?: string) {
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
  window.location.reload();
}

export default function Filters({ tagIn = "", tagOut = "" }: FiltersProps) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { tagIn, tagOut },
    onSubmit: async (values) => {
      const params = pushFiltersToUrl(values)
      await customRevalidateTag("compare");
      loadQueryWindow(params.toString());
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <div className="flex gap-1 mb-4">
      <div className="flex-1">
        <UsedTagInputWithError formik={formik} formikName="tagIn" label="Tag (include)" />
      </div>
      <div className="flex-1">
        <UsedTagInputWithError formik={formik} formikName="tagOut" label="Tag (exclude)" />
      </div>
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
