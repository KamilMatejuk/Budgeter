import React, { useEffect } from "react";
import { MultiInputWithErrorProps } from "../InputWithError";
import { useUsedTags } from "@/app/api/query";
import ChoiceInputWithError from "../ChoiceInputWithError";
import { DEFAULT_JOIN, Join } from "@/types/enum";
import UsedTagsInputWithError from "./UsedTagInputWithError";
import { TagRichWithId } from "@/types/backend";


type TagsIncludeExcludeFormType = {
  tagsIn?: string[];
  tagsOut?: string[];
  tagsInJoin?: Join;
  tagsOutJoin?: Join;
};

// label is "Tags"
// formikNames are "tagsIn", "tagsOut", "tagsInJoin", "tagsOutJoin"
interface TagsIncludeExcludeInputWithErrorProps<T> extends Omit<MultiInputWithErrorProps<T>, "formikNames" | "label"> { }


function getSiblingsAndParentOfOtherTag(allTags: TagRichWithId[], possibleOtherTags?: string[]) {
  const tagsIn: TagRichWithId[] = (possibleOtherTags || []).map(t => allTags.find(tag => tag._id === t)).filter(t => t !== undefined);
  const other = tagsIn.find(t => t.name.endsWith("Other"));
  if (!other) return { other: null, parent: null, siblings: [] };
  const parent = allTags.find(t => t.name === other.name.replace("/Other", ""));
  if (!parent) return { other: null, parent: null, siblings: [] };
  const siblings = allTags.filter(t => t.name.startsWith(`${parent.name}/`) && t.name != other.name);
  return { other: other._id, parent: parent._id, siblings: siblings.map(t => t._id) };
}

function addTagsToListIfNotExists(tagIds: string[], list?: string[]) {
  if (!list) return tagIds;
  return Array.from(new Set([...(list), ...tagIds]));
}

export default function TagsIncludeExcludeInputWithError<T extends TagsIncludeExcludeFormType>({ formik }: TagsIncludeExcludeInputWithErrorProps<T>) {
  const tags = useUsedTags();

  // include other -> include parent and exclude children
  useEffect(() => {
    const { other, parent, siblings } = getSiblingsAndParentOfOtherTag(tags, formik.values.tagsIn);
    if (!other || !parent) return;
    formik.setFieldValue("tagsIn", addTagsToListIfNotExists([parent], formik.values.tagsIn).filter(t => t !== other));
    formik.setFieldValue("tagsOut", addTagsToListIfNotExists(siblings, formik.values.tagsOut));
  }, [formik.values.tagsIn]);

  // exclude other -> include children and exclude parent
  useEffect(() => {
    const { other, parent, siblings } = getSiblingsAndParentOfOtherTag(tags, formik.values.tagsOut);
    if (!other || !parent) return;
    formik.setFieldValue("tagsOut", addTagsToListIfNotExists([parent], formik.values.tagsOut).filter(t => t !== other));
    formik.setFieldValue("tagsIn", addTagsToListIfNotExists(siblings, formik.values.tagsIn));
  }, [formik.values.tagsOut]);

  // remove repeating
  useEffect(() => {
    const tagsInSet = new Set(formik.values.tagsIn || []);
    const tagsOutSet = new Set(formik.values.tagsOut || []);
    const intersection = Array.from(tagsInSet).filter(t => tagsOutSet.has(t));
    if (intersection.length === 0) return;
    formik.setFieldValue("tagsIn", (formik.values.tagsIn || []).filter(t => !tagsOutSet.has(t)));
    formik.setFieldValue("tagsOut", (formik.values.tagsOut || []).filter(t => !tagsInSet.has(t)));
  }, [formik.values.tagsIn, formik.values.tagsOut]);

  // set join to default if less than 2 tags
  useEffect(() => {
    if (formik.values.tagsIn && formik.values.tagsIn.length < 2)
      formik.setFieldValue("tagsInJoin", DEFAULT_JOIN)
  }, [formik.values.tagsIn]);
  useEffect(() => {
    if (formik.values.tagsOut && formik.values.tagsOut.length < 2)
      formik.setFieldValue("tagsOutJoin", DEFAULT_JOIN)
  }, [formik.values.tagsOut]);



  return (
    <div className="w-full grid grid-cols-2 gap-1">
      <div className="gap-1 flex flex-col">
        <UsedTagsInputWithError formik={formik} formikName="tagsIn" label="Tags (include)" />
        {formik.values.tagsIn && formik.values.tagsIn.length >= 2 &&
          <ChoiceInputWithError formik={formik} formikName="tagsInJoin" options={Join} />}
      </div>
      <div className="gap-1 flex flex-col">
        <UsedTagsInputWithError formik={formik} formikName="tagsOut" label="Tags (exclude)" />
        {formik.values.tagsOut && formik.values.tagsOut.length >= 2 &&
          <ChoiceInputWithError formik={formik} formikName="tagsOutJoin" options={Join} />}
      </div>
    </div>
  );
}
