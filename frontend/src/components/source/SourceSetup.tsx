"use client";

import { Source } from "@/types/backend";
import { useFormik } from "formik";
import { z } from "zod";
import TextInputWithError from "../form/TextInputWithError";
import { withZodSchema } from "formik-validator-zod";
import AmountInputWithError from "../form/AmountInputWithError";
import ButtonWithLoader from "../button/ButtonWithLoader";
import { del, patch, post } from "@/app/api/fetch";
import { useRouter } from "next/navigation";

const requiredError = "This field is required";
const nonNegativeError = "Amount cannot be negative";
const FormSchema = z.object({
  name: z.string({ required_error: requiredError }).min(1, requiredError),
  field_name_id: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_date: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_title: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_shop: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_value: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  starting_amount: z
    .string({ required_error: requiredError })
    .min(0, requiredError)
    .transform((val) => parseFloat(val.replace(",", ".")))
    .refine((val) => !isNaN(val), { message: requiredError })
    .refine((val) => val >= 0, { message: nonNegativeError })
    .transform((val) => val.toFixed(2)),
});
type FormSchemaType = z.infer<typeof FormSchema>;

async function sendSource(values: FormSchemaType, source?: Source) {
  const method = source ? patch : post;
  const { error } = await method("/api/source", {
    _id: source?._id,
    name: values.name,
    field_name_id: values.field_name_id,
    field_name_date: values.field_name_date,
    field_name_title: values.field_name_title,
    field_name_shop: values.field_name_shop,
    field_name_value: values.field_name_value,
    starting_amount: values.starting_amount,
  });
  if (!error) return true;
  console.error("Error saving source:", error);
  alert("Failed to save source. Please try again.");
}

async function deleteSource(source: Source) {
  if (!confirm("Are you sure you want to delete this source?")) return;
  const { error } = await del(`/api/source/${source._id}`);
  if (!error) return true;
  console.error("Error deleting source:", error);
  alert("Failed to delete source. Please try again.");
}

interface SourceSetupProps {
  source?: Source;
}
export default function SourceSetup({ source }: SourceSetupProps) {
  const router = useRouter();

  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: source?.name || "",
      field_name_id: source?.field_name_id || "",
      field_name_date: source?.field_name_date || "",
      field_name_title: source?.field_name_title || "",
      field_name_shop: source?.field_name_shop || "",
      field_name_value: source?.field_name_value || "",
      starting_amount: source?.starting_amount.toFixed(2) || "0.00",
    },
    onSubmit: async (values: FormSchemaType) => {
      if (await sendSource(values, source)) {
        router.push("/import");
      }
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <form
      className="w-full h-full min-h-[calc(100vh-5em)] flex flex-col justify-center items-center"
      onSubmit={formik.handleSubmit}
    >
      <div className="p-4 bg-second-bg rounded-xl flex flex-col">
        <p className="p-1">Name</p>
        <TextInputWithError formik={formik} formikName="name" />
        <p className="p-1">CSV field name of id</p>
        <TextInputWithError formik={formik} formikName="field_name_id" />
        <p className="p-1">CSV field name of date</p>
        <TextInputWithError formik={formik} formikName="field_name_date" />
        <p className="p-1">CSV field name of title</p>
        <TextInputWithError formik={formik} formikName="field_name_title" />
        <p className="p-1">CSV field name of shop</p>
        <TextInputWithError formik={formik} formikName="field_name_shop" />
        <p className="p-1">CSV field name of value</p>
        <TextInputWithError formik={formik} formikName="field_name_value" />
        <p className="p-1">Starting amount</p>
        <AmountInputWithError formik={formik} formikName="starting_amount" />
        <div className="mt-4 w-full gap-2 flex flex-col">
          <ButtonWithLoader onClick={formik.submitForm} text="Save" />
          {source && (
            <ButtonWithLoader
              onClick={async () => {
                if (await deleteSource(source)) {
                  router.push("/import");
                }
              }}
              text="Delete"
              destructive
            />
          )}
        </div>
      </div>
    </form>
  );
}
