'use client';

import { TagWithId } from "@/types/backend";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import { customRevalidateTag } from "../api/fetch";
import UpdateTagModal from "@/components/modal/update/UpdateTagModal";
import { classes as subTreeClasses } from "./TagSubtree";

export default function NewTagSubtree() {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = async () => { setModalOpen(false); customRevalidateTag("tag") };
  const url = "/api/tag";

  const newTag = `Create new tag`;
  return (
    <div>
      <span className={subTreeClasses.new} onClick={() => setModalOpen(true)}>
        <MdAdd size={20} />{newTag}
      </span>
      {/* modals */}
      {modalOpen && <UpdateTagModal open onClose={closeModal} url={url} item={{} as TagWithId} />}
    </div>
  );
};
