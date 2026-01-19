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
import DateRangeInputWithError from "@/components/form/DateRangeInputWithError";

export interface FiltersProps {
  accounts?: string[];
  organisations?: string[];
  tagsIn?: string[];
  tagsOut?: string[];
  title?: string;
  dateStart?: Date;
  dateEnd?: Date;
}

const FormSchema = z.object({
  accounts: z.array(z.string()),
  organisations: z.array(z.string()),
  tagsIn: z.array(z.string()),
  tagsOut: z.array(z.string()),
  title: z.string().optional(),
  dateStart: z.date().optional(),
  dateEnd: z.date().optional(),
});
type FormSchemaType = z.infer<typeof FormSchema>;

function loadQueryWindow(query?: string) {
  const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState(null, "", newUrl);
  window.location.reload();
}

export default function Filters({ accounts = [], organisations = [], tagsIn = [], tagsOut = [], title = "", dateStart, dateEnd }: FiltersProps) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { accounts, organisations, tagsIn, tagsOut, title, dateStart, dateEnd },
    onSubmit: async (values) => {
      const params = pushFiltersToUrl(values)
      loadQueryWindow(params.toString());
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
      <div className="flex-1">
        <DateRangeInputWithError formik={formik} formikNames={["dateStart", "dateEnd"]} label="Date Range" hidden />
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
