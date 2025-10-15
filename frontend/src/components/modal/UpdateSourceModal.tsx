import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { Source, SourceWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError, { requiredText } from "../form/TextInputWithError";


const FormSchema = z.object({
    name: requiredText,
    field_name_card: requiredText,
    field_name_date: requiredText,
    field_name_title: requiredText,
    field_name_organisation: requiredText,
    field_name_value_positive: requiredText,
    field_name_value_negative: requiredText,
});
type FormSchemaType = z.infer<typeof FormSchema>;


export default function UpdateSourceModal({ url, item, open, onClose }: UpdateModalProps<Source>) {
    const formik = useFormik<FormSchemaType>({
        initialValues: {
            name: item.name || "",
            field_name_card: item.field_name_card || "",
            field_name_date: item.field_name_date || "",
            field_name_title: item.field_name_title || "",
            field_name_organisation: item.field_name_organisation || "",
            field_name_value_positive: item.field_name_value_positive || "",
            field_name_value_negative: item.field_name_value_negative || "",
        },
        onSubmit: async (values) => { if (await submit<FormSchemaType, SourceWithId>(url, values, item?._id)) onClose(); },
        validate: withZodSchema(FormSchema),
    });

    return (
        <Modal open={open} onClose={onClose} cancellable onSave={formik.submitForm}>
            <TextInputWithError formik={formik} formikName="name" label="Name" />
            <TextInputWithError formik={formik} formikName="field_name_card" placeholder="card" label="CSV field names"/>
            <TextInputWithError formik={formik} formikName="field_name_date" placeholder="date" />
            <TextInputWithError formik={formik} formikName="field_name_title" placeholder="title" />
            <TextInputWithError formik={formik} formikName="field_name_organisation" placeholder="organisation" />
            <TextInputWithError formik={formik} formikName="field_name_value_positive" placeholder="value (positive)" />
            <TextInputWithError formik={formik} formikName="field_name_value_negative" placeholder="value (negative)" />
        </Modal>
    );
}
