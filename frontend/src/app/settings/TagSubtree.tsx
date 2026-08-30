'use client';

import DeleteByIdModal from "@/components/modal/delete/DeleteByIdModal";
import { TagWithId } from "@/types/backend";
import { useState } from "react";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { customRevalidateTag } from "../api/fetch";
import UpdateTagModal from "@/components/modal/update/UpdateTagModal";
import { getTextColor } from "@/components/table/cells/CellTag";

export const classes = {
  tag: {
    container: "flex items-center",
    body: "m-1 rounded px-2",
    edit: "cursor-pointer",
    delete: "cursor-pointer",
  },
  lines: {
    horizontal: "h-px w-4 bg-line",
    verical: "w-px h-[calc(100%-15px)] bg-line",
    layout: "ml-8 grid grid-cols-[auto_1fr]"
  },
}

interface TagSubtreeProps {
  allTags: TagWithId[];
  parent: TagWithId;
  first?: boolean;
}

export default function TagSubtree({ parent, allTags, first }: TagSubtreeProps) {
  const [modalOpen, setModalOpen] = useState<"create" | "update" | "delete" | null>(null);
  const closeModal = async () => { setModalOpen(null); customRevalidateTag("tag") };
  const url = "/api/tag";

  const children = allTags.filter((tag) => tag.parent === parent._id);
  const style = { backgroundColor: parent.colour, color: getTextColor(parent.colour) };
  return (
    <div>
      <div className={classes.tag.container}>
        {!first && <div className={classes.lines.horizontal} />}
        <span className={classes.tag.body} style={style}>{parent.name}</span>
        <MdEdit size={20} className={classes.tag.edit} onClick={() => setModalOpen("update")} />
        <MdDelete size={20} className={classes.tag.delete} onClick={() => setModalOpen("delete")} />
        <MdAdd size={20} className={classes.tag.delete} onClick={() => setModalOpen("create")} />
      </div>
      <div className={classes.lines.layout}>
        <div className={classes.lines.verical} />
        <ul>
          {children.map((child) => (
            <li key={child._id}>
              <TagSubtree parent={child} allTags={allTags} />
            </li>
          ))}
        </ul>
      </div>
      {/* modals */}
      {modalOpen === "delete" && <DeleteByIdModal open onClose={closeModal} url={url} item={parent} />}
      {modalOpen === "update" && <UpdateTagModal open onClose={closeModal} url={url} item={parent} />}
      {modalOpen === "create" && <UpdateTagModal open onClose={closeModal} url={url} item={{ parent: parent._id } as TagWithId} />}
    </div>
  );
};
