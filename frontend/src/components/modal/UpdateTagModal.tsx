import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { Tag, TagWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";
import ColorInputWithError, { requiredColor } from "../form/ColorInputWithError";


export default function UpdateTagModal({ url, item, open, onClose }: UpdateModalProps<Tag>) {
    const editColor = !item.parent;

    const FormSchema = z.object({
        name: requiredText,
        ...(editColor ? { colour: requiredColor } : {})
    });
    type FormSchemaType = z.infer<typeof FormSchema>;
    type SubmitFormSchemaType = FormSchemaType & { parent?: string | null };

    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            ...(editColor ? { colour: item.colour } : {})
        },
        onSubmit: async (values) => {
            if (await submit<SubmitFormSchemaType, TagWithId>(url, { ...FormSchema.parse(values), parent: item.parent }, item?._id)) {
                onClose();
            }
        },
        validate: withZodSchema(FormSchema),
    });

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm} title="Tag">
            <TextInputWithError formik={formik} formikName="name" label="Name" />
            {editColor && <ColorInputWithError formik={formik} formikName="colour" label="Colour" />}
        </Modal>
    );
}
