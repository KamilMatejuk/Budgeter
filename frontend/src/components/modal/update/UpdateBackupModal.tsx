import React from "react";
import Modal, { BackendModalProps } from "../Modal";
import { z } from "zod";
import { BackupPatchRequest, BackupRequest, BackupResponse } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../../form/TextInputWithError";
import { patch, post } from "@/app/api/fetch";


const FormSchema = z.object({ name: requiredText });
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateBackupModal({ url, item, open, onClose }: BackendModalProps<BackupResponse>) {
  const formik = useFormik<FormSchemaType>({
    initialValues: { name: item?.name || "" },
    onSubmit: async (values) => {
      const method = item ? patch : post;
      const body = item
        ? { prev_name: item?.name, ...values } as BackupPatchRequest
        : { auto: false, ...values } as BackupRequest;
      const { error } = await method(url, body);
      if (!error) return onClose();
      alert(`Error: ${error.message}`);
    },
    validate: withZodSchema(FormSchema),
  });

  return (
    <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Backup">
      <TextInputWithError formik={formik} formikName="name" label="Name" />
    </Modal>
  );
}
