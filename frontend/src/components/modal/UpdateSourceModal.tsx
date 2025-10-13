import React from "react";
import Modal from "./Modal";
import { submit, UpdateModalProps } from "./UpdateModal";
import { z } from "zod";
import { ERROR } from "@/const/message";
import { Source, SourceWithId } from "@/types/backend";
import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import TextInputWithError from "../form/TextInputWithError";

const required = z.string({ required_error: ERROR.requiredError }).min(1, ERROR.requiredError);
const FormSchema = z.object({
    name: required,
    field_name_card: required,
    field_name_date: required,
    field_name_title: required,
    field_name_organisation: required,
    field_name_value_positive: required,
    field_name_value_negative: required,
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
            <p>Name</p>
            <TextInputWithError formik={formik} formikName="name" />
            <p>CSV field names</p>
            <TextInputWithError formik={formik} formikName="field_name_card" placeholder="card" />
            <TextInputWithError formik={formik} formikName="field_name_date" placeholder="date" />
            <TextInputWithError formik={formik} formikName="field_name_title" placeholder="title" />
            <TextInputWithError formik={formik} formikName="field_name_organisation" placeholder="organisation" />
            <TextInputWithError formik={formik} formikName="field_name_value_positive" placeholder="value (positive)" />
            <TextInputWithError formik={formik} formikName="field_name_value_negative" placeholder="value (negative)" />
        </Modal>
    );
}
