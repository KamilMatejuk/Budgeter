import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { OrganisationRichWithId } from "@/types/backend";
import { ERROR } from "@/const/message";
import TagsInputWithError from "@/components/form/fields/TagsInputWithError";
import MultiTextInputWithError from "@/components/form/MultiTextInputWithError";
import { customRevalidateTag } from "@/app/api/fetch";


const FormSchema = z.object({
  name: requiredText,
  patterns: z.array(z.string()).min(1, ERROR.requiredError),
  icon: requiredText.regex(/^data:image\/.+/, { message: ERROR.imageBase64Format }),
  tags: z.array(z.string()),
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateOrganisationModal({ url, item, open, onClose }: BackendModalProps<OrganisationRichWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      patterns: item?.patterns || [],
      icon: item?.icon || "",
      tags: item?.tags.map(tag => tag._id) || [],
    },
    onSubmit: async (values) => {
      await submit<FormSchemaType, OrganisationRichWithId>(url, values, item?._id, onClose);
      await customRevalidateTag("transaction");
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update organisation" : "Create organisation"}>
      <MultiTextInputWithError formik={formik} formikName="patterns" label="Patterns" />
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <TextInputWithError formik={formik} formikName="icon" label="Icon" />
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" />
    </Modal>
  );
}
