import ErrorToast from "@/components/toast/ErrorToast";
import TableCash from "@/components/table/tables/TableCash";
import TableCards from "@/components/table/tables/TableCards";
import { getCards, getCash } from "../api/getters";

export default async function PhysicalProducts() {
  const { response: cash, error: cashError } = await getCash();
  const { response: cards, error: cardsError } = await getCards();

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
