"use client";

import ButtonWithLoader from "@/components/button/ButtonWithLoader";
import CreateTransactionModal from "@/components/modal/custom/CreateTransactionModal";
import { useState } from "react";


export default function ManualCreation() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex justify-center items-center w-full min-h-48">
      <ButtonWithLoader
        text="Create"
        onClick={async () => await setOpen(true)}
        action="positive"
      />
      <CreateTransactionModal open={open} onClose={async () => setOpen(false)} url="/api/transaction" />
    </div>
  );
}
