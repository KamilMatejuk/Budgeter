'use client';

import TextInputWithError from "@/components/form/TextInputWithError";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { z } from "zod";
import TagsInputWithError from "@/components/form/TagsInputWithError";
import OrganisationsInputWithError from "@/components/form/OrganisationsInputWithError";
import AccountsInputWithError from "@/components/form/AccountsInputWithError";
import Button from "@/components/button/Button";
import { IoReload, IoTrashOutline } from "react-icons/io5";
import { pushFiltersToUrl } from "./utils";

export interface FiltersProps {
  accounts?: string[];
  organisations?: string[];
  tagsIn?: string[];
  tagsOut?: string[];
  title?: string;
}

const FormSchema = z.object({
  accounts: z.array(z.string()),
  organisations: z.array(z.string()),
  tagsIn: z.array(z.string()),
  tagsOut: z.array(z.string()),
  title: z.string().optional(),
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function Filters({ accounts = [], organisations = [], tagsIn = [], tagsOut = [], title = "" }: FiltersProps) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { accounts, organisations, tagsIn, tagsOut, title },
    onSubmit: async (values) => {
      const params = pushFiltersToUrl(values)
      const queryString = params.toString();
      const newUrl = `${window.location.pathname}?${queryString}`;
      window.history.replaceState(null, "", newUrl);
      window.location.reload();
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <div className="flex gap-1 mb-4">
      <div className="flex-1">
        <AccountsInputWithError formik={formik} formikName="accounts" label="Accounts" />
      </div>
      <div className="flex-1">
        <OrganisationsInputWithError formik={formik} formikName="organisations" label="Organisation" />
      </div>
      <div className="flex-1">
        <TagsInputWithError formik={formik} formikName="tagsIn" label="Tags (include)" />
      </div>
      <div className="flex-1">
        <TagsInputWithError formik={formik} formikName="tagsOut" label="Tags (exclude)" />
      </div>
      <div className="flex-1">
        <TextInputWithError formik={formik} formikName="title" label="Title" />
      </div>
      {/* submit */}
      <div className="flex flex-col">
        <label className="w-full">Load</label>
        <Button
          type="submit"
          action="positive"
          className="w-10 h-10 p-2"
          onClick={() => formik.handleSubmit()}
        >
          <IoReload size={24} />
        </Button>
      </div>
      {/* clear */}
      <div className="flex flex-col">
        <label className="w-full">Clear</label>
        <Button
          action="neutral"
          className="w-10 h-10 p-2"
          onClick={() => formik.resetForm({ values: { accounts: [], organisations: [], tagsIn: [], tagsOut: [], title: "" } })}
        >
          <IoTrashOutline size={24} />
        </Button>
      </div>
    </div >
  );
}
