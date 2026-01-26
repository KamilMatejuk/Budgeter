'use client';

import TextInputWithError from "@/components/form/TextInputWithError";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { z } from "zod";
import OrganisationsInputWithError from "@/components/form/fields/OrganisationsInputWithError";
import AccountsInputWithError from "@/components/form/fields/AccountsInputWithError";
import Button from "@/components/button/Button";
import { IoReload, IoTrashOutline } from "react-icons/io5";
import { pushFiltersToUrl } from "./utils";
import { customRevalidateTag } from "../api/fetch";
import { DEFAULT_JOIN, Join } from "@/types/enum";
import DateMonthRangeInputWithError from "@/components/form/DateMonthRangeInputWithError";
import TagsIncludeExcludeInputWithError from "@/components/form/fields/TagsIncludeExcludeInputWithError";

export interface TagsFiltersProps {
  tagsIn?: string[];
  tagsInJoin?: Join;
  tagsOut?: string[];
  tagsOutJoin?: Join;
}

export interface FiltersProps extends TagsFiltersProps {
  accounts?: string[];
  organisations?: string[];
  title?: string;
  dateStart?: Date;
  dateEnd?: Date;
}

const FormSchema = z.object({
  accounts: z.array(z.string()),
  organisations: z.array(z.string()),
  tagsIn: z.array(z.string()),
  tagsInJoin: z.nativeEnum(Join).optional(),
  tagsOut: z.array(z.string()),
  tagsOutJoin: z.nativeEnum(Join).optional(),
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

export default function Filters({
  accounts = [],
  organisations = [],
  tagsIn = [],
  tagsInJoin = DEFAULT_JOIN,
  tagsOut = [],
  tagsOutJoin = DEFAULT_JOIN,
  title = "",
  dateStart,
  dateEnd
}: FiltersProps) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { accounts, organisations, tagsIn, tagsInJoin, tagsOut, tagsOutJoin, title, dateStart, dateEnd },
    onSubmit: async (values) => {
      const params = pushFiltersToUrl(values)
      await customRevalidateTag("filtered");
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
      <div className="flex-2">
        <TagsIncludeExcludeInputWithError formik={formik} />
      </div>
      <div className="flex-1">
        <TextInputWithError formik={formik} formikName="title" label="Title" />
      </div>
      <div className="flex-1">
        <DateMonthRangeInputWithError formik={formik} formikNames={["dateStart", "dateEnd"]} label="Date Range" />
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
