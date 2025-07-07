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
import { twMerge } from "tailwind-merge";

const classes = {
  form: "w-full h-full min-h-[calc(100vh-5em)] flex flex-col justify-center items-center",
  container: "p-4 bg-second-bg rounded-xl grid grid-cols-4 gap-4",
  column: "flex flex-col gap-1",
  columnDouble: "col-span-2",
  label: "p-1 text-sm text-gray-500",
};

const requiredError = "This field is required";
const nonNegativeError = "This field cannot be negative";
const onlyNumberError = "This field can only contain numbers and letters";
const bothFieldsError = "Both key and value must be filled";
const FormSchema = z.object({
  name: z.string({ required_error: requiredError }).min(1, requiredError),
  field_name_id: z.string(),
  field_name_card: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_date: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_title: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_organisation: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_value_positive: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  field_name_value_negative: z
    .string({ required_error: requiredError })
    .min(1, requiredError),
  starting_amount: z
    .string({ required_error: requiredError })
    .min(0, requiredError)
    .transform((val) => parseFloat(val.replace(",", ".")))
    .refine((val) => !isNaN(val), { message: requiredError })
    .refine((val) => val >= 0, { message: nonNegativeError })
    .transform((val) => val.toFixed(2)),
  card_aliases: z.array(
    z
      .object({
        key: z.string().regex(/^[A-Z0-9 ]*$/, onlyNumberError),
        value: z.string(),
      })
      .refine(({ key, value }) => key.trim() !== "" || value.trim() === "", {
        message: bothFieldsError,
        path: ["key"],
      })
      .refine(({ key, value }) => key.trim() === "" || value.trim() !== "", {
        message: bothFieldsError,
        path: ["value"],
      })
  ),
});
type FormSchemaType = z.infer<typeof FormSchema>;

async function sendSource(values: FormSchemaType, source?: Source) {
  const method = source ? patch : post;
  const { error } = await method("/api/source", {
    _id: source?._id,
    name: values.name,
    field_name_id: values.field_name_id,
    field_name_card: values.field_name_card,
    field_name_date: values.field_name_date,
    field_name_title: values.field_name_title,
    field_name_organisation: values.field_name_organisation,
    field_name_value_positive: values.field_name_value_positive,
    field_name_value_negative: values.field_name_value_negative,
    starting_amount: parseFloat(values.starting_amount),
    card_aliases: arrayToDict(values.card_aliases || []),
  } as Source);
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

function dictToArray(obj: Record<string, string>) {
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

function arrayToDict(arr: { key: string; value: string }[]) {
  return arr.reduce((acc, { key, value }) => {
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

interface SourceSetupProps {
  source?: Source;
}

export default function SourceSetup({ source }: SourceSetupProps) {
  const router = useRouter();

  async function sendSourceHandler(values: FormSchemaType) {
    if (await sendSource(values, source)) {
      router.push("/import");
    }
  }

  async function deleteSourceHandler() {
    if (source && (await deleteSource(source))) {
      router.push("/import");
    }
  }

  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: source?.name || "",
      field_name_id: source?.field_name_id || "",
      field_name_card: source?.field_name_card || "",
      field_name_date: source?.field_name_date || "",
      field_name_title: source?.field_name_title || "",
      field_name_organisation: source?.field_name_organisation || "",
      field_name_value_positive: source?.field_name_value_positive || "",
      field_name_value_negative: source?.field_name_value_negative || "",
      starting_amount: source?.starting_amount.toFixed(2) || "0.00",
      card_aliases: (source?.card_aliases
        ? dictToArray(source.card_aliases)
        : []
      ).concat([{ key: "", value: "" }]),
    },
    onSubmit: sendSourceHandler,
    validate: withZodSchema(FormSchema),
  });

  return (
    <form
      className={classes.form}
      onSubmit={async () => {
        console.log(formik.values);
        await formik.handleSubmit();
      }}
    >
      <div className={classes.container}>
        <div className={classes.column}>
          <p className={classes.label}>Name</p>
          <TextInputWithError formik={formik} formikName="name" />
          <p className={classes.label}>Starting amount</p>
          <AmountInputWithError formik={formik} formikName="starting_amount" />
        </div>
        <div className={classes.column}>
          <p className={classes.label}>CSV field names</p>
          <TextInputWithError
            formik={formik}
            formikName="field_name_id"
            placeholder="id"
          />
          <TextInputWithError
            formik={formik}
            formikName="field_name_card"
            placeholder="card"
          />
          <TextInputWithError
            formik={formik}
            formikName="field_name_date"
            placeholder="date"
          />
          <TextInputWithError
            formik={formik}
            formikName="field_name_title"
            placeholder="title"
          />
          <TextInputWithError
            formik={formik}
            formikName="field_name_organisation"
            placeholder="organisation"
          />
          <TextInputWithError
            formik={formik}
            formikName="field_name_value_positive"
            placeholder="value (positive)"
          />
          <TextInputWithError
            formik={formik}
            formikName="field_name_value_negative"
            placeholder="value (negative)"
          />
        </div>
        <div className={twMerge(classes.column, classes.columnDouble)}>
          <p className={classes.label}>Card aliases</p>
          {formik.values.card_aliases?.map((_, index) => (
            <div
              key={`alias-${index}-key`}
              className="grid grid-cols-[2fr_1fr]"
            >
              <TextInputWithError
                formik={formik}
                formikName={`card_aliases[${index}].key`}
                placeholder="card number"
              />
              <TextInputWithError
                formik={formik}
                formikName={`card_aliases[${index}].value`}
                placeholder="alias"
              />
            </div>
          ))}
          <ButtonWithLoader
            onClick={async () => {
              formik.setFieldValue("card_aliases", [
                ...formik.values.card_aliases,
                { key: "", value: "" },
              ]);
            }}
            text="+"
            className="w-fit"
          />
        </div>
        <div className="mt-4 w-full gap-2 col-span-3 flex">
          <ButtonWithLoader
            onClick={formik.submitForm}
            text="Save"
            className="flex-1"
          />
          {source && (
            <ButtonWithLoader
              onClick={deleteSourceHandler}
              text="Delete"
              destructive
              className="flex-1"
            />
          )}
        </div>
      </div>
    </form>
  );
}
