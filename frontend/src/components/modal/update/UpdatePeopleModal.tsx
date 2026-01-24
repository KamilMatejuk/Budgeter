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
import { personIcon } from "@/app/settings/Organisations";


const FormSchema = z.object({
  name: requiredText,
  patterns: z.array(z.string()).min(1, ERROR.requiredError),
  tags: z.array(z.string()),
});
type FormSchemaType = z.infer<typeof FormSchema>;
type SubmitFormSchemaType = FormSchemaType & { icon: string };


export default function UpdatePeopleModal({ url, item, open, onClose }: BackendModalProps<OrganisationRichWithId>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: {
      name: item?.name || "",
      patterns: item?.patterns || [],
      tags: item?.tags.map(tag => tag._id) || [],
    },
    onSubmit: async (values) => {
      await submit<SubmitFormSchemaType, OrganisationRichWithId>(url, {...values, icon: personIcon}, item?._id, onClose);
      await customRevalidateTag("transaction");
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title={item ? "Update person" : "Create person"}>
      <MultiTextInputWithError formik={formik} formikName="patterns" label="Patterns" />
      <TextInputWithError formik={formik} formikName="name" label="Name" />
      <TagsInputWithError formik={formik} formikName="tags" label="Tags" />
    </Modal>
  );
}
