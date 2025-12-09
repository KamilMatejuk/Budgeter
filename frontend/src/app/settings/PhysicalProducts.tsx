import { get } from "../api/fetch";
import { CardWithId, CashWithId } from "@/types/backend";
import ErrorToast from "@/components/toast/ErrorToast";
import TableCash from "@/components/table/tables/TableCash";
import TableCards from "@/components/table/tables/TableCards";

export default async function PhysicalProducts() {
  const { response: cash, error: cashError } = await get<CashWithId[]>("/api/products/cash", ["cash"]);
  const { response: cards, error: cardsError } = await get<CardWithId[]>("/api/products/card", ["card"]);

  return (
    <>
      {cashError
        ? <ErrorToast message={`Could not download cash: ${cashError.message}`} />
        : <TableCash data={cash} />}
      {cardsError
        ? <ErrorToast message={`Could not download cards: ${cardsError.message}`} />
        : <TableCards data={cards} />}
    </>
  );
}
