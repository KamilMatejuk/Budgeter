import Modal, { BackendModalProps } from "../Modal";
import { patch } from "@/app/api/fetch";
import { TransactionRichWithId } from "@/types/backend";


export default function MarkAsOutlierModal({ url, item, open, onClose }: BackendModalProps<TransactionRichWithId>) {
  async function submit() {
    const body = { _id: item?._id, outlier: !item?.outlier } as Partial<TransactionRichWithId>;
    const { error } = await patch(url, body);
    if (error != null) alert(`Error: ${error}`);
    else onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      cancellable
      onSave={submit}
      title={"Mark transaction as " + (item?.outlier ? "not " : "") + "an outlier"}>
      <p>Are you sure you want to mark {item?._id}?</p>
    </Modal>
  );
}
