'use client';

import { TagWithId } from "@/types/backend";
import { useState } from "react";
import { MdAdd } from "react-icons/md";
import { customRevalidateTag } from "../api/fetch";
import UpdateTagModal from "@/components/modal/update/UpdateTagModal";

export default function NewTagSubtree() {
  const [modalOpen, setModalOpen] = useState(false);
  const closeModal = async () => { setModalOpen(false); customRevalidateTag("tag") };

  return (
    <div>
      <span className="mt-1 cursor-pointer text-subtext flex text-sm w-fit" onClick={() => setModalOpen(true)}>
        <MdAdd size={20} />
      </span>
      {/* modals */}
      {modalOpen && <UpdateTagModal open onClose={closeModal} url="/api/tag" item={{} as TagWithId} />}
    </div>
  );
};
