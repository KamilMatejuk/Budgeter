import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { BudgetRichWithId, BudgetWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import AmountInputWithError, { requiredPositiveAmount } from "../../form/AmountInputWithError";
import TagsInputWithError from "@/components/form/fields/TagsInputWithError";


const FormSchema = z.object({
  name: requiredText,
  tags: z.array(z.string()).nullable(),
  value_pln: requiredPositiveAmount,
});
type FormSchemaType = z.infer<typeof FormSchema>;

const normalizeValues = (values: FormSchemaType) => ({
  ...values,
  tags: values.tags?.filter((tag): tag is string => tag !== null).length
    ? values.tags.filter((tag): tag is string => tag !== null)
    : null,
});

export default function UpdateBudgetModal({ url, item, open, onClose }: BackendModalProps<BudgetRichWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      tags: item?.tags ? item?.tags.map(tag => tag._id) : null,
      value_pln: item?.value_pln || 0,
    },
    onSubmit: async (values) => submit<FormSchemaType, BudgetWithId>(url, normalizeValues(values), item?._id, onClose),
    validate: (values) => withZodSchema(FormSchema)(normalizeValues(values)),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update personal account" : "Create personal account"}>
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" />
      <AmountInputWithError formik={formik} formikName="value_pln" label="Value" />
    </Modal>
  );
}
