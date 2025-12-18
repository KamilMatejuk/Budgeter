import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { submit } from "./utils";
import { z } from "zod";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { OrganisationWithId } from "@/types/backend";
import { ERROR } from "@/const/message";


const FormSchema = z.object({
  name: requiredText,
  pattern: requiredText,
  icon: requiredText.regex(/^data:image\/.+/, { message: ERROR.imageBase64Format }),
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateOrganisationModal({ url, item, open, onClose }: BackendModalProps<OrganisationWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      pattern: item?.pattern || "",
      icon: item?.icon || "",
    },
    onSubmit: async (values) => await submit<FormSchemaType, OrganisationWithId>(url, values, item?._id, onClose),
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update organisation" : "Create organisation"}>
      <TextInputWithError formik={formik} formikName="pattern" label="Pattern" />
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <TextInputWithError formik={formik} formikName="icon" label="Icon" />
    </Modal>
  );
}
