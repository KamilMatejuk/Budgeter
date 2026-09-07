import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { BudgetRichWithId, BudgetWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import AmountInputWithError, { requiredPositiveAmount } from "../../form/AmountInputWithError";
import TagsIncludeExcludeInputWithError from "@/components/form/fields/TagsIncludeExcludeInputWithError";
import { Join } from "@/types/enum";


const FormSchema = z.object({
  name: requiredText,
  description: z.string().optional(),
  value_pln: requiredPositiveAmount,
  tagsIn: z.array(z.string()),
  tagsInJoin: z.nativeEnum(Join).optional(),
  tagsOut: z.array(z.string()),
  tagsOutJoin: z.nativeEnum(Join).optional(),
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateBudgetModal({ url, item, open, onClose }: BackendModalProps<BudgetRichWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      description: item?.description || "",
      value_pln: item?.value_pln || 0,
      tagsIn: item?.tagsIn ? item?.tagsIn.map(tag => tag._id) : [],
      tagsOut: item?.tagsOut ? item?.tagsOut.map(tag => tag._id) : [],
      tagsInJoin: item?.tagsInJoin as Join,
      tagsOutJoin: item?.tagsOutJoin as Join,
    },
    onSubmit: async (values) => submit<FormSchemaType, BudgetWithId>(url, values, item?._id, onClose),
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update personal account" : "Create personal account"}>
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <TextInputWithError formik={formik} formikName="description" label="Description" rows={5} />
      <TagsIncludeExcludeInputWithError formik={formik} layout="vertical" />
      <AmountInputWithError formik={formik} formikName="value_pln" label="Value" />
    </Modal>
  );
}
